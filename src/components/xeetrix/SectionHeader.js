export function SectionHeader({ kicker = '', title, description = '' }) {
  return `
    <div class="section-header">
      ${kicker ? `<span class="eyebrow">${kicker}</span>` : ''}
      <h2>${title}</h2>
      ${description ? `<p>${description}</p>` : ''}
    </div>
  `;
}
