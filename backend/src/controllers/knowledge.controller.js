import KnowledgeMemory from "../models/KnowledgeMemory.js";
import { semanticSearch } from "../services/qdrant.service.js";

export async function listKnowledge(req, res, next) {
  try {
    const { q, collection = "market_insights", industry, geography, tag } = req.query;
    if (q) {
      const qdrant = await semanticSearch(collection, q, industry ? { industry } : {}, Number(req.query.limit || 10)).catch(() => []);
      const local = await KnowledgeMemory.find({ collection, ...(industry && { industry }), ...(geography && { geography }), ...(tag && { tags: tag }) }).sort({ updatedAt: -1 }).limit(20);
      return res.json({ results: local, semantic: qdrant });
    }
    const filter = { ...(collection && { collection }), ...(industry && { industry }), ...(geography && { geography }), ...(tag && { tags: tag }) };
    res.json({ results: await KnowledgeMemory.find(filter).sort({ updatedAt: -1 }).limit(100) });
  } catch (err) {
    next(err);
  }
}

export async function createKnowledge(req, res, next) {
  try {
    const item = await KnowledgeMemory.create(req.body);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}
