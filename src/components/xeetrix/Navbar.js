import { navItems } from './data.js';

export function Navbar() {
  return `
    <header class="navbar" aria-label="Primary navigation">
      <a class="brand-mark" href="#home" aria-label="Xeetrix home">
        <span class="brand-icon" aria-hidden="true">X</span>
        <span>Xeetrix</span>
      </a>
      <nav class="nav-links" aria-label="Main menu">
        ${navItems.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
      </nav>
      <a class="nav-cta" href="#contact">Start a Project</a>
    </header>
  `;
}
