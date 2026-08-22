import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileAvatar from './ProfileAvatar';

const MIN_ZOOM = 0.72;
const MAX_ZOOM = 1.8;
const DEFAULT_VIEW = { x: 0, y: 0, scale: 0.88 };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const districts = [
  ['Vila Norte', 45, 55, 285, 190], ['Centro Cívico', 355, 55, 285, 190],
  ['Jardins do Leste', 670, 55, 285, 190], ['Parque Oeste', 45, 275, 285, 180],
  ['Distrito Saúde', 355, 275, 285, 180], ['Nova Aurora', 670, 275, 285, 180],
  ['Vale Residencial', 45, 485, 285, 165], ['Estação Sul', 355, 485, 285, 165],
  ['Pátio Metropolitano', 670, 485, 285, 165],
];

const blocks = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  x: 72 + (index % 7) * 132 + (index % 3) * 5,
  y: 92 + Math.floor(index / 7) * 96,
  width: 72 + (index % 3) * 12,
  height: 42 + (index % 2) * 12,
}));

const roads = [
  ['horizontal', 0, 250, 1000, 22], ['horizontal', 0, 465, 1000, 24],
  ['vertical', 330, 0, 24, 700], ['vertical', 650, 0, 24, 700],
  ['diagonal', 95, 630, 780, 20],
];

const segmentStyle = (start, end) => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  return {
    left: start.x,
    top: start.y,
    width: Math.hypot(deltaX, deltaY),
    transform: `rotate(${Math.atan2(deltaY, deltaX) * 180 / Math.PI}deg)`,
  };
};

export default function CityMap({
  markers = [],
  route = [],
  showFilters = true,
  ariaLabel = 'Mapa operacional da cidade fictícia Nova Aurora',
  compact = false,
  fallback,
}) {
  const [view, setView] = useState(DEFAULT_VIEW);
  const [visibleLayers, setVisibleLayers] = useState({ technician: true, occurrence: true, establishment: true, destination: true });
  const [selectedId, setSelectedId] = useState(null);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const animationFrameRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => () => {
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const scheduleView = useCallback((nextView) => {
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      setView({
        x: clamp(nextView.x, -430, 430),
        y: clamp(nextView.y, -300, 300),
        scale: clamp(nextView.scale, MIN_ZOOM, MAX_ZOOM),
      });
    });
  }, []);

  const zoomBy = useCallback((amount) => {
    setView((current) => ({ ...current, scale: clamp(current.scale + amount, MIN_ZOOM, MAX_ZOOM) }));
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const handleWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      zoomBy(event.deltaY < 0 ? .1 : -.1);
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [zoomBy]);

  const handlePointerDown = (event) => {
    if (event.target.closest('button, .city-map__popup')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...pointersRef.current.values()];
    if (pointers.length === 1) {
      gestureRef.current = { type: 'drag', start: pointers[0], view };
    } else if (pointers.length === 2) {
      gestureRef.current = {
        type: 'pinch',
        distance: Math.hypot(pointers[1].x - pointers[0].x, pointers[1].y - pointers[0].y),
        view,
      };
    }
  };

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId) || !gestureRef.current) return;
    event.preventDefault();
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...pointersRef.current.values()];
    if (pointers.length === 2 && gestureRef.current.type === 'pinch') {
      const distance = Math.hypot(pointers[1].x - pointers[0].x, pointers[1].y - pointers[0].y);
      scheduleView({ ...gestureRef.current.view, scale: gestureRef.current.view.scale * (distance / gestureRef.current.distance) });
      return;
    }
    if (pointers.length === 1 && gestureRef.current.type === 'drag') {
      scheduleView({
        ...gestureRef.current.view,
        x: gestureRef.current.view.x + pointers[0].x - gestureRef.current.start.x,
        y: gestureRef.current.view.y + pointers[0].y - gestureRef.current.start.y,
      });
    }
  };

  const handlePointerEnd = (event) => {
    pointersRef.current.delete(event.pointerId);
    const remainingPointer = [...pointersRef.current.values()][0];
    gestureRef.current = remainingPointer ? { type: 'drag', start: remainingPointer, view } : null;
  };

  const selectedMarker = markers.find((marker) => marker.id === selectedId);
  const visibleMarkers = useMemo(
    () => markers.filter((marker) => visibleLayers[marker.type] !== false),
    [markers, visibleLayers],
  );

  if (!markers.length && fallback) {
    return <div className="city-map-fallback" role="status">{fallback}</div>;
  }

  return (
    <div className={`city-map${compact ? ' city-map--compact' : ''}`}>
      {showFilters && (
        <div className="city-map__filters" aria-label="Camadas do mapa">
          {[
            ['technician', 'Técnicos'], ['occurrence', 'Ocorrências'], ['establishment', 'Estabelecimentos'],
          ].map(([type, label]) => (
            <button key={type} className={visibleLayers[type] ? 'is-active' : ''} type="button" aria-pressed={visibleLayers[type]} onClick={() => setVisibleLayers((current) => ({ ...current, [type]: !current[type] }))}>{label}</button>
          ))}
        </div>
      )}
      <div
        ref={viewportRef}
        className="city-map__viewport"
        role="application"
        aria-label={ariaLabel}
        tabIndex="0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={(event) => {
          const movements = { ArrowLeft: [35, 0], ArrowRight: [-35, 0], ArrowUp: [0, 35], ArrowDown: [0, -35] };
          if (movements[event.key]) {
            event.preventDefault();
            setView((current) => ({ ...current, x: current.x + movements[event.key][0], y: current.y + movements[event.key][1] }));
          }
          if (event.key === '+' || event.key === '=') zoomBy(.1);
          if (event.key === '-') zoomBy(-.1);
        }}
      >
        <div className="city-map__world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
          {districts.map(([label, x, y, width, height]) => <div className="city-map__district" key={label} style={{ left: x, top: y, width, height }}><span>{label}</span></div>)}
          {blocks.map((block) => <span className="city-map__block" key={block.id} style={{ left: block.x, top: block.y, width: block.width, height: block.height }} />)}
          {roads.map(([type, x, y, width, height], index) => <span className={`city-map__road city-map__road--${type}`} key={`${type}-${index}`} style={{ left: x, top: y, width, height }} />)}
          <span className="city-map__avenue-label city-map__avenue-label--one">Avenida Integração</span>
          <span className="city-map__avenue-label city-map__avenue-label--two">Eixo Metropolitano</span>
          {route.slice(0, -1).map((point, index) => <span className="city-map__route" key={`${point.x}-${point.y}-${index}`} style={segmentStyle(point, route[index + 1])} />)}
          {visibleMarkers.map((marker) => (
            <button
              className={`city-map__marker city-map__marker--${marker.type}${marker.tone ? ` tone-${marker.tone}` : ''}${marker.featured ? ' is-featured' : ''}${marker.id === selectedId ? ' is-selected' : ''}`}
              key={marker.id}
              type="button"
              style={{ left: marker.x, top: marker.y }}
              aria-label={`${marker.label}. ${marker.status || ''}`}
              onClick={(event) => { event.stopPropagation(); setSelectedId(marker.id); }}
            >
              <span>{marker.symbol}</span><small>{marker.shortLabel || marker.label}</small>
            </button>
          ))}
        </div>
        <div className="city-map__controls" aria-label="Controles do mapa">
          <button type="button" aria-label="Aumentar zoom" onClick={() => zoomBy(.12)}>+</button>
          <button type="button" aria-label="Diminuir zoom" onClick={() => zoomBy(-.12)}>−</button>
          <button className="city-map__recenter" type="button" onClick={() => setView(DEFAULT_VIEW)}>Recentrar</button>
        </div>
        {selectedMarker && (
          <article className="city-map__popup" aria-live="polite">
            <button type="button" aria-label="Fechar detalhes do marcador" onClick={() => setSelectedId(null)}>×</button>
            <span>{selectedMarker.typeLabel}</span>
            {selectedMarker.avatar ? (
              <div className="city-map__popup-identity">
                <ProfileAvatar name={selectedMarker.avatarName || selectedMarker.label} src={selectedMarker.avatar} size="sm" decorative />
                <div><strong>{selectedMarker.label}</strong>{selectedMarker.status && <em>{selectedMarker.status}</em>}</div>
              </div>
            ) : <><strong>{selectedMarker.label}</strong>{selectedMarker.status && <em>{selectedMarker.status}</em>}</>}
            <dl>{selectedMarker.details?.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>
            {selectedMarker.onOpen && <button className="btn btn-sm btn-outline-primary" type="button" onClick={selectedMarker.onOpen}>Abrir detalhes</button>}
          </article>
        )}
        <div className="city-map__scale">Nova Aurora · mapa demonstrativo</div>
      </div>
    </div>
  );
}
