import { useEffect, useState } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import HopLogo from '../HopLogo';
import ProfileAvatar from '../ProfileAvatar';

export default function OperatorShiftClosed({ onStartShift, isStarting = false, technician }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className={`operator-shift-closed${isStarting ? ' is-starting' : ''}`}>
      <div className="operator-shift-closed__shader-bg" aria-hidden="true">
        <ShaderGradientCanvas
          pointerEvents="none"
          pixelDensity={0.5}
          fov={45}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <ShaderGradient
            animate="on"
            axesHelper="off"
            brightness={0.6}
            cAzimuthAngle={170}
            cDistance={4.41}
            cPolarAngle={70}
            cameraZoom={1}
            color1="#2864ff"
            color2="#000048"
            color3="#0025a9"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="off"
            lightType="3d"
            pixelDensity={0.5}
            positionX={0}
            positionY={0.9}
            positionZ={-0.3}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={45}
            rotationY={0}
            rotationZ={0}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1}
            uFrequency={0}
            uSpeed={0.7}
            uStrength={0.8}
            uTime={0}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>
      <section className="operator-shift-closed__content" aria-labelledby="shift-closed-title">
        <div className="operator-shift-closed__card">
          <div className="operator-shift-closed__logo"><HopLogo variant="operator" size="shift" /></div>
          <div className="operator-shift-closed__body">
            <div className="operator-shift-closed__identity">
              <ProfileAvatar name={technician?.name || 'Técnico de campo'} src={technician?.avatar} size="lg" decorative />
              <div><p>HOP Operator</p><h1 id="shift-closed-title">{technician?.name || 'Técnico de campo'}</h1><span>{technician?.role || 'Técnico de campo'}</span><strong><i aria-hidden="true" /> Fora de turno</strong></div>
            </div>
            <div className="operator-shift-closed__date"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg><time dateTime={now.toISOString()}>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(now)}</time></div>
            <p className="operator-shift-closed__message">Inicie seu turno para acessar a fila e os atendimentos atribuídos.</p>
            <button className="operator-shift-closed__cta" type="button" disabled={isStarting} onClick={onStartShift}><span aria-hidden="true">▶</span>{isStarting ? 'Iniciando turno…' : 'Iniciar turno'}</button>
          </div>
        </div>
      </section>
    </main>
  );
}
