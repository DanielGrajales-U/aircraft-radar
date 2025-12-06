
import { PlaneIcon, Skull } from 'lucide-react';
import { useAircraft } from '../context/AircraftContext';

// ... (funciones calculateAngle, getIconColor)
const calculateAngle = (dx: number, dy: number): number => {
  let angleInRadians = Math.atan2(dy, dx);
  let angleInRadiansAdjusted = angleInRadians - (270 * Math.PI / 180);
  return angleInRadiansAdjusted * (180 / Math.PI);
};

const getIconColor = (collisionState: string) => {
  switch (collisionState) {
    case 'warning': return '#FBBF24'; // Amarillo
    case 'danger': return '#EF4444';   // Rojo
    case 'collision': return '#B91C1C'; // Rojo oscuro
    default: return '#2adb36'; // Verde claro
  }
};


export function Panel() {
  const { state } = useAircraft();
  const { aircrafts, closestPairIds } = state;

  // ... (otras funciones)

  // Filtrar aviones que NO estén en estado 'collision'
  const visibleAircrafts = aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className='flex-1 relative overflow-hidden'>
      <div
        className="w-full h-full bg-black relative"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.05) 0%, transparent 70%)',
        }}
      >
        {/* Eje X (horizontal) */}
        <div className="absolute w-full h-[1px] bg-green-500" style={{ top: '50%' }} />
        {/* Eje Y (vertical) */}
        <div className="absolute h-full w-[1px] bg-green-500" style={{ left: '50%' }} />
        {/* 💡 Línea de Riesgo entre el Par Más Cercano */}
        {closestPairIds && visibleAircrafts.length >= 2 && (() => {
          const ac1 = visibleAircrafts.find(ac => ac.id === closestPairIds[0]);
          const ac2 = visibleAircrafts.find(ac => ac.id === closestPairIds[1]);

          if (ac1 && ac2) {
            // Cálculo de la línea de conexión (usando los valores de coordenadas)
            const x1 = ac1.x;
            const y1 = 100 - ac1.y; // Invertir Y para CSS
            const x2 = ac2.x;
            const y2 = 100 - ac2.y; // Invertir Y para CSS

            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            let lineColor = 'border-green-500'; // Seguro
            if (ac1.collisionState === 'warning' || ac2.collisionState === 'warning') {
              lineColor = 'border-yellow-500';
            }
            if (ac1.collisionState === 'danger' || ac2.collisionState === 'danger') {
              lineColor = 'border-red-500';
            }

            return (
              <div
                className={`absolute border-t-2 ${lineColor} z-10`}
                style={{
                  left: `${x1}%`,
                  top: `${y1}%`,
                  width: `${distance}%`,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '0% 0%',
                }}
              />
            );
          }
          return null;
        })()}

        {visibleAircrafts.map((aircraft) => {
          const iconColor = getIconColor(aircraft.collisionState);
          // Determinar si el avión es parte del par más cercano para un resaltado adicional
          const isClosest = closestPairIds && (closestPairIds.includes(aircraft.id));

          // Convertir las coordenadas (x, y)
          const xPercent = aircraft.x;
          const yPercent = 100 - aircraft.y;

          return (
            <div
              key={aircraft.id}
              className={`absolute w-4 h-4 flex items-center justify-center text-xs font-bold ${isClosest ? 'animate-pulse' : ''}`}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: 'translate(-50%, -50%)',
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
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 z-20">
                  {aircraft.callsign}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section >
  );
}
