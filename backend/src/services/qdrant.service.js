
import { QdrantClient } from "@qdrant/js-client-rest";
import crypto from "crypto";
import { pipeline } from "@huggingface/transformers";

const VECTOR_SIZE = 384;

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ||
  "onnx-community/all-MiniLM-L6-v2-ONNX";

const collections = [
  "market_insights",
  "competitor_insights",
  "trend_analysis",
  "research_reports"
];

let embeddingPipelinePromise = null;
let collectionsReadyPromise = null;

function qdrant() {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw Object.assign(new Error("Qdrant is not configured"), {
      status: 503
    });
  }

  return new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
  });
}

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = pipeline(
      "feature-extraction",
      EMBEDDING_MODEL
    ).catch(err => {
      embeddingPipelinePromise = null;
      throw err;
    });
  }

  return embeddingPipelinePromise;
}

async function embedding(text) {
  const extractor = await getEmbeddingPipeline();

  const result = await extractor(
    String(text ?? "").slice(0, 4000),
    {
      pooling: "mean",
      normalize: true
    }
  );

  const vector = Array.from(result.data);

  if (
    vector.length !== VECTOR_SIZE ||
    !vector.every(Number.isFinite)
  ) {
    throw new Error(
      `Invalid embedding: expected ${VECTOR_SIZE} finite numbers, got ${vector.length}.`
    );
  }

  return vector;
}

async function createCollection(client, collection) {
  await client.createCollection(collection, {
    vectors: {
      size: VECTOR_SIZE,
      distance: "Cosine"
    }
  });

  console.log(`Qdrant collection ready: ${collection}`);
}

async function setupCollections() {
  const client = qdrant();

  for (const collection of collections) {
    const result = await client.collectionExists(collection);

    const exists =
      typeof result === "boolean"
        ? result
        : result?.exists === true;

    if (!exists) {
      await createCollection(client, collection);
      continue;
    }

    const info = await client.getCollection(collection);
    const configuredVectors = info?.config?.params?.vectors;

    const currentSize =
      typeof configuredVectors?.size === "number"
        ? configuredVectors.size
        : null;

    if (currentSize !== VECTOR_SIZE) {
      const pointCount = info.points_count ?? 0;

      if (pointCount > 0) {
        throw new Error(
          `Collection "${collection}" uses an incompatible vector configuration and contains ${pointCount} points. Migrate its data before changing it.`
        );
      }

      console.log(
        `Recreating empty collection "${collection}" for ${VECTOR_SIZE}-dimensional embeddings.`
      );

      await client.deleteCollection(collection);
      await createCollection(client, collection);
    }
  }
}

export async function ensureCollections() {
  if (!collectionsReadyPromise) {
    collectionsReadyPromise = setupCollections().catch(err => {
      collectionsReadyPromise = null;
      throw err;
    });
  }

  return collectionsReadyPromise;
}

export async function upsertMemory(collection, payload) {
  if (!collections.includes(collection)) {
    throw new Error(`Unsupported Qdrant collection: ${collection}`);
  }

  await ensureCollections();

  const vector = await embedding(
    `${payload.title ?? ""}\n${payload.content ?? ""}`
  );

  const id = crypto.randomUUID();

  await qdrant().upsert(collection, {
    points: [
      {
        id,
        vector,
        payload
      }
    ],
    wait: true
  });

  return id;
}

export async function semanticSearch(
  collection,
  query,
  filter = {},
  limit = 10
) {
  if (!collections.includes(collection)) {
    throw new Error(`Unsupported Qdrant collection: ${collection}`);
  }

  await ensureCollections();

  const vector = await embedding(query);

  return qdrant().search(collection, {
    vector,
    limit,
    filter: Object.keys(filter).length
      ? {
          must: Object.entries(filter).map(([key, value]) => ({
            key,
            match: { value }
          }))
        }
      : undefined
  });
}
