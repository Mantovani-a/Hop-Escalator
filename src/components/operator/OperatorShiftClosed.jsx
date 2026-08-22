import HopLogo from '../HopLogo';
import ThemeToggle from '../ThemeToggle';

export default function OperatorShiftClosed({ onStartShift }) {
  return (
    <main className="operator-shift-closed">
      <div className="operator-shift-closed__theme"><ThemeToggle compact /></div>
      <section className="operator-shift-closed__content" aria-labelledby="shift-closed-title">
        <HopLogo variant="operatorShift" size="shift" />
        <p id="shift-closed-title">Turno encerrado</p>
        <button className="btn btn-primary btn-lg" type="button" onClick={onStartShift}>Iniciar turno</button>
      </section>
    </main>
  );
}
