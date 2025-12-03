// src/components/Panel.tsx
import { PlaneIcon, Skull } from 'lucide-react';
import { useAircraft } from '../contexts/AircraftContext';

// ... (Mantener calculateAngle y getIconColor)
const calculateAngle = (dx: number, dy: number): number => {
  let angleInRadians = Math.atan2(dy, dx);
  let angleInRadiansAdjusted = angleInRadians - (270 * Math.PI / 180);
  return angleInRadiansAdjusted * (180 / Math.PI);
};

const getIconColor = (collisionState: string) => {
  switch (collisionState) {
    case 'warning': return '#FBBF24'; // Amarillo
    case 'danger': return '#EF4444';   // Rojo
    case 'collision': return '#B91C1C'; // Rojo oscuro
    default: return '#2adb36'; // Verde claro
  }
};

export function Panel() {
  const { state } = useAircraft();
  const visibleAircrafts = state.aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className='flex-1 relative overflow-hidden'>

      {/* ... (Fondo, Ejes X/Y, Etiquetas - Mantenemos tu código aquí) ... */}

      {/* 🚨 Línea que conecta el Par Más Cercano 🚨 */}
      {state.closestPairIds && (() => {
        const ac1 = state.aircrafts.find(ac => ac.id === state.closestPairIds![0]);
        const ac2 = state.aircrafts.find(ac => ac.id === state.closestPairIds![1]);

        if (!ac1 || !ac2) return null;

        // Coordenadas en porcentaje (Y invertida para CSS)
        const x1 = ac1.x;
        const y1 = 100 - ac1.y;
        const x2 = ac2.x;
        const y2 = 100 - ac2.y;

        return (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            <line
              x1={`${x1}%`} y1={`${y1}%`}
              x2={`${x2}%`} y2={`${y2}%`}
              stroke="#FFD700" // Dorado/Amarillo para el par crítico
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        );
      })()}

      {/* Mostrar los aviones */}
      {state.aircrafts.map((aircraft) => {
        const isClosest = state.closestPairIds?.includes(aircraft.id);
        const iconColor = isClosest ? '#FFD700' : getIconColor(aircraft.collisionState); // Resaltar

        // Convertir las coordenadas (x, y) de 0-100 a porcentajes del contenedor
        const xPercent = aircraft.x;
        const yPercent = 100 - aircraft.y;

        return (
          <div
            key={aircraft.id}
            // ... (clases, title)
            className={`absolute w-4 h-4 flex items-center justify-center text-xs font-bold`}
            style={{
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: isClosest ? `0 0 10px 5px #FFD700` : 'none', // Sombra de resaltado
              transition: 'left 2s linear, top 2s linear, box-shadow 0.2s ease-in-out' // Transición suave
            }}
            title={`${aircraft.callsign} (X:${aircraft.x.toFixed(2)}, Y:${aircraft.y.toFixed(2)}, Estado: ${aircraft.collisionState})`}
          >
            <div className="relative inline-block">
              <span className={`absolute top-[-20px] z-50 text-xs`} style={{ color: iconColor }}>
                {aircraft.callsign}
              </span>
              <div
                className="flex items-center justify-center"
                style={{
                  transform: `rotate(${calculateAngle(aircraft.dx, aircraft.dy) - 150}deg)`,
                }}
              >
                {aircraft.collisionState === 'collision' ? (
                  <Skull size={24} color={iconColor} />
                ) : (
                  <PlaneIcon size={24} color={iconColor} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
