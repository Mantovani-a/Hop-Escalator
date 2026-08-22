import { useState } from 'react';
import DemoHomeLink from '../DemoHomeLink';
import ModuleSidebar from '../ModuleSidebar';
import ThemeToggle from '../ThemeToggle';

const navigationItems = [
  { href: '#/control', route: '/control', icon: '⌂', label: 'Visão Geral' },
  { href: '#/control/occurrences', route: '/control/occurrences', icon: '!', label: 'Ocorrências' },
  { href: '#/control/technicians', route: '/control/technicians', icon: '●', label: 'Técnicos' },
  { href: '#/control/elevators', route: '/control/elevators', icon: '↕', label: 'Elevadores' },
  { href: '#/control/analytics', route: '/control/analytics', icon: '▥', label: 'Análises' },
];

export default function ControlShell({ route, user, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="module-shell">
      <ModuleSidebar module="Control" homeHref="#/control" navigationItems={navigationItems} route={route} profile={{ name: user.name, detail: user.role, avatar: user.avatar, category: 'leadership' }} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="module-workspace control-workspace">
        <header className="module-utility-bar control-utility-bar">
          <button className="module-menu-button control-menu-button" type="button" aria-label="Abrir menu" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>☰</button>
          <div><strong>Central de Operações</strong><span>Visão geral em tempo real</span></div>
          <span className="control-live-status"><span aria-hidden="true">●</span> Atualizado há poucos segundos</span>
          <DemoHomeLink />
          <ThemeToggle compact />
        </header>
        <main className="module-main control-main">{children}</main>
      </div>
    </div>
  );
}
