import { AgentPlatformSection } from './components/xeetrix/AgentPlatformSection.js';
import { CTASection } from './components/xeetrix/CTASection.js';
import { EcosystemSection } from './components/xeetrix/EcosystemSection.js';
import { Footer } from './components/xeetrix/Footer.js';
import { Hero } from './components/xeetrix/Hero.js';
import { Navbar } from './components/xeetrix/Navbar.js';
import { ProblemSection } from './components/xeetrix/ProblemSection.js';
import { ServicesSection } from './components/xeetrix/ServicesSection.js';
import { SolutionSection } from './components/xeetrix/SolutionSection.js';
import { UseCaseSection } from './components/xeetrix/UseCaseSection.js';

const root = document.getElementById('root');

root.innerHTML = `
  <div class="site-shell">
    ${Navbar()}
    <main>
      ${Hero()}
      ${ProblemSection()}
      ${SolutionSection()}
      ${AgentPlatformSection()}
      ${UseCaseSection()}
      ${ServicesSection()}
      ${EcosystemSection()}
      ${CTASection()}
    </main>
    ${Footer()}
  </div>
`;
