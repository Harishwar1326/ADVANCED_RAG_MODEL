const pipelineSteps = [
  {
    title: 'Load Documents',
    description: 'Upload a PDF, TXT, DOC, or DOCX file so the backend can extract text from it.',
    why: 'RAG starts by turning documents into raw text the system can work with.',
  },
  {
    title: 'Clean Text',
    description: 'Normalize whitespace and remove noisy characters before chunking.',
    why: 'Clean text improves chunk quality and retrieval consistency.',
  },
  {
    title: 'Chunk Documents',
    description: 'Split the document into smaller overlapping chunks.',
    why: 'Smaller chunks are easier to embed and retrieve accurately.',
  },
  {
    title: 'Create Embeddings',
    description: 'Convert each chunk into a numeric vector using an embedding model.',
    why: 'Embeddings let us compare chunks and questions by meaning.',
  },
  {
    title: 'Store in Vector DB',
    description: 'Keep the chunk embeddings in the vector store and keep the chunk text searchable for lexical retrieval.',
    why: 'The app now needs both semantic and keyword access for hybrid retrieval.',
  },
  {
    title: 'Rewrite Query',
    description: 'Turn a short or vague user question into a clearer retrieval query.',
    why: 'Query rewriting helps the retriever search for better terms than the original wording.',
  },
  {
    title: 'Hybrid Search',
    description: 'Run semantic search and keyword search side by side, then merge the results.',
    why: 'Hybrid retrieval combines meaning-based matching with exact term matching.',
  },
  {
    title: 'Re-rank Chunks',
    description: 'Sort the merged results again before sending them to the LLM.',
    why: 'Re-ranking pushes the best context to the top so the model sees cleaner evidence.',
  },
];

export default function PipelineOverview() {
  return (
    <section className="surface pipeline-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">RAG workflow</p>
          <h2>What happens behind the scenes</h2>
        </div>
        <p className="panel-copy">
          This demo now shows a more realistic RAG pipeline while staying small enough to study step by step.
        </p>
      </div>

      <div className="pipeline-grid">
        {pipelineSteps.map((step, index) => (
          <article className="pipeline-card" key={step.title}>
            <div className="pipeline-card__index">0{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <span>{step.why}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
