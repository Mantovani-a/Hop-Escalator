import { useState } from 'react';

export const elevatorRegions = [
  { id: 'machine', label: 'Máquina de tração' },
  { id: 'pulleys', label: 'Polias' },
  { id: 'belts', label: 'Cintas / cabos' },
  { id: 'governor', label: 'Governador de velocidade' },
  { id: 'control', label: 'Quadro de controle' },
  { id: 'rails', label: 'Trilhos / guias' },
  { id: 'counterweight', label: 'Contrapeso' },
  { id: 'cabin', label: 'Cabine' },
  { id: 'doorOperator', label: 'Operador de portas' },
  { id: 'doors', label: 'Portas' },
  { id: 'sensors', label: 'Sensores' },
  { id: 'limits', label: 'Fins de curso' },
  { id: 'buffers', label: 'Amortecedores' },
  { id: 'base', label: 'Poço / pit' },
];

export default function Elevator2DModel({ diagnosis, severity }) {
  const suspectedRegions = diagnosis?.suspectedRegions || [];
  const initialRegion = suspectedRegions[0] || 'doors';
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

  return (
    <section className={`app-card elevator-model-card elevator-model-card--${severity}`} aria-labelledby="elevator-model-title">
      <div className="elevator-model-card__heading">
        <div><p className="page-header__subtitle">Representação esquemática</p><h2 className="fs-5" id="elevator-model-title">Modelo 2D do elevador</h2></div>
        <span><i aria-hidden="true" /> Área com possível falha</span>
      </div>
      <p className="elevator-model-card__intro">Selecione um componente para relacioná-lo aos dados do diagnóstico.</p>

      <div className="elevator-model-stage">
        <div className="elevator-schematic" aria-label="Elevador esquemático com regiões interativas">
          {elevatorRegions.map((region) => (
            <button
              className={`elevator-region elevator-region--${region.id}${suspectedRegions.includes(region.id) ? ' is-suspected' : ''}${selectedRegion === region.id ? ' is-selected' : ''}`}
              type="button"
              key={region.id}
              aria-pressed={selectedRegion === region.id}
              onClick={() => setSelectedRegion(region.id)}
            >
              <span>{region.label}</span>
              {suspectedRegions.includes(region.id) && <i aria-label="Relacionado à hipótese preliminar">!</i>}
            </button>
          ))}
          <span className="elevator-schematic__shaft" aria-hidden="true" />
          <span className="elevator-schematic__cable elevator-schematic__cable--left" aria-hidden="true" />
          <span className="elevator-schematic__cable elevator-schematic__cable--right" aria-hidden="true" />
        </div>
      </div>

    </section>
  );
}
