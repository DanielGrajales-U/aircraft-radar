import { PlaneIcon, Skull } from 'lucide-react';
import { useAircraft } from '../contexts/AircraftContext';

export function Panel() {
  const { state } = useAircraft();

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

  // Filtrar aviones que NO estén en estado 'collision'
  const visibleAircrafts = state.aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className='flex-1 relative overflow-hidden'>

      {/* Fondo del panel */}
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

        {/* Etiquetas de los ejes */}
        {/* Eje X (valores de 0 a 100) */}
        {Array.from({ length: 11 }, (_, i) => {
          const value = i * 10;
          return (
            <div
              key={`x-label-${value}`}
              className="absolute text-xs text-green-400 font-mono pointer-events-none"
              style={{
                left: `${i * 10}%`,
                bottom: '0',
                transform: 'translateX(-50%)',
              }}
            >
              {value}
            </div>
          );
        })}

        {/* Eje Y (valores de 0 a 100) */}
        {Array.from({ length: 11 }, (_, i) => {
          const value = i * 10;
          return (
            <div
              key={`y-label-${value}`}
              className="absolute text-xs text-green-400 font-mono pointer-events-none"
              style={{
                right: '0',
                top: `${100 - i * 10}%`,
                transform: 'translateY(-50%)',
              }}
            >
              {value}
            </div>
          );
        })}

        {/* Mostrar los aviones */}
        {visibleAircrafts.map((aircraft) => {
          const iconColor = getIconColor(aircraft.collisionState);

          // Convertir las coordenadas (x, y) de 0-100 a porcentajes del contenedor
          // Asumiendo que el origen (0,0) está en la esquina inferior izquierda
          // y (100,100) en la esquina superior derecha.
          const xPercent = aircraft.x; // Directamente el valor de x como porcentaje
          const yPercent = 100 - aircraft.y; // Invertimos y porque en CSS el 0% es arriba

          return (
            <div
              key={aircraft.id}
              className={`absolute w-4 h-4 flex items-center justify-center text-xs font-bold`}
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
                    transform: `rotate(${calculateAngle(aircraft.dx, aircraft.dy)-150}deg)`,
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
    </section>
  );
}