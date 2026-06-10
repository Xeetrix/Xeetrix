const nodes = ['AI Agent', 'Knowledge Base', 'Lead Management', 'Workflow Automation', 'Business Dashboard'];

export function Hero() {
  return `
    <section class="hero section" id="home">
      <div class="hero-copy">
        <div class="eyebrow">Intelligent Agent Systems for Modern Businesses</div>
        <h1>Build Intelligent AI Agents for Your Business</h1>
        <p>Xeetrix designs and develops AI agent systems, automation workflows, and intelligent software infrastructure for organizations that want to scale smarter.</p>
        <div class="hero-actions" aria-label="Hero calls to action">
          <a class="button button-primary" href="#solutions">Explore Solutions</a>
          <a class="button button-secondary" href="#contact">Talk to Xeetrix</a>
        </div>
      </div>
      <div class="agent-preview" aria-label="AI agent platform visual preview">
        <div class="preview-header">
          <span class="status-dot" aria-hidden="true"></span>
          <span>Agent Network Console</span>
          <strong>Prototype</strong>
        </div>
        <div class="orbital-map">
          <div class="center-node">Xeetrix Core</div>
          ${nodes.map((node, index) => `<div class="orbit-node node-${index + 1}">${node}</div>`).join('')}
        </div>
        <div class="preview-metrics">
          <span>Knowledge routed</span>
          <span>Human handoff ready</span>
          <span>Workflow aware</span>
        </div>
      </div>
    </section>
  `;
}
