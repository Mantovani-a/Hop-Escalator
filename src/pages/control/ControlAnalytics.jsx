import { OPERATION_STATUS } from '../../data/operationStore';

const BarList = ({ items, max }) => <div className="control-bar-list">{items.map((item) => <div key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><span className="control-bar-track"><i style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} /></span></div>)}</div>;

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
      <section className="control-page-heading"><div><p className="eyebrow eyebrow--dark">Leitura operacional</p><h1>Análises</h1></div><span className="control-shift">Últimos 7 dias</span></section>
      <section className="control-analytics-grid">
        <article><header><h2>Ocorrências por gravidade</h2><span>{occurrences.length} registros</span></header><BarList items={severity} max={Math.max(...severity.map((item) => item.value))} /></article>
        <article><header><h2>Ocorrências por status</h2><span>Fluxo atual</span></header><BarList items={statuses} max={Math.max(...statuses.map((item) => item.value))} /></article>
        <article><header><h2>Falhas mais frequentes</h2><span>Classificação textual</span></header><BarList items={failures} max={Math.max(...failures.map((item) => item.value))} /></article>
        <article><header><h2>Tempo médio de atendimento</h2><span>Dado demonstrativo</span></header><div className="control-big-number"><strong>1h 14min</strong><span>−8 min em relação à semana anterior</span></div></article>
        <article><header><h2>Locais com mais ocorrências</h2><span>Top 5</span></header><BarList items={byClient} max={Math.max(...byClient.map((item) => item.value))} /></article>
        <article><header><h2>Evolução de chamados</h2><span>Últimos 7 dias</span></header><div className="control-spark-bars" aria-label="Chamados nos últimos sete dias">{daily.map((value,index) => <div key={`${index}-${value}`}><i style={{ height:`${(value/Math.max(...daily))*100}%` }} /><span>{['S','T','Q','Q','S','S','D'][index]}</span></div>)}</div></article>
      </section>
    </>
  );
}
