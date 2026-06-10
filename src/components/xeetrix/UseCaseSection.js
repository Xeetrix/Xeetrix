const useCases = [
  'Student counselling',
  'FAQ answering',
  'Visa guidance',
  'Lead screening',
  'Documentation support',
  'Marketing content support',
  'Internal staff assistant',
];

export function UseCaseSection() {
  return `
    <section class="section use-case-section" id="use-cases">
      <div class="case-copy">
        <span class="eyebrow">First use case</span>
        <h2>First Production Use Case: KNLTC</h2>
        <p>Xeetrix is building an intelligent AI assistant system for KNLTC to support Japan education, language training, visa guidance, student counselling, lead screening, documentation support, and after-arrival assistance.</p>
      </div>
      <article class="case-card">
        <div class="case-card-header">
          <span>Prototype / In development</span>
          <strong>KNLTC AI Agent</strong>
        </div>
        <dl class="case-details">
          <div><dt>Client / Business Unit</dt><dd>KNLTC</dd></div>
          <div><dt>Industry</dt><dd>Japan Education &amp; Visa Consultancy</dd></div>
          <div><dt>Agent Type</dt><dd>Master AI Assistant</dd></div>
        </dl>
        <div class="use-case-list">
          ${useCases.map((item) => `<span>${item}</span>`).join('')}
        </div>
      </article>
    </section>
  `;
}
