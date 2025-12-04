import { PlaneIcon, Skull } from 'lucide-react';
import type { Aircraft } from '../types';
import { findClosestPairs } from '../utils/closestPair';

interface PanelProps {
  aircrafts: Aircraft[];
}

export function Panel({ aircrafts }: PanelProps) {
  const calculateAngle = (dx: number, dy: number): number => {
    const angleInRadians = Math.atan2(dy, dx);
    const angleInDegrees = angleInRadians * (180 / Math.PI);
    return angleInDegrees - 90; // Ajuste para que el avión mire hacia arriba en dirección (0,1)
  };

  const getIconColor = (collisionState: string) => {
    switch (collisionState) {
      case 'warning': return '#FBBF24'; // Amarillo
      case 'danger': return '#EF4444';   // Rojo
      case 'collision': return '#B91C1C'; // Rojo oscuro
      default: return '#2adb36'; // Verde claro
    }
  };

  // Filtrar aviones visibles (opcional: puedes mostrar todos)
  const visibleAircrafts = aircrafts.filter(ac => ac.collisionState !== 'collision');

  // 🔥 Detectar pares más cercanos para resaltar visualmente
  const activeAircrafts = aircrafts.filter(ac => ac.collisionState !== 'collision');
  const { pairs: closestPairs } = findClosestPairs(activeAircrafts);
  const closestPairIds = new Set<string>();
  closestPairs.forEach(([a, b]) => {
    closestPairIds.add(a.id);
    closestPairIds.add(b.id);
  });

  return (
    <section className="flex-1 relative overflow-hidden">
      <div
        className="w-full h-full bg-black relative"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.05) 0%, transparent 70%)',
        }}
      >
        {/* Ejes */}
        <div className="absolute w-full h-[1px] bg-green-500" style={{ top: '50%' }} />
        <div className="absolute h-full w-[1px] bg-green-500" style={{ left: '50%' }} />

        {/* Etiquetas X */}
        {Array.from({ length: 11 }, (_, i) => {
          const value = i * 10;
          return (
            <div
              key={`x-label-${value}`}
              className="absolute text-xs text-green-400 font-mono pointer-events-none"
              style={{ left: `${i * 10}%`, bottom: '0', transform: 'translateX(-50%)' }}
            >
              {value}
            </div>
          );
        })}

        {/* Etiquetas Y */}
        {Array.from({ length: 11 }, (_, i) => {
          const value = i * 10;
          return (
            <div
              key={`y-label-${value}`}
              className="absolute text-xs text-green-400 font-mono pointer-events-none"
              style={{ right: '0', top: `${100 - i * 10}%`, transform: 'translateY(-50%)' }}
            >
              {value}
            </div>
          );
        })}

        {/* 🔴 Dibujar líneas entre pares más cercanos (opcional, pero impactante) */}
        {closestPairs.map(([a, b]) => {
          const x1 = a.x;
          const y1 = 100 - a.y; // inversión por coordenadas CSS
          const x2 = b.x;
          const y2 = 100 - b.y;

          return (
            <div
              key={`line-${a.id}-${b.id}`}
              className="absolute"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <svg
                aria-label='line'
                className="absolute inset-0 w-full h-full"
                style={{ overflow: 'visible' }}
              >
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
              </svg>
            </div>
          );
        })}

        {/* Aviones */}
        {visibleAircrafts.map((aircraft) => {
          const iconColor = getIconColor(aircraft.collisionState);
          const isClosest = closestPairIds.has(aircraft.id); // resaltar

          const xPercent = aircraft.x;
          const yPercent = 100 - aircraft.y;

          return (
            <div
              key={aircraft.id}
              className="absolute w-4 h-4 flex items-center justify-center text-xs font-bold"
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isClosest ? 10 : 1,
              }}
              title={`${aircraft.callsign} (X:${aircraft.x.toFixed(2)}, Y:${aircraft.y.toFixed(2)}, Estado: ${aircraft.collisionState})`}
            >
              <div className="relative inline-block">
                <span
                  className="absolute top-[-20px] z-50 text-xs font-bold"
                  style={{ color: isClosest ? '#FF6B6B' : iconColor }}
                >
                  {aircraft.callsign}
                </span>
                <div
                  className="flex items-center justify-center"
                  style={{
                    transform: `rotate(${calculateAngle(aircraft.dx, aircraft.dy)}deg)`,
                  }}
                >
                  {aircraft.collisionState === 'collision' ? (
                    <Skull size={24} color={iconColor} />
                  ) : (
                    <PlaneIcon
                      size={24}
                      color={isClosest ? '#FF6B6B' : iconColor}
                      style={{ filter: isClosest ? 'drop-shadow(0 0 4px #ff000080)' : 'none' }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
