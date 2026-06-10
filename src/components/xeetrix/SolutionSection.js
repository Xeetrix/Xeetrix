import { solutionCards } from './data.js';
import { SectionHeader } from './SectionHeader.js';

export function SolutionSection() {
  return `
    <section class="section" id="solutions">
      ${SectionHeader({
        kicker: 'Xeetrix solutions',
        title: 'Xeetrix turns business knowledge into intelligent systems.',
        description: 'Xeetrix helps businesses convert internal knowledge, workflows, customer communication, and operational processes into AI-powered systems designed for real teams.',
      })}
      <div class="feature-grid">
        ${solutionCards.map(([title, text]) => `
          <article class="feature-card">
            <div class="card-glow" aria-hidden="true"></div>
            <h3>${title}</h3>
            <p>${text}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
