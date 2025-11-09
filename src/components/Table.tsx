import { PlaneIcon, Skull } from 'lucide-react';
import { useAircraft } from '../contexts/AircraftContext';

export function Table() {
  const { state } = useAircraft();

  const getTextColor = (collisionState: string) => {
    switch (collisionState) {
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      case 'collision': return 'text-red-700';
      default: return 'text-white';
    }
  };

  // Filtrar aviones que NO estén en estado 'collision' para la tabla principal
  const activeAircrafts = state.aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className='w-[300px] p-4'>
      <div className='border border-main-green w-full p-2'>
        <h2 className='text-center font-bold text-xl'>Control Aéreo</h2>

        {/* Tabla de Aviones Activos */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Aviones Activos:</h3>
          <ul className='flex flex-col gap-1 max-h-[calc((100vh-100px)/2)] overflow-y-auto'> {/* Ajusta altura */}
            {activeAircrafts.map((aircraft) => {
              const textColor = getTextColor(aircraft.collisionState);

              return (
                <li
                  key={aircraft.id}
                  className={`flex items-center gap-1 ${textColor}`}
                >
                  {aircraft.collisionState === 'collision' ? (
                    <Skull size={16} className={textColor} />
                  ) : (
                    <PlaneIcon size={16} className={textColor} />
                  )}
                  <div className="flex-1 truncate text-sm">
                    {aircraft.callsign} <br />
                    <span className="text-xs">({aircraft.origin} → {aircraft.destination})</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    X:{aircraft.x.toFixed(2)}, Y:{aircraft.y.toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tabla de Historial de Colisiones */}
        <div>
          <h3 className="font-semibold mb-1">Historial de Riesgos:</h3>
          <ul className='flex flex-col gap-1 max-h-[calc((100vh-100px)/2)] overflow-y-auto'> {/* Ajusta altura */}
            {state.collisionHistory.map((item) => {
              const textColor = getTextColor(item.finalCollisionState);

              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-1 ${textColor}`}
                >
                  <Skull size={16} className={textColor} /> {/* Siempre Skull para historial */}
                  <div className="flex-1 truncate text-sm">
                    {item.callsign} <br />
                    <span className="text-xs">({item.origin} → {item.destination}) - {item.finalCollisionState.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    P:{item.passengers}, Piloto: {item.pilotName}
                  </div>
                </li>
              );
            })}
            {state.collisionHistory.length === 0 && <li className="text-gray-500 text-sm">No hay incidentes registrados.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}