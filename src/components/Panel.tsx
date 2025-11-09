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
      case 'warning': return '#FBBF24';
      case 'danger': return '#EF4444';
      case 'collision': return '#B91C1C';
      default: return '#2adb36';
    }
  };

  // Filtrar aviones que NO estén en estado 'collision'
  const visibleAircrafts = state.aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className='flex-1 relative overflow-hidden'>
      <h1 className='absolute top-2 left-1/2 transform -translate-x-1/2 text-white font-bold z-10'>
        Radar de Aviones
      </h1>

      <div
        className="w-full h-full"
        // Agrega aquí el fondo del radar si lo tienes (bg, backgroundImage, etc.)
      >
        {visibleAircrafts.map((aircraft) => { // Mapear solo los aviones visibles
          const iconColor = getIconColor(aircraft.collisionState);

          return (
            <div
              key={aircraft.id}
              className={`absolute w-4 h-4 flex items-center justify-center text-xs font-bold`}
              style={{
                left: `${aircraft.x}%`,
                top: `${aircraft.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={`${aircraft.callsign} (X:${aircraft.x.toFixed(2)}, Y:${aircraft.y.toFixed(2)}, Estado: ${aircraft.collisionState})`}
            >
              <div className="relative inline-block">
                <span className='absolute top-[-20px]'>{`${aircraft.callsign} `}</span>
                <div
                  className="flex items-center justify-center"
                  style={{
                    transform: `rotate(${calculateAngle(aircraft.dx, aircraft.dy)-40}deg)`,
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