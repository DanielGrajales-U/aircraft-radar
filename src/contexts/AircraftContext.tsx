import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Definición del tipo para un avión, incluyendo estado de colisión y nueva información
interface Aircraft {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  callsign: string;
  collisionState: 'safe' | 'warning' | 'danger' | 'collision'; // Nuevo estado
  passengers: number;
  pilotName: string;
  origin: string;
  destination: string;
}

// Interfaz para el historial de colisiones (puede ser el mismo tipo o un subconjunto)
interface CollisionHistoryItem extends Omit<Aircraft, 'collisionState'> {
  finalCollisionState: 'warning' | 'danger' | 'collision'; // Estado en el momento del registro
  timestamp: number; // Marca de tiempo para ordenar
}

// Acciones que pueden ocurrir en el contexto
type Action =
  | { type: 'SET_AIRCRAFTS'; payload: Aircraft[] }
  | { type: 'UPDATE_AIRCRAFT_POSITIONS' }
  | { type: 'ADD_TO_COLLISION_HISTORY'; payload: CollisionHistoryItem[] }; // Nueva acción

// Estado del contexto
interface AircraftState {
  aircrafts: Aircraft[];
  collisionHistory: CollisionHistoryItem[]; // Nuevo estado
}

// Función para calcular la distancia euclidiana entre dos puntos
const calculateDistance = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

// Reducer para manejar las acciones
const aircraftReducer = (state: AircraftState, action: Action): AircraftState => {
  switch (action.type) {
    case 'SET_AIRCRAFTS':
      return { ...state, aircrafts: action.payload, collisionHistory: [] }; // Reinicia historial al inicio

    case 'UPDATE_AIRCRAFT_POSITIONS': {
      // Actualiza la posición de cada avión basado en su velocidad (dx, dy)
      const updatedAircraftsWithoutCollision = state.aircrafts.map(ac => {
        // Si ya está en colisión, no se mueve
        if (ac.collisionState === 'collision') {
          return ac;
        }

        let newX = ac.x + ac.dx;
        let newY = ac.y + ac.dy;

        // Lógica de rebote en los bordes (solo si no está en colisión)
        if (newX < 0 || newX > 100) {
          return { ...ac, x: ac.x, dx: -ac.dx };
        }
        if (newY < 0 || newY > 100) {
          return { ...ac, y: ac.y, dy: -ac.dy };
        }

        return { ...ac, x: newX, y: newY };
      });

      // Calcula los estados de colisión basados en las nuevas posiciones
      const collisionStates: Record<string, Aircraft['collisionState']> = {};
      const numAircrafts = updatedAircraftsWithoutCollision.length;
      const newCollisionHistoryItems: CollisionHistoryItem[] = [];

      // Inicializa estados actuales como 'safe' o mantiene el anterior si no es 'collision'
      updatedAircraftsWithoutCollision.forEach(ac => {
        collisionStates[ac.id] = ac.collisionState === 'collision' ? 'collision' : 'safe';
      });

      // Calcula distancias y actualiza estados
      for (let i = 0; i < numAircrafts - 1; i++) {
        for (let j = i + 1; j < numAircrafts; j++) {
          const ac1 = updatedAircraftsWithoutCollision[i];
          const ac2 = updatedAircraftsWithoutCollision[j];
          // Solo calcular si ninguno de los dos ya está en estado 'collision'
          if (ac1.collisionState !== 'collision' && ac2.collisionState !== 'collision') {
            const distance = calculateDistance(ac1, ac2);

            // Define umbrales en porcentaje
            const warningThreshold = 5;
            const dangerThreshold = 1; // Ajusta según escala

            if (distance < dangerThreshold) {
              collisionStates[ac1.id] = 'collision';
              collisionStates[ac2.id] = 'collision';

              // Agregar al historial si no está ya registrado
              if (!state.collisionHistory.some(item => item.id === ac1.id)) {
                 newCollisionHistoryItems.push({
                   ...ac1,
                   finalCollisionState: 'collision',
                   timestamp: Date.now()
                 });
              }
              if (!state.collisionHistory.some(item => item.id === ac2.id)) {
                 newCollisionHistoryItems.push({
                   ...ac2,
                   finalCollisionState: 'collision',
                   timestamp: Date.now()
                 });
              }
            } else if (distance < warningThreshold) {
               if (collisionStates[ac1.id] !== 'collision') collisionStates[ac1.id] = 'danger'; // Usamos 'danger' para el umbral intermedio
               if (collisionStates[ac2.id] !== 'collision') collisionStates[ac2.id] = 'danger';
            } else if (distance < warningThreshold * 2) { // Opcional: umbral intermedio para 'warning'
               if (collisionStates[ac1.id] !== 'collision' && collisionStates[ac1.id] !== 'danger') collisionStates[ac1.id] = 'warning';
               if (collisionStates[ac2.id] !== 'collision' && collisionStates[ac2.id] !== 'danger') collisionStates[ac2.id] = 'warning';
            }
          }
        }
      }

      // Actualiza el estado de colisión en los aviones que no estaban en colisión
      const updatedAircrafts = updatedAircraftsWithoutCollision.map(ac => {
        if (ac.collisionState !== 'collision') {
          return { ...ac, collisionState: collisionStates[ac.id] || 'safe' };
        }
        return ac; // Mantiene aviones en colisión sin cambios
      });

      // Combina el historial existente con los nuevos ítems
      const updatedCollisionHistory = [...state.collisionHistory, ...newCollisionHistoryItems];

      return { ...state, aircrafts: updatedAircrafts, collisionHistory: updatedCollisionHistory };
    }

    case 'ADD_TO_COLLISION_HISTORY': // No se usará directamente, la lógica está en UPDATE_AIRCRAFT_POSITIONS
      return state;

    default:
      return state;
  }
};

const AircraftContext = createContext<{
  state: AircraftState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const useAircraft = () => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
};

export const AircraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aircraftReducer, { aircrafts: [], collisionHistory: [] });

  useEffect(() => {
    // Función para generar datos aleatorios
    const generateRandomData = () => {
        const callsigns = ['AV', 'CO', 'LA', 'AA', 'BA'];
        const origins = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
        const destinations = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
        const pilotNames = ['Juan G.', 'Maria L.', 'Carlos R.', 'Ana P.', 'Luis T.', 'Sofia M.', 'Pedro D.'];

        return {
            callsign: `${callsigns[Math.floor(Math.random() * callsigns.length)]}-${Math.floor(Math.random() * 900) + 100}`,
            origin: origins[Math.floor(Math.random() * origins.length)],
            destination: destinations[Math.floor(Math.random() * destinations.length)],
            pilotName: pilotNames[Math.floor(Math.random() * pilotNames.length)],
            passengers: Math.floor(Math.random() * 200) + 50 // Entre 50 y 249
        };
    };

    const generateInitialAircrafts = (): Aircraft[] => {
      const numAircrafts = Math.floor(Math.random() * 11) + 10;
      const aircrafts: Aircraft[] = [];
      const existingPositions: { x: number; y: number }[] = [];

      for (let i = 0; i < numAircrafts; i++) {
        let x:number, y:number;
        let attempts = 0;
        const maxAttempts = 50;

        do {
          x = parseFloat((Math.random() * 100).toFixed(2));
          y = parseFloat((Math.random() * 100).toFixed(2));
          attempts++;
        } while (
          existingPositions.some(pos => Math.abs(pos.x - x) < 5 && Math.abs(pos.y - y) < 5) && attempts < maxAttempts
        );

        if (attempts >= maxAttempts) break;

        existingPositions.push({ x, y });

        const dx = parseFloat((Math.random() * 1 - 0.5).toFixed(2));
        const dy = parseFloat((Math.random() * 1 - 0.5).toFixed(2));

        const { callsign, origin, destination, pilotName, passengers } = generateRandomData();

        aircrafts.push({ id: `ac-${i}`, x, y, dx, dy, callsign, collisionState: 'safe', passengers, pilotName, origin, destination });
      }
      return aircrafts;
    };

    dispatch({ type: 'SET_AIRCRAFTS', payload: generateInitialAircrafts() });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_AIRCRAFT_POSITIONS' });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AircraftContext.Provider value={{ state, dispatch }}>
      {children}
    </AircraftContext.Provider>
  );
};