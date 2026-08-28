import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileAvatar from './ProfileAvatar';

const MIN_ZOOM = 0.72;
const MAX_ZOOM = 1.8;
const DEFAULT_VIEW = { x: 0, y: 0, scale: 0.88 };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const districts = [
  ['Vila Norte', 20, 20, 295, 210],
  ['Centro Cívico', 365, 20, 270, 210],
  ['Jardins do Leste', 685, 20, 295, 210],
  ['Parque Oeste', 20, 280, 295, 165],
  ['Distrito Saúde', 365, 280, 270, 165],
  ['Nova Aurora', 685, 280, 295, 165],
  ['Vale Residencial', 20, 495, 295, 185],
  ['Estação Sul', 365, 495, 270, 185],
  ['Pátio Metropolitano', 685, 495, 295, 185],
];

const blocks = [
  // Vila Norte
  { id: 0, x: 45, y: 65, width: 110, height: 60 },
  { id: 1, x: 175, y: 65, width: 115, height: 60 },
  { id: 2, x: 45, y: 145, width: 110, height: 60 },
  { id: 3, x: 175, y: 145, width: 115, height: 60 },

  // Centro Cívico
  { id: 4, x: 385, y: 65, width: 105, height: 60 },
  { id: 5, x: 510, y: 65, width: 105, height: 60 },
  { id: 6, x: 385, y: 145, width: 105, height: 60 },
  { id: 7, x: 510, y: 145, width: 105, height: 60 },

  // Jardins do Leste
  { id: 8, x: 705, y: 65, width: 115, height: 60 },
  { id: 9, x: 840, y: 65, width: 115, height: 60 },
  { id: 10, x: 705, y: 145, width: 115, height: 60 },
  { id: 11, x: 840, y: 145, width: 115, height: 60 },

  // Parque Oeste
  { id: 12, x: 45, y: 320, width: 110, height: 50 },
  { id: 13, x: 175, y: 320, width: 115, height: 50 },
  { id: 14, x: 45, y: 385, width: 110, height: 45 },
  { id: 15, x: 175, y: 385, width: 115, height: 45 },

  // Distrito Saúde
  { id: 16, x: 385, y: 320, width: 105, height: 50 },
  { id: 17, x: 510, y: 320, width: 105, height: 50 },
  { id: 18, x: 385, y: 385, width: 105, height: 45 },
  { id: 19, x: 510, y: 385, width: 105, height: 45 },

  // Nova Aurora
  { id: 20, x: 705, y: 320, width: 115, height: 50 },
  { id: 21, x: 840, y: 320, width: 115, height: 50 },
  { id: 22, x: 705, y: 385, width: 115, height: 45 },
  { id: 23, x: 840, y: 385, width: 115, height: 45 },

  // Vale Residencial
  { id: 24, x: 45, y: 535, width: 110, height: 55 },
  { id: 25, x: 175, y: 535, width: 115, height: 55 },
  { id: 26, x: 45, y: 605, width: 110, height: 55 },
  { id: 27, x: 175, y: 605, width: 115, height: 55 },

  // Estação Sul
  { id: 28, x: 385, y: 535, width: 105, height: 55 },
  { id: 29, x: 510, y: 535, width: 105, height: 55 },
  { id: 30, x: 385, y: 605, width: 105, height: 55 },
  { id: 31, x: 510, y: 605, width: 105, height: 55 },

  // Pátio Metropolitano
  { id: 32, x: 705, y: 535, width: 115, height: 55 },
  { id: 33, x: 840, y: 535, width: 115, height: 55 },
  { id: 34, x: 705, y: 605, width: 115, height: 55 },
  { id: 35, x: 840, y: 605, width: 115, height: 55 },
];

const roads = [
  ['horizontal', 0, 246, 1000, 24], ['horizontal', 0, 460, 1000, 24],
  ['vertical', 330, 0, 24, 700], ['vertical', 650, 0, 24, 700],
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
