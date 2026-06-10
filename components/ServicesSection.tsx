import { services } from './data';
import { SectionHeader } from './SectionHeader';

export function ServicesSection() {
  return (
    <section className="section">
      <SectionHeader
        kicker="Build scope"
        title="What Xeetrix Builds"
        description="From agent strategy to interfaces and workflow architecture, Xeetrix focuses on practical systems that make organizations more intelligent."
      />
      <div className="services-grid">
        {services.map((service) => (
          <article className="service-card" key={service}>
            <span aria-hidden="true">✦</span>
            <h3>{service}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
