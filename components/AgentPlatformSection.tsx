import { platformFeatures } from './data';
import { SectionHeader } from './SectionHeader';

export function AgentPlatformSection() {
  return (
    <section className="section platform-section" id="agent-platform">
      <div>
        <SectionHeader
          kicker="Platform vision"
          title="Xeetrix Agent Platform"
          description="A modular AI agent infrastructure that can power customer support, counselling, lead qualification, document assistance, internal operations, and marketing workflows from one intelligent system."
        />
      </div>
      <div className="platform-panel">
        <div className="pipeline">
          <span>Knowledge</span>
          <span>Reasoning</span>
          <span>Automation</span>
          <span>Workspace</span>
        </div>
        <div className="platform-features">
          {platformFeatures.map((feature) => (
            <div className="platform-feature" key={feature}>
              <span aria-hidden="true"></span>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
