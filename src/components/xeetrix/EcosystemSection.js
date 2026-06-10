import { ecosystemAreas } from './data.js';
import { SectionHeader } from './SectionHeader.js';

export function EcosystemSection() {
  return `
    <section class="section ecosystem-section">
      ${SectionHeader({
        kicker: 'Parent technology ecosystem',
        title: 'Built to support multiple organizations.',
        description: 'Xeetrix is designed as a parent technology ecosystem where each business can have its own intelligent agent, workspace, knowledge base, and automation layer.',
      })}
      <div class="ecosystem-grid">
        ${ecosystemAreas.map((area) => `<div class="ecosystem-card"><span>${area}</span></div>`).join('')}
      </div>
    </section>
  `;
}
