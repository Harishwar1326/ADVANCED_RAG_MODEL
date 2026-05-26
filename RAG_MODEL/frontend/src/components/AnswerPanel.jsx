function ResultList({ title, items = [], scoreKey, labelKey = 'text', emptyLabel }) {
  return (
    <div className="diagnostic-section">
      <div className="document-list__header">
        <h3>{title}</h3>
        <span>{items.length} chunk(s)</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No results yet.</p>
          <span>{emptyLabel}</span>
        </div>
      ) : (
        <div className="chunk-grid chunk-grid--compact">
          {items.map((chunk) => (
            <article className="chunk-card" key={`${chunk.documentId}-${chunk.chunkIndex}-${title}`}>
              <div className="chunk-card__meta">
                <strong>
                  Chunk {typeof chunk.chunkIndex === 'number' ? chunk.chunkIndex + 1 : '?'}
                </strong>
                <span>
                  {typeof chunk[scoreKey] === 'number' ? chunk[scoreKey].toFixed(3) : '0.000'}
                </span>
              </div>
              <p>{chunk[labelKey]}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnswerPanel({ answer, retrievalResult, loading }) {
  const queryOptimization = retrievalResult?.queryOptimization || null;
  const semanticResults = retrievalResult?.semanticResults || [];
  const keywordResults = retrievalResult?.keywordResults || [];
  const hybridResults = retrievalResult?.hybridResults || [];
  const rerankedChunks = retrievalResult?.rerankedChunks || [];
  const retrievedChunks = retrievalResult?.retrievedChunks || [];

  return (
    <section className="surface answer-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Response</p>
          <h2>Generated answer</h2>
        </div>
        <p className="panel-copy">
          The answer is built from the retrieved context plus the question.
        </p>
      </div>

      <div className="answer-box">
        {loading ? (
          <p>Generating answer...</p>
        ) : answer ? (
          <p>{answer}</p>
        ) : (
          <p>Ask a question to see the generated answer here.</p>
        )}
      </div>

      <div className="diagnostic-section diagnostic-section--query">
        <div className="document-list__header">
          <h3>Query optimization</h3>
          <span>{queryOptimization?.strategy || 'waiting'}</span>
        </div>

        <div className="query-compare">
          <div className="query-card">
            <span>Original query</span>
            <p>{retrievalResult?.question || 'Ask a question to see the original query.'}</p>
          </div>
          <div className="query-card query-card--accent">
            <span>Optimized query</span>
            <p>{queryOptimization?.optimizedQuery || 'The backend will rewrite the query before retrieval.'}</p>
          </div>
        </div>
        {queryOptimization?.note ? <p className="helper-text">{queryOptimization.note}</p> : null}
      </div>

      <ResultList
        title="Semantic search results"
        items={semanticResults}
        scoreKey="semanticScore"
        emptyLabel="Semantic search captures meaning using embeddings."
      />

      <ResultList
        title="Keyword search results"
        items={keywordResults}
        scoreKey="keywordScore"
        emptyLabel="Keyword search captures exact terms and phrases."
      />

      <ResultList
        title="Hybrid merged results"
        items={hybridResults}
        scoreKey="hybridScore"
        emptyLabel="Hybrid retrieval combines semantic and keyword matches."
      />

      <ResultList
        title="Re-ranked chunks"
        items={rerankedChunks}
        scoreKey="rerankScore"
        emptyLabel="Re-ranking sorts the merged results before LLM generation."
      />

      <div className="retrieved-section">
        <div className="document-list__header">
          <h3>Prompt context</h3>
          <span>{retrievedChunks.length} chunk(s) injected into the LLM</span>
        </div>

        {retrievedChunks.length === 0 ? (
          <div className="empty-state">
            <p>No prompt context yet.</p>
            <span>The top reranked chunks will appear here after you ask a question.</span>
          </div>
        ) : (
          <div className="chunk-grid">
            {retrievedChunks.map((chunk) => (
              <article className="chunk-card" key={`${chunk.documentId}-${chunk.chunkIndex}`}>
                <div className="chunk-card__meta">
                  <strong>Chunk {chunk.chunkIndex + 1}</strong>
                  {typeof chunk.rerankScore === 'number' ? <span>{chunk.rerankScore.toFixed(3)} reranked</span> : null}
                </div>
                <p>{chunk.text}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
