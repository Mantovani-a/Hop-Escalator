import { OPERATION_STATUS } from '../../data/operationStore';

const BarList = ({ items, max }) => (
  <div className="d-grid gap-3 mt-4">
    {items.map((item) => (
      <div key={item.label}>
        <div className="d-flex justify-content-between gap-3 mb-1" style={{ fontSize: '0.74rem' }}>
          <span className="text-capitalize">{item.label}</span>
          <strong style={{ color: 'var(--color-text)' }}>{item.value}</strong>
        </div>
        <span className="d-block overflow-hidden rounded-pill bg-light-subtle" style={{ height: '7px' }}>
          <i className="d-block h-100 rounded-pill bg-primary" style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
        </span>
      </div>
    ))}
  </div>
);

export default function ControlAnalytics({ occurrences }) {
  const severityLabels = ['crítica','alta','atenção','baixa'];
  const active = occurrences.filter((occurrence) => occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED);
  const severity = severityLabels.map((label) => ({ label, value: occurrences.filter((item) => item.priority.classification === label).length }));
  const statuses = Object.values(OPERATION_STATUS).map((label) => ({ label, value: occurrences.filter((item) => item.operationalStatus === label).length }));
  const failures = [
    { label:'Portas e acessos', value: occurrences.filter((item) => /porta/i.test(item.description)).length },
    { label:'Parada da cabine', value: occurrences.filter((item) => /parad|preso/i.test(item.description)).length },
    { label:'Painéis e comandos', value: occurrences.filter((item) => /painel|botão/i.test(item.description)).length },
    { label:'Energia', value: occurrences.filter((item) => /energia/i.test(item.description)).length },
  ];
  const byClient = Object.values(occurrences.reduce((acc, item) => { const key = item.client.name; acc[key] = acc[key] || { label:key,value:0 }; acc[key].value += 1; return acc; }, {})).sort((a,b) => b.value-a.value).slice(0,5);
  const daily = [18,22,19,27,24,31,active.length];
  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Leitura operacional</p>
          <h1 className="page-header__title">Análises</h1>
        </div>
        <span className="badge app-card text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">Últimos 7 dias</span>
      </header>
      <section className="row g-4 mt-2">
        <div className="col-12 col-md-6 col-xxl-4"><article className="app-card shadow-sm border p-4 h-100" style={{ borderRadius: 'var(--radius-lg)' }}><header className="d-flex align-items-start justify-content-between gap-3 pb-3 border-bottom"><h2 className="fs-6 mb-0">Ocorrências por gravidade</h2><span className="text-secondary" style={{ fontSize: '0.68rem' }}>{occurrences.length} registros</span></header><BarList items={severity} max={Math.max(...severity.map((item) => item.value))} /></article></div>
        <div className="col-12 col-md-6 col-xxl-4"><article className="app-card shadow-sm border p-4 h-100" style={{ borderRadius: 'var(--radius-lg)' }}><header className="d-flex align-items-start justify-content-between gap-3 pb-3 border-bottom"><h2 className="fs-6 mb-0">Ocorrências por status</h2><span className="text-secondary" style={{ fontSize: '0.68rem' }}>Fluxo atual</span></header><BarList items={statuses} max={Math.max(...statuses.map((item) => item.value))} /></article></div>
        <div className="col-12 col-md-6 col-xxl-4"><article className="app-card shadow-sm border p-4 h-100" style={{ borderRadius: 'var(--radius-lg)' }}><header className="d-flex align-items-start justify-content-between gap-3 pb-3 border-bottom"><h2 className="fs-6 mb-0">Falhas mais frequentes</h2><span className="text-secondary" style={{ fontSize: '0.68rem' }}>Classificação textual</span></header><BarList items={failures} max={Math.max(...failures.map((item) => item.value))} /></article></div>
        <div className="col-12 col-md-6 col-xxl-4"><article className="app-card shadow-sm border p-4 h-100" style={{ borderRadius: 'var(--radius-lg)' }}><header className="d-flex align-items-start justify-content-between gap-3 pb-3 border-bottom"><h2 className="fs-6 mb-0">Tempo médio de atendimento</h2><span className="text-secondary" style={{ fontSize: '0.68rem' }}>Dado demonstrativo</span></header><div className="d-flex flex-column align-items-center justify-content-center text-center mt-4" style={{ minHeight: '210px' }}><strong style={{ color: 'var(--color-text)', fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 800, lineHeight: 1 }}>1h 14min</strong><span className="text-secondary mt-3" style={{ fontSize: '0.86rem' }}>−8 min em relação à semana anterior</span></div></article></div>
        <div className="col-12 col-md-6 col-xxl-4"><article className="app-card shadow-sm border p-4 h-100" style={{ borderRadius: 'var(--radius-lg)' }}><header className="d-flex align-items-start justify-content-between gap-3 pb-3 border-bottom"><h2 className="fs-6 mb-0">Locais com mais ocorrências</h2><span className="text-secondary" style={{ fontSize: '0.68rem' }}>Top 5</span></header><BarList items={byClient} max={Math.max(...byClient.map((item) => item.value))} /></article></div>
        <div className="col-12 col-md-6 col-xxl-4"><article className="app-card shadow-sm border p-4 h-100" style={{ borderRadius: 'var(--radius-lg)' }}><header className="d-flex align-items-start justify-content-between gap-3 pb-3 border-bottom"><h2 className="fs-6 mb-0">Evolução de chamados</h2><span className="text-secondary" style={{ fontSize: '0.68rem' }}>Últimos 7 dias</span></header><div className="d-flex align-items-end justify-content-between gap-1 mt-4 pt-2" style={{ height: '210px' }} aria-label="Chamados nos últimos sete dias">{daily.map((value,index) => <div className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%', gap: 'var(--space-2)' }} key={`${index}-${value}`}><i className="w-100 bg-primary opacity-75 rounded-top mt-auto" style={{ height:`${(value/Math.max(...daily))*100}%`, maxWidth: '28px' }} /><span className="text-secondary" style={{ fontSize: '0.68rem', fontWeight: 700 }}>{['S','T','Q','Q','S','S','D'][index]}</span></div>)}</div></article></div>
      </section>
    </>
  );
}
