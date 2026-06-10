import { problemCards } from './data';
import { SectionHeader } from './SectionHeader';

export function ProblemSection() {
  return (
    <section className="section">
      <SectionHeader
        kicker="Operational friction"
        title="Most businesses are still operating manually."
        description="Teams lose momentum when their knowledge, conversations, documents, and follow-ups are spread across disconnected tools."
      />
      <div className="problem-grid">
        {problemCards.map((problem, index) => (
          <article className="compact-card" key={problem}>
            <span className="card-index">0{index + 1}</span>
            <h3>{problem}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
