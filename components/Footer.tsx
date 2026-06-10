import { navItems } from './data';

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="brand-mark" href="#home" aria-label="Xeetrix home">
          <span className="brand-icon" aria-hidden="true">X</span>
          <span>Xeetrix</span>
        </a>
        <p>AI Automation &amp; Agent Systems</p>
      </div>
      <nav aria-label="Footer links">
        {navItems.slice(1).map((item) => (
          <a href={item.href} key={item.href}>{item.label}</a>
        ))}
      </nav>
      <p className="copyright">© 2026 Xeetrix. All rights reserved.</p>
    </footer>
  );
}
