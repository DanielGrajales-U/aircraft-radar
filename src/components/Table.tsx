// src/components/Table.tsx
import { PlaneIcon, Skull } from 'lucide-react';
import type { Aircraft, CollisionHistoryItem } from '../types';

interface TableProps {
  aircrafts: Aircraft[];
  collisionHistory: CollisionHistoryItem[];
}

export function Table({ aircrafts, collisionHistory }: TableProps) {
  const getTextColor = (collisionState: string) => {
    switch (collisionState) {
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      case 'collision': return 'text-red-700';
      default: return 'text-white';
    }
  };

  const activeAircrafts = aircrafts.filter(ac => ac.collisionState !== 'collision');

  return (
    <section className="w-[300px] p-4 bg-black bg-opacity-80 h-vh">
      <div className="border border-green-500 w-full p-2 rounded h-[860px]">
        <h2 className="text-center font-bold text-xl text-green-400">Control Aéreo</h2>

        {/* Aviones Activos */}
        <div className="mb-4 h-1/2">
          <h3 className="font-semibold mb-1 text-green-300">Aviones Activos ({activeAircrafts.length}):</h3>
          <ul className="flex flex-col gap-1 max-h-full overflow-y-auto text-sm">
            {activeAircrafts.length === 0 ? (
              <li className="text-gray-500">No hay aviones activos.</li>
            ) : (
              activeAircrafts.map((aircraft) => {
                const textColor = getTextColor(aircraft.collisionState);
                return (
                  <li
                    key={aircraft.id}
                    className={`flex items-start gap-2 p-1 rounded ${aircraft.collisionState !== 'safe' ? 'bg-red-900 bg-opacity-30' : ''}`}
                  >
                    {aircraft.collisionState === 'collision' ? (
                      <Skull size={16} className={textColor} />
                    ) : (
                      <PlaneIcon size={16} className={textColor} />
                    )}
                    <div className="flex-1">
                      <div className="font-mono">{aircraft.callsign}</div>
                      <div className="text-xs text-gray-400">
                        {aircraft.origin} → {aircraft.destination}
                      </div>
                      <div className="text-xs text-gray-300">
                        X: {aircraft.x.toFixed(2)}, Y: {aircraft.y.toFixed(2)} | {aircraft.collisionState}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Historial de Colisiones */}
        <div className='mt-10 h-1/2'>
          <h3 className="font-semibold mb-1 text-red-400">Historial de Colisiones ({collisionHistory.length}):</h3>
          <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto text-sm">
            {collisionHistory.length === 0 ? (
              <li className="text-gray-500">No hay incidentes registrados.</li>
            ) : (
              [...collisionHistory]
                .sort((a, b) => b.timestamp - a.timestamp) // más reciente primero
                .map((item) => {
                  const textColor = getTextColor(item.finalCollisionState);
                  return (
                    <li
                      key={item.id}
                      className={`flex items-start gap-2 p-1 rounded bg-red-900 bg-opacity-20`}
                    >
                      <Skull size={16} className={textColor} />
                      <div className="flex-1">
                        <div className="font-mono">{item.callsign}</div>
                        <div className="text-xs text-gray-400">
                          {item.origin} → {item.destination}
                        </div>
                        <div className="text-xs">
                          <span className={textColor}>{item.finalCollisionState.toUpperCase()}</span> |
                          {item.passengers} pasajeros | {item.pilotName}
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
