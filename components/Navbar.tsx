import { navItems } from './data';

export function Navbar() {
  return (
    <header className="navbar" aria-label="Primary navigation">
      <a className="brand-mark" href="#home" aria-label="Xeetrix home">
        <span className="brand-icon" aria-hidden="true">X</span>
        <span>Xeetrix</span>
      </a>
      <nav className="nav-links" aria-label="Main menu">
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>{item.label}</a>
        ))}
      </nav>
      <a className="nav-cta" href="#contact">Start a Project</a>
    </header>
  );
}
