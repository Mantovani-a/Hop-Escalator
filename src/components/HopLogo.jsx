import hopLogo from '../assets/logos/hop-logo.png';
import hopControlLogo from '../assets/logos/hop-control-logo.png';
import hopOperatorLogo from '../assets/logos/hop-operator-logo.png';

const optionalShiftLogos = import.meta.glob('../assets/logos/*-shift-logo.png', { eager: true, import: 'default' });
const hopOperatorShiftLogo = optionalShiftLogos['../assets/logos/hop-operator-shift-logo.png'] || hopOperatorLogo;

const logoByVariant = {
  hop: { source: hopLogo, alt: 'HOP' },
  control: { source: hopControlLogo, alt: 'HOP Control' },
  operator: { source: hopOperatorLogo, alt: 'HOP Operator' },
  operatorShift: { source: hopOperatorShiftLogo, alt: 'HOP Operator' },
};

export default function HopLogo({ variant = 'hop', size = 'default', className = '' }) {
  const logo = logoByVariant[variant] || logoByVariant.hop;
  return (
    <span className={`hop-logo hop-logo--${variant} hop-logo--${size}${className ? ` ${className}` : ''}`}>
      <img src={logo.source} alt={logo.alt} />
    </span>
  );
}
