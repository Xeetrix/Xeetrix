import { navItems } from './data.js';

export function Footer() {
  return `
    <footer class="footer">
      <div>
        <a class="brand-mark" href="#home" aria-label="Xeetrix home">
          <span class="brand-icon" aria-hidden="true">X</span>
          <span>Xeetrix</span>
        </a>
        <p>AI Automation &amp; Agent Systems</p>
      </div>
      <nav aria-label="Footer links">
        ${navItems.slice(1).map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
      </nav>
      <p class="copyright">© 2026 Xeetrix. All rights reserved.</p>
    </footer>
  `;
}
