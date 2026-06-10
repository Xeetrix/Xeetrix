const useCases = [
  'Student counselling',
  'FAQ answering',
  'Visa guidance',
  'Lead screening',
  'Documentation support',
  'Marketing content support',
  'Internal staff assistant',
] as const;

export function UseCaseSection() {
  return (
    <section className="section use-case-section" id="use-cases">
      <div className="case-copy">
        <span className="eyebrow">First use case</span>
        <h2>First Production Use Case: KNLTC</h2>
        <p>Xeetrix is building an intelligent AI assistant system for KNLTC to support Japan education, language training, visa guidance, student counselling, lead screening, documentation support, and after-arrival assistance.</p>
      </div>
      <article className="case-card">
        <div className="case-card-header">
          <span>Prototype / In development</span>
          <strong>KNLTC AI Agent</strong>
        </div>
        <dl className="case-details">
          <div><dt>Client / Business Unit</dt><dd>KNLTC</dd></div>
          <div><dt>Industry</dt><dd>Japan Education &amp; Visa Consultancy</dd></div>
          <div><dt>Agent Type</dt><dd>Master AI Assistant</dd></div>
        </dl>
        <div className="use-case-list">
          {useCases.map((item) => <span key={item}>{item}</span>)}
        </div>
      </article>
    </section>
  );
}
