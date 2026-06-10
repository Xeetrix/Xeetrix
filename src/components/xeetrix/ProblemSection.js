import { problemCards } from './data.js';
import { SectionHeader } from './SectionHeader.js';

export function ProblemSection() {
  return `
    <section class="section">
      ${SectionHeader({
        kicker: 'Operational friction',
        title: 'Most businesses are still operating manually.',
        description: 'Teams lose momentum when their knowledge, conversations, documents, and follow-ups are spread across disconnected tools.',
      })}
      <div class="problem-grid">
        ${problemCards.map((problem, index) => `
          <article class="compact-card">
            <span class="card-index">0${index + 1}</span>
            <h3>${problem}</h3>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
