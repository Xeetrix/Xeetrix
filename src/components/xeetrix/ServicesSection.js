import { services } from './data.js';
import { SectionHeader } from './SectionHeader.js';

export function ServicesSection() {
  return `
    <section class="section">
      ${SectionHeader({
        kicker: 'Build scope',
        title: 'What Xeetrix Builds',
        description: 'From agent strategy to interfaces and workflow architecture, Xeetrix focuses on practical systems that make organizations more intelligent.',
      })}
      <div class="services-grid">
        ${services.map((service) => `
          <article class="service-card">
            <span aria-hidden="true">✦</span>
            <h3>${service}</h3>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
