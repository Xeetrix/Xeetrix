import { ecosystemAreas } from './data';
import { SectionHeader } from './SectionHeader';

export function EcosystemSection() {
  return (
    <section className="section ecosystem-section">
      <SectionHeader
        kicker="Parent technology ecosystem"
        title="Built to support multiple organizations."
        description="Xeetrix is designed as a parent technology ecosystem where each business can have its own intelligent agent, workspace, knowledge base, and automation layer."
      />
      <div className="ecosystem-grid">
        {ecosystemAreas.map((area) => (
          <div className="ecosystem-card" key={area}><span>{area}</span></div>
        ))}
      </div>
    </section>
  );
}
