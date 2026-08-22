import HopLogo from './HopLogo';
import ProfileAvatar from './ProfileAvatar';

export default function ModuleSidebar({
  module,
  homeHref,
  navigationItems,
  route,
  profile,
  open,
  onClose,
  isRouteActive = (currentRoute, itemRoute) => currentRoute === itemRoute,
}) {
  return (
    <>
      <button
        className={`module-backdrop${open ? ' is-open' : ''}`}
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <aside className={`module-sidebar${open ? ' is-open' : ''}`} aria-label={`Navegação principal do HOP ${module}`}>
        <a className="module-sidebar__brand" href={homeHref} aria-label={`Ir para o início do HOP ${module}`} onClick={onClose}>
          <HopLogo variant={module.toLowerCase()} size="sidebar" />
        </a>
        <nav className="module-sidebar__links">
          {navigationItems.map((item) => {
            const active = isRouteActive(route, item.route);
            return (
              <a
                key={item.route}
                href={item.href}
                className={`module-sidebar__link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
              >
                <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="module-sidebar__user">
          <ProfileAvatar name={profile.name} src={profile.avatar} category={profile.category} size="md" className="module-sidebar__avatar" decorative />
          <div><strong>{profile.name}</strong><small>{profile.detail}</small></div>
        </div>
      </aside>
    </>
  );
}
