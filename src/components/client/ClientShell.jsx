import { useState } from 'react';
import DemoHomeLink from '../DemoHomeLink';
import ModuleSidebar from '../ModuleSidebar';
import ThemeToggle from '../ThemeToggle';

const navItems = [
  { href: '#/client', label: 'Início', icon: '⌂', route: '/client' },
  { href: '#/client/support', label: 'Registrar Ocorrência', icon: '✚', route: '/client/support' },
  { href: '#/client/elevators', label: 'Elevadores', icon: '↕', route: '/client/elevators' },
  { href: '#/client/calls', label: 'Chamados', icon: '◎', route: '/client/calls' },
  { href: '#/client/profile', label: 'Perfil', icon: '○', route: '/client/profile' },
];

const isRouteActive = (currentRoute, itemRoute) => {
  if (itemRoute === '/client') return currentRoute === itemRoute;
  if (itemRoute === '/client/support') return currentRoute.startsWith('/client/support');
  if (itemRoute === '/client/calls') return currentRoute === itemRoute || currentRoute.startsWith('/client/call/');
  if (itemRoute === '/client/elevators') return currentRoute === itemRoute;
  return currentRoute === itemRoute;
};

export default function ClientShell({ route, user, establishment, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="module-shell">
      <ModuleSidebar
        module="Client"
        homeHref="#/client"
        navigationItems={navItems}
        route={route}
        profile={{
          name: user.name,
          detail: user.role,
          avatar: user.avatar,
          category: 'clients',
        }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isRouteActive={isRouteActive}
      />
      <div className="module-workspace client-workspace">
        <header className="module-utility-bar client-utility-bar">
          <button
            className="module-menu-button client-menu-button"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          <div className="client-utility-bar__title">
            <strong>HOP Client</strong>
            <span>{establishment?.name || 'Hospital Santa Helena'}</span>
          </div>
          <div className="client-utility-bar__actions">
            <DemoHomeLink />
            <ThemeToggle compact />
          </div>
        </header>
        <main className="module-main client-main">
          <div className="container-fluid px-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
