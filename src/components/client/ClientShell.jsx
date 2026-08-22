import { useState } from 'react';
import DemoHomeLink from '../DemoHomeLink';
import ModuleSidebar from '../ModuleSidebar';
import ThemeToggle from '../ThemeToggle';

const navItems = [
  { href: '#/client', label: 'Início', icon: '⌂', route: '/client' },
  { href: '#/client/elevators', label: 'Elevadores', icon: '↕', route: '/client/elevators' },
  { href: '#/client/calls', label: 'Chamados', icon: '◎', route: '/client/calls' },
  { href: '#/client/profile', label: 'Perfil', icon: '○', route: '/client/profile' },
];

const isRouteActive = (currentRoute, itemRoute) => {
  if (itemRoute === '/client') return currentRoute === itemRoute;
  if (itemRoute === '/client/calls') return currentRoute === itemRoute || currentRoute.startsWith('/client/call/');
  if (itemRoute === '/client/elevators') return currentRoute === itemRoute || currentRoute.startsWith('/client/support/');
  return currentRoute === itemRoute;
};

export default function ClientShell({ route, user, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="module-shell">
      <ModuleSidebar module="Client" homeHref="#/client" navigationItems={navItems} route={route} profile={{ name: user.name, detail: user.role, avatar: user.avatar, category: 'clients' }} open={drawerOpen} onClose={() => setDrawerOpen(false)} isRouteActive={isRouteActive} />
      <div className="module-workspace client-workspace">
        <header className="module-utility-bar client-utility-bar">
          <button className="module-menu-button" type="button" aria-label="Abrir menu" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>☰</button>
          <div><strong>Hospital Santa Helena</strong><span>Gestão de elevadores</span></div>
          <DemoHomeLink />
          <ThemeToggle compact />
        </header>
        <main className="module-main client-main"><div className="container hop-container">{children}</div></main>
      </div>
    </div>
  );
}
