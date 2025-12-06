import { PlaneIcon, Skull } from 'lucide-react';
import { useAircraft } from '../context/AircraftContext';

export function Table() {
  const { state } = useAircraft();
  const { aircrafts, collisionHistory } = state;

  const getTextColor = (collisionState: string) => {
    switch (collisionState) {
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      case 'collision': return 'text-red-700';
      default: return 'text-green-400';
    }
  };

  // Filtrar aviones que no han colisionado
  const activeAircrafts = aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className="w-[300px] p-4 bg-black bg-opacity-80 flex-shrink-0">
      <div className="border border-green-500 w-full p-2 rounded h-full flex flex-col">
        <h2 className="text-center font-bold text-xl text-green-400 mb-4">📡 Control Aéreo</h2>

        {/* Aviones Activos */}
        <div className="mb-4 flex-1 overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-1 text-green-300 border-b border-green-700 pb-1">Aviones Activos ({activeAircrafts.length}):</h3>
          <ul className="flex flex-col gap-1 overflow-y-auto text-sm pr-1">
            {activeAircrafts.length === 0 ? (
              <li className="text-gray-500 mt-2">No hay aviones activos.</li>
            ) : (
              activeAircrafts.map((aircraft) => {
                const textColor = getTextColor(aircraft.collisionState);
                return (
                  <li
                    key={aircraft.id}
                    className={`flex items-start gap-2 p-1 rounded ${aircraft.collisionState !== 'safe' ? 'bg-red-900 bg-opacity-30' : ''}`}
                  >
                    <PlaneIcon size={16} className={textColor} />
                    <div className="flex-1">
                      <div className={`font-mono font-bold ${textColor}`}>{aircraft.callsign}</div>
                      <div className="text-xs text-gray-400">
                        {aircraft.origin} → {aircraft.destination}
                      </div>
                      <div className="text-xs text-gray-300">
                        **X: {aircraft.x.toFixed(2)}, Y: {aircraft.y.toFixed(2)}** | Estado: <span className={textColor}>{aircraft.collisionState.toUpperCase()}</span>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <hr className="border-green-800 my-4" />

        {/* Historial de Colisiones */}
        <div className='flex-1 overflow-hidden flex flex-col'>
          <h3 className="font-semibold mb-1 text-red-400 border-b border-red-700 pb-1">🚨 Historial de Colisiones ({collisionHistory.length}):</h3>
          <ul className="flex flex-col gap-1 overflow-y-auto text-sm pr-1">
            {collisionHistory.length === 0 ? (
              <li className="text-gray-500 mt-2">No hay incidentes registrados.</li>
            ) : (
              [...collisionHistory]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((item) => {
                  const textColor = getTextColor(item.finalCollisionState);
                  const time = new Date(item.timestamp).toLocaleTimeString('es-CO');

                  return (
                    <li
                      key={item.id}
                      className={`flex items-start gap-2 p-1 rounded bg-red-900 bg-opacity-20`}
                    >
                      <Skull size={16} className={textColor} />
                      <div className="flex-1">
                        <div className={`font-mono font-bold ${textColor}`}>{item.callsign}</div>
                        <div className="text-xs text-gray-400">
                          Piloto: {item.pilotName} ({item.passengers} pax)
                        </div>
                        <div className="text-xs text-gray-300">
                          **Colisión** a las **{time}**
                        </div>
                      </div>
                    </li>
                  );
                })
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
