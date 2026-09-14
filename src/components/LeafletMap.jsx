import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import '../styles/map.css';
import ProfileAvatar from './ProfileAvatar';

// Tiles oficiais e 100% livres de marca d'água do OpenStreetMap
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

// SVGs semânticos ultra leves para Estabelecimentos
const getEstablishmentSvg = (category) => {
  switch (category) {
    case 'hospital':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16m-8-8h16"/></svg>`;
    case 'shopping':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
    case 'hotel':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`;
    case 'residential':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'corporate':
    default:
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M10 22v-4h4v4"/></svg>`;
  }
};

// SVG para destino do operador
const getDestinationSvg = () => `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="currentColor" fill-opacity="0.2"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
`;

// SVGs semânticos para Ocorrências
const getOccurrenceSvg = (priorityClass) => {
  if (priorityClass === 'crítica') {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>`;
  }
  if (priorityClass === 'alta' || priorityClass === 'atenção' || priorityClass === 'atencao') {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
};

export default function LeafletMap({
  center = [-23.5587, -46.6500],
  zoom = 12,
  markers = [],
  route = [],
  showFilters = true,
  compact = false,
  ariaLabel = 'Mapa operacional em tempo real da Grande São Paulo',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    technician: true,
    occurrence: true,
    establishment: true,
    destination: true,
  });

  // 1. Inicializa o mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return undefined;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Zoom no canto superior direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Tiles oficiais do OpenStreetMap (100% gratuitos e livres de marca d'água)
    L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Renderiza marcadores com os ícones semânticos e hierarquia visual
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    markers.forEach((marker) => {
      if (visibleLayers[marker.type] === false) return;
      if (marker.lat == null || marker.lng == null) return;

      const tone = marker.tone || 'default';
      const isFeatured = Boolean(marker.featured);
      let pinHtml = '';
      let zIndexOffset = 100;

      // Monta o ícone de acordo com o tipo
      if (marker.type === 'establishment') {
        const catClass = marker.category ? ` cat-${marker.category}` : '';
        const iconSvg = getEstablishmentSvg(marker.category);
        zIndexOffset = 100;

        pinHtml = `
          <div class="hop-marker-pin--establishment${catClass}">
            ${iconSvg}
          </div>
        `;
      } else if (marker.type === 'destination') {
        zIndexOffset = 900;
        pinHtml = `
          <div class="hop-marker-pin--destination">
            ${getDestinationSvg()}
          </div>
        `;
      } else if (marker.type === 'technician') {
        const statusClass = ` dot-${tone}`;
        zIndexOffset = isFeatured ? 800 : 500;

        pinHtml = `
          <div class="hop-marker-pin--technician">
            <div class="hop-tech-avatar-inner">
              ${marker.symbol || 'TEC'}
            </div>
            <span class="hop-tech-status-dot${statusClass}" title="${marker.status || ''}"></span>
          </div>
        `;
      } else if (marker.type === 'occurrence') {
        const toneClass = ` tone-${tone}`;
        const isCritical = tone === 'critica';
        const iconSvg = getOccurrenceSvg(tone);
        zIndexOffset = isCritical ? 1000 : 300;

        pinHtml = `
          <div class="hop-marker-pin--occurrence${toneClass}">
            ${iconSvg}
          </div>
        `;
      }

      // Tooltip flutuante com nome e status
      const tooltipHtml = `
        <div class="hop-leaflet-marker-tooltip">
          <div class="hop-tooltip-badge">
            <span>${marker.typeLabel || ''}</span>
            ${marker.status ? `<span>•</span><span style="font-weight: 700;">${marker.status}</span>` : ''}
          </div>
          <div class="hop-tooltip-name">${marker.label}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-div-icon',
        html: `
          <div class="hop-leaflet-marker hop-leaflet-marker--${marker.type}${isFeatured ? ' is-featured' : ''}">
            ${pinHtml}
            ${tooltipHtml}
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: customIcon,
        zIndexOffset,
      });

      leafletMarker.on('click', () => {
        setSelectedId(marker.id);
        map.panTo([marker.lat, marker.lng], { animate: true, duration: 0.45 });
      });

      leafletMarker.addTo(markersGroup);
    });
  }, [markers, visibleLayers]);

  // 3. Desenha a rota e ajusta o enquadramento se for modo compacto
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    if (route && route.length > 1) {
      // Contorno branco para alto contraste
      L.polyline(route, {
        color: '#ffffff',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);

      // Traçado pontilhado em azul vibrante
      L.polyline(route, {
        color: '#3b82f6',
        weight: 4,
        opacity: 1,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);

      // Enquadramento automático no modo compacto (ex: tela de rota do Operator)
      if (compact) {
        try {
          const bounds = L.latLngBounds(route);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
        } catch {
          // Ignora caso os bounds não sejam calculáveis
        }
      }
    }
  }, [route, compact]);

  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom, { animate: true });
    setSelectedId(null);
  }, [center, zoom]);

  const selectedMarker = useMemo(
    () => markers.find((m) => m.id === selectedId),
    [markers, selectedId]
  );

  return (
    <div className={`leaflet-map-wrapper city-map${showAllLabels ? ' show-all-labels' : ''}`}>
      {showFilters && (
        <div className="city-map__filters d-flex flex-wrap align-items-center gap-2" aria-label="Camadas do mapa">
          {[
            ['technician', 'Técnicos (12)'],
            ['occurrence', 'Ocorrências (16)'],
            ['establishment', 'Estabelecimentos (10)'],
          ].map(([type, label]) => (
            <button
              key={type}
              className={visibleLayers[type] ? 'is-active' : ''}
              type="button"
              aria-pressed={visibleLayers[type]}
              onClick={() =>
                setVisibleLayers((current) => ({
                  ...current,
                  [type]: !current[type],
                }))
              }
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            className={`btn btn-sm ${showAllLabels ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}
            onClick={() => setShowAllLabels((prev) => !prev)}
            title="Alternar exibição de todos os nomes"
          >
            {showAllLabels ? 'Ocultar nomes' : 'Exibir nomes'}
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary ms-auto"
            style={{ borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}
            onClick={handleRecenter}
          >
            Recentrar São Paulo
          </button>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className={`leaflet-map-container${compact ? ' leaflet-map-container--compact' : ''}`}
        role="region"
        aria-label={ariaLabel}
        tabIndex="0"
      />

      {selectedMarker && (
        <article className="city-map__popup" aria-live="polite">
          <button
            type="button"
            aria-label="Fechar detalhes do marcador"
            onClick={() => setSelectedId(null)}
          >
            ×
          </button>
          <span>{selectedMarker.typeLabel}</span>
          {selectedMarker.avatar ? (
            <div className="city-map__popup-identity">
              <ProfileAvatar
                name={selectedMarker.avatarName || selectedMarker.label}
                src={selectedMarker.avatar}
                size="sm"
                decorative
              />
              <div>
                <strong>{selectedMarker.label}</strong>
                {selectedMarker.status && <em>{selectedMarker.status}</em>}
              </div>
            </div>
          ) : (
            <>
              <strong>{selectedMarker.label}</strong>
              {selectedMarker.status && <em>{selectedMarker.status}</em>}
            </>
          )}
          <dl>
            {selectedMarker.details?.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
          {selectedMarker.onOpen && (
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              onClick={selectedMarker.onOpen}
            >
              Abrir detalhes
            </button>
          )}
        </article>
      )}

      <div className="city-map__scale">
        Grande São Paulo · Monitoramento Operacional
      </div>
    </div>
  );
}
