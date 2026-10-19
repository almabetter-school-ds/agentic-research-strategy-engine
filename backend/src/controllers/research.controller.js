import { z } from "zod";
import EvidenceRecord from "../models/EvidenceRecord.js";
import ResearchJob from "../models/ResearchJob.js";
import ResearchPlan from "../models/ResearchPlan.js";
import Source from "../models/Source.js";
import { plannerAgent, runResearchWorkflow } from "../agents/researchGraph.js";
import { audit } from "../utils/audit.js";

const intakeSchema = z.object({
  question: z.string().min(10),
  industry: z.string().min(2),
  geography: z.string().min(2),
  timeframe: z.string().min(2),
  competitors: z.array(z.string()).default([]),
  outputType: z.enum(["Market Entry Scan", "Competitor Landscape", "Trend Analysis", "Opportunity Assessment", "Proposal Support"])
});

function canReviewAllJobs(user) {
  return user.role === "reviewer" || user.role === "admin";
}

function scopedJobQuery(req, id) {
  return {
    _id: id,
    ...(canReviewAllJobs(req.user) ? {} : { owner: req.user._id })
  };
}

function ownedOrAdminJobQuery(req, id) {
  return {
    _id: id,
    ...(req.user.role === "admin" ? {} : { owner: req.user._id })
  };
}

export async function createResearchJob(req, res, next) {
  try {
    const input = intakeSchema.parse(req.body);

    const job = await ResearchJob.create({
      ...input,
      owner: req.user._id,
      status: "planning",
      currentStep: "Planning",
      progress: 10,
      logs: [
        {
          stage: "Intake",
          message: "Research intake accepted"
        }
      ]
    });

    res.status(201).json({
      job,
      plan: null,
      accepted: true
    });
  } catch (err) {
    next(err);
  }
}

export async function listResearchJobs(req, res, next) {
  try {
    const filter = canReviewAllJobs(req.user) ? {} : { owner: req.user._id };
    const jobs = await ResearchJob.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}

export async function getResearchJob(req, res, next) {
  try {
    const job = await ResearchJob.findOne(scopedJobQuery(req, req.params.id));
    if (!job) throw Object.assign(new Error("Research job not found"), { status: 404 });
    const plan = await ResearchPlan.findOne({ job: job._id });
    const sources = await Source.find({ job: job._id }).sort({ qualityScore: -1 }).limit(200);
    const evidence = await EvidenceRecord.find({ job: job._id }).populate("source").sort({ confidence: -1 }).limit(500);
    res.json({ job, plan, sources, evidence });
  } catch (err) {
    next(err);
  }
}

export async function listEvidence(req, res, next) {
  try {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit || 200)));
    const status = String(req.query.status || "").trim();
    const match = status && ["pending", "approved", "rejected", "flagged"].includes(status)
      ? { validationStatus: status }
      : {};

    const evidence = await EvidenceRecord.find(match)
      .populate("source", "url title publisher sourceType qualityScore")
      .populate("job", "question industry geography status owner")
      .sort({ validationStatus: 1, confidence: -1, updatedAt: -1 })
      .limit(limit);

    const summary = await EvidenceRecord.aggregate([
      { $group: { _id: "$validationStatus", count: { $sum: 1 } } }
    ]);

    res.json({
      evidence,
      summary: summary.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    });
  } catch (err) {
    next(err);
  }
}

export async function createOrRegeneratePlan(req, res, next) {
  try {
    const jobId = req.body.jobId;

    const job = await ResearchJob.findOne(
      ownedOrAdminJobQuery(req, jobId)
    );

    if (!job) {
      throw Object.assign(new Error("Research job not found"), {
        status: 404
      });
    }

    if (job.status !== "planning") {
      throw Object.assign(
        new Error(
          `Cannot regenerate a plan when the job status is "${job.status}".`
        ),
        { status: 409 }
      );
    }

    const plan = await plannerAgent(job);

    await ResearchJob.findByIdAndUpdate(job._id, {
      status: "planning",
      progress: 10,
      currentStep: "Planning",
      $push: {
        logs: {
          stage: "Planning",
          message: "Plan regenerated"
        }
      }
    });

    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

export async function approvePlan(req, res, next) {
  try {
    const job = await ResearchJob.findOne(
      ownedOrAdminJobQuery(req, req.params.jobId)
    ).select("_id status");

    if (!job) {
      throw Object.assign(new Error("Research job not found"), {
        status: 404
      });
    }

    if (job.status !== "planning") {
      throw Object.assign(
        new Error(
          `Cannot approve a plan when the job status is "${job.status}".`
        ),
        { status: 409 }
      );
    }

    const plan = await ResearchPlan.findOneAndUpdate(
      {
        job: job._id,
        status: "draft"
      },
      {
        status: "approved",
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!plan) {
      throw Object.assign(
        new Error("No draft research plan found for approval"),
        { status: 404 }
      );
    }

    await ResearchJob.findByIdAndUpdate(job._id, {
      status: "approved",
      progress: 18,
      currentStep: "Plan Approved",
      $push: {
        logs: {
          stage: "Planning",
          message: "Plan approved for execution"
        }
      }
    });

    await audit({
      actor: req.user._id,
      action: "research.plan.approve",
      entityType: "ResearchPlan",
      entityId: plan._id,
      ip: req.ip
    });

    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

export async function executeApprovedWorkflow(req, res, next) {
  try {
    const job = await ResearchJob.findOne(ownedOrAdminJobQuery(req, req.params.jobId)).select("_id");
    if (!job) throw Object.assign(new Error("Research job not found"), { status: 404 });
    await runResearchWorkflow(req.params.jobId);
    res.json({ message: "Research workflow completed" });
  } catch (err) {
    next(err);
  }
}

export async function reviewEvidence(req, res, next) {
  try {
    const { status } = z.object({ status: z.enum(["approved", "rejected", "flagged"]) }).parse(req.body);
    const evidence = await EvidenceRecord.findByIdAndUpdate(req.params.id, { validationStatus: status, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true });
    if (!evidence) throw Object.assign(new Error("Evidence record not found"), { status: 404 });
    await audit({ actor: req.user._id, action: `evidence.${status}`, entityType: "EvidenceRecord", entityId: evidence._id, ip: req.ip });
    res.json({ evidence });
  } catch (err) {
    next(err);
  }
}

export async function passthroughWorkflowStep(req, res) {
  res.status(202).json({ message: "This workflow step is orchestrated through approved research job execution.", accepted: true });
}
