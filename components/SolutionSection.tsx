import { solutionCards } from './data';
import { SectionHeader } from './SectionHeader';

export function SolutionSection() {
  return (
    <section className="section" id="solutions">
      <SectionHeader
        kicker="Xeetrix solutions"
        title="Xeetrix turns business knowledge into intelligent systems."
        description="Xeetrix helps businesses convert internal knowledge, workflows, customer communication, and operational processes into AI-powered systems designed for real teams."
      />
      <div className="feature-grid">
        {solutionCards.map(([title, text]) => (
          <article className="feature-card" key={title}>
            <div className="card-glow" aria-hidden="true"></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
