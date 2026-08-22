import { useEffect, useState } from 'react';
import ControlPage from './pages/ControlPage';
import OperatorPage from './pages/OperatorPage';
import HomePage from './pages/HomePage';

const routeMap = {
  '/': HomePage,
  '/control': ControlPage,
  '/operator': OperatorPage,
};

const getCurrentRoute = () => window.location.hash.replace('#', '') || '/';

export default function App() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handleRouteChange = () => setRoute(getCurrentRoute());
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  const Page = route.startsWith('/operator')
    ? OperatorPage
    : route.startsWith('/control')
      ? ControlPage
      : (routeMap[route] || HomePage);
  return <Page route={route} />;
}
