import { useState } from 'react';
import DemoHomeLink from '../DemoHomeLink';
import ModuleSidebar from '../ModuleSidebar';
import ThemeToggle from '../ThemeToggle';

const navigationItems = [
  { href: '#/operator', route: '/operator', icon: '⌂', label: 'Início' },
  { href: '#/operator/occurrences', route: '/operator/occurrences', icon: '!', label: 'Ocorrências' },
  { href: '#/operator/history', route: '/operator/history', icon: '↺', label: 'Histórico' },
  { href: '#/operator/profile', route: '/operator/profile', icon: '●', label: 'Perfil' },
];

const isRouteActive = (currentRoute, itemRoute) => {
  if (itemRoute === '/operator') return currentRoute === '/operator';
  if (itemRoute === '/operator/occurrences') return currentRoute.startsWith('/operator/occurrence') || currentRoute.startsWith('/operator/service');
  return currentRoute === itemRoute;
};

export default function OperatorShell({ route, technician, onEndShift, onSimulate, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="module-shell">
      <ModuleSidebar module="Operator" homeHref="#/operator" navigationItems={navigationItems} route={route} profile={{ name: technician.name, detail: technician.employeeId, avatar: technician.avatar, category: 'operators' }} open={drawerOpen} onClose={() => setDrawerOpen(false)} isRouteActive={isRouteActive} />

      <div className="module-workspace operator-workspace">
        <header className="module-utility-bar operator-utility-bar">
          <button className="module-menu-button operator-menu-button" type="button" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <span aria-hidden="true">☰</span><span className="visually-hidden">Abrir menu</span>
          </button>
          <div className="operator-utility-bar__title"><strong>HOP Operator</strong><span>Operação em campo</span></div>
          <div className="operator-utility-bar__actions">
            <button className="btn btn-sm btn-outline-primary" type="button" onClick={onSimulate}>Simular nova ocorrência</button>
            <DemoHomeLink />
            <ThemeToggle compact />
            <button className="btn btn-sm btn-outline-primary operator-end-shift" type="button" onClick={onEndShift}>Encerrar turno</button>
          </div>
        </header>
        <main className="module-main operator-main">{children}</main>
      </div>
    </div>
  );
}
