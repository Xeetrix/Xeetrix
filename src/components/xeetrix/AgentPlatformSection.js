import { platformFeatures } from './data.js';
import { SectionHeader } from './SectionHeader.js';

export function AgentPlatformSection() {
  return `
    <section class="section platform-section" id="agent-platform">
      <div>
        ${SectionHeader({
          kicker: 'Platform vision',
          title: 'Xeetrix Agent Platform',
          description: 'A modular AI agent infrastructure that can power customer support, counselling, lead qualification, document assistance, internal operations, and marketing workflows from one intelligent system.',
        })}
      </div>
      <div class="platform-panel">
        <div class="pipeline">
          <span>Knowledge</span>
          <span>Reasoning</span>
          <span>Automation</span>
          <span>Workspace</span>
        </div>
        <div class="platform-features">
          ${platformFeatures.map((feature) => `
            <div class="platform-feature"><span aria-hidden="true"></span>${feature}</div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
