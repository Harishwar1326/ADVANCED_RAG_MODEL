import { addChunkRecords, listChunksByDocument } from "../vectorstore/index.js";
import { createEmbedding } from "./embeddingService.js";
import { generateAnswer } from "./llmService.js";
import { cleanText, chunkText } from "./textProcessingService.js";
import { getUploadedDocument, updateDocument } from "./documentService.js";
import { traceStep } from "../utils/tracing.js";
import { optimizeQuery } from "./queryOptimizer.js";
import { runHybridSearch } from "./hybridSearch.js";
import { rerankChunks } from "./reranker.js";

function stripEmbedding(record) {
  const { embedding, ...rest } = record;
  return rest;
}

export async function processDocument(documentId) {
  return traceStep("process_document", async () => {
    const document = getUploadedDocument(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Step 1: Clean text so chunking and retrieval see consistent content.
    const cleanedText = cleanText(document.rawText);
    if (!cleanedText) {
      throw new Error("Document text is empty after cleaning");
    }

    // Step 2: Split the document into smaller chunks for retrieval.
    const chunks = chunkText(cleanedText, { chunkSize: 180, overlap: 30 });
    if (chunks.length === 0) {
      throw new Error("Document could not be chunked");
    }

    // Step 3: Turn each chunk into an embedding so we can compare meaning later.
    const chunkRecords = [];
    for (let index = 0; index < chunks.length; index += 1) {
      const chunkTextValue = chunks[index];
      const embedding = await createEmbedding(
        chunkTextValue,
        "RETRIEVAL_DOCUMENT",
      );

      chunkRecords.push({
        documentId,
        documentName: document.originalName,
        chunkIndex: index,
        text: chunkTextValue,
        embedding,
        characterLength: chunkTextValue.length,
      });
    }

    // Step 4: Store chunk embeddings in the vector store.
    const storedChunks = await addChunkRecords(chunkRecords);

    updateDocument(documentId, {
      status: "processed",
      chunkCount: storedChunks.length,
      cleanedText,
    });

    return {
      documentId,
      documentName: document.originalName,
      chunkCount: storedChunks.length,
      message: "Document processed and embeddings stored successfully.",
    };
  });
}

export async function answerQuestion({ question, documentId = null }) {
  return traceStep("answer_question", async () => {
    if (!question || !question.trim()) {
      throw new Error("Question is required");
    }

    // Step 1: Rewrite the question into a clearer retrieval query.
    const queryOptimization = await optimizeQuery(question);

    // Step 2: Convert the optimized query into the same vector space as the document chunks.
    const queryEmbedding = await createEmbedding(
      queryOptimization.optimizedQuery,
      "RETRIEVAL_QUERY",
    );

    // Step 3: Run semantic and keyword retrieval together so we get meaning plus exact term matches.
    const hybridSearchResults = await runHybridSearch({
      optimizedQuery: queryOptimization.optimizedQuery,
      documentId,
      topK: 6,
      queryEmbedding,
    });

    // Step 4: Re-rank the merged results so the best chunks are injected into the LLM prompt.
    const rerankedChunks = await rerankChunks({
      query: queryOptimization.optimizedQuery,
      candidates: hybridSearchResults.mergedResults,
      topK: 4,
    });

    const retrievedChunks = rerankedChunks.slice(0, 3);

    // Step 5: Inject the best chunks into the prompt and generate the final answer.
    const answer = await generateAnswer({
      question: queryOptimization.optimizedQuery,
      retrievedChunks,
    });

    return {
      question,
      queryOptimization,
      answer,
      documentId,
      semanticResults: hybridSearchResults.semanticResults.map(stripEmbedding),
      keywordResults: hybridSearchResults.keywordResults.map(stripEmbedding),
      hybridResults: hybridSearchResults.mergedResults.map(stripEmbedding),
      rerankedChunks: rerankedChunks.map(stripEmbedding),
      retrievedChunks: retrievedChunks.map(stripEmbedding),
    };
  });
}

export async function getChunksForDocument(documentId) {
  return listChunksByDocument(documentId);
}
