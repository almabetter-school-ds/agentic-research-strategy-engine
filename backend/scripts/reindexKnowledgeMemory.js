import "dotenv/config";
import mongoose from "mongoose";
import { QdrantClient } from "@qdrant/js-client-rest";
import { connectMongo } from "../src/utils/db.js";
import KnowledgeMemory from "../src/models/KnowledgeMemory.js";
import { upsertMemory } from "../src/services/qdrant.service.js";

const missingFilter = {
  $or: [
    { qdrantPointId: { $exists: false } },
    { qdrantPointId: null },
    { qdrantPointId: "" }
  ]
};

const limit = Math.max(
  1,
  Number.parseInt(process.env.REINDEX_LIMIT || "5", 10)
);

async function main() {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw new Error("Qdrant environment variables are not configured.");
  }

  await connectMongo();

  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
  });

  const totalMissing = await KnowledgeMemory.countDocuments(missingFilter);

  const records = await KnowledgeMemory.find(missingFilter)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  console.log(`Records awaiting indexing: ${totalMissing}`);
  console.log(`Processing this batch: ${records.length}`);

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const record of records) {
    let pointId = null;

    try {
      const evidenceIds = (record.sourceEvidence || []).map(String);

      const payload = {
        title: record.title,
        content: record.content,
        industry: record.industry,
        geography: record.geography,
        competitors: record.competitors || [],
        tags: record.tags || [],
        evidenceIds,
        knowledgeMemoryId: String(record._id),
        confidence: record.confidence ?? 0.7
      };

      if (evidenceIds.length) {
        payload.evidenceId = evidenceIds[0];
      }

      if (record.report) {
        payload.reportId = String(record.report);
      }

      pointId = await upsertMemory(record.collection, payload);

      // Only set the MongoDB ID after Qdrant confirms the upload.
      const update = await KnowledgeMemory.updateOne(
        { _id: record._id, ...missingFilter },
        { $set: { qdrantPointId: pointId } }
      );

      if (update.modifiedCount !== 1) {
        await qdrant.delete(record.collection, {
          points: [pointId],
          wait: true
        });

        skipped++;
        console.log(`SKIPPED: ${record._id} was updated elsewhere.`);
        continue;
      }

      succeeded++;
      console.log(
        `SUCCESS ${succeeded}/${records.length}: ${record._id} -> ${pointId}`
      );
    } catch (err) {
      // If the upload worked but the MongoDB update failed,
      // remove the unlinked Qdrant point when possible.
      if (pointId) {
        try {
          await qdrant.delete(record.collection, {
            points: [pointId],
            wait: true
          });
        } catch (cleanupError) {
          console.error(
            `Cleanup failed for ${record._id}:`,
            cleanupError.message
          );
          console.error("Orphan point ID:", pointId);
        }
      }

      failed++;
      console.error(`FAILED: ${record._id}: ${err.message}`);
    }
  }

  const remaining = await KnowledgeMemory.countDocuments(missingFilter);

  console.log("\n--- Batch result ---");
  console.log("Succeeded:", succeeded);
  console.log("Failed:", failed);
  console.log("Skipped:", skipped);
  console.log("Records still missing Qdrant point IDs:", remaining);
}

main()
  .catch(err => {
    console.error("Recovery stopped:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
