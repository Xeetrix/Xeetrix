const nodes = ['AI Agent', 'Knowledge Base', 'Lead Management', 'Workflow Automation', 'Business Dashboard'] as const;

export function Hero() {
  return (
    <section className="hero section" id="home">
      <div className="hero-copy">
        <div className="eyebrow">Intelligent Agent Systems for Modern Businesses</div>
        <h1>Build Intelligent AI Agents for Your Business</h1>
        <p>Xeetrix designs and develops AI agent systems, automation workflows, and intelligent software infrastructure for organizations that want to scale smarter.</p>
        <div className="hero-actions" aria-label="Hero calls to action">
          <a className="button button-primary" href="#solutions">Explore Solutions</a>
          <a className="button button-secondary" href="#contact">Talk to Xeetrix</a>
        </div>
      </div>
      <div className="agent-preview" aria-label="AI agent platform visual preview">
        <div className="preview-header">
          <span className="status-dot" aria-hidden="true"></span>
          <span>Agent Network Console</span>
          <strong>Prototype</strong>
        </div>
        <div className="orbital-map">
          <div className="center-node">Xeetrix Core</div>
          {nodes.map((node, index) => (
            <div className={`orbit-node node-${index + 1}`} key={node}>{node}</div>
          ))}
        </div>
        <div className="preview-metrics">
          <span>Knowledge routed</span>
          <span>Human handoff ready</span>
          <span>Workflow aware</span>
        </div>
      </div>
    </section>
  );
}
