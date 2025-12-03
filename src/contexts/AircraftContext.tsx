import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Aircraft, AircraftState, Action, Point, CollisionHistoryItem } from '../types';
import { calculateDistance, toPoint } from '../utils/math';
import { analyzeCollisionRisk } from '../utils/closestPair';

// Inicialización
const initialState: AircraftState = {
  aircrafts: [],
  collisionHistory: [],
  closestPairIds: null
};

const aircraftReducer = (state: AircraftState, action: Action): AircraftState => {
  switch (action.type) {
    case 'SET_AIRCRAFTS':
      return { ...initialState, aircrafts: action.payload };

    case 'UPDATE_AIRCRAFT_POSITIONS': {

      // 1. Actualización de Posición y Rebote (sin considerar colisiones)
      const updatedAircraftsWithoutCollision = state.aircrafts.map(ac => {
        if (ac.collisionState === 'collision') return ac;

        let newX = ac.x + ac.dx;
        let newY = ac.y + ac.dy;
        let dx = ac.dx;
        let dy = ac.dy;
        let bounced = false;

        if (newX < 0 || newX > 100) { dx = -ac.dx; newX = newX < 0 ? 0 : 100; bounced = true; }
        if (newY < 0 || newY > 100) { dy = -ac.dy; newY = newY < 0 ? 0 : 100; bounced = true; }

        // Si rebotó, usamos la posición anterior antes del rebote forzado
        if (bounced) return { ...ac, dx, dy };

        return { ...ac, x: newX, y: newY, dx, dy };
      });

      const activePoints: Point[] = updatedAircraftsWithoutCollision
        .filter(ac => ac.collisionState !== 'collision')
        .map(toPoint);

      // 2. Análisis de Riesgo O(n log n)
      const DANGER_THRESHOLD = 1;
      const WARNING_THRESHOLD = 5;

      let updatedAircrafts: Aircraft[] = [];
      let updatedCollisionHistory = [...state.collisionHistory];
      let newClosestPairIds: [string, string] | null = null;
      let newCollisionHistoryItems: CollisionHistoryItem[] = [];

      if (activePoints.length >= 2) {
        const riskAnalysis = analyzeCollisionRisk(activePoints, DANGER_THRESHOLD, WARNING_THRESHOLD);
        newClosestPairIds = riskAnalysis.newClosestPairIds;

        updatedAircrafts = updatedAircraftsWithoutCollision.map(ac => {
          // Si ya está en colisión, se mantiene
          if (ac.collisionState === 'collision') return ac;

          const newCollisionState = riskAnalysis.newCollisionStates[ac.id] || 'safe';

          // Lógica para registrar Colisión
          if (newCollisionState === 'danger' && riskAnalysis.minDistance < 0.1) { // Ajustar umbral final de colisión
            const isAlreadyHistory = state.collisionHistory.some(item => item.id === ac.id);
            if (!isAlreadyHistory) {
              newCollisionHistoryItems.push({
                ...ac,
                finalCollisionState: 'collision', // Registramos como colisionado
                timestamp: Date.now()
              });
            }
            // Forzamos el estado a 'collision' para detener el avión
            return { ...ac, collisionState: 'collision' };
          }

          return { ...ac, collisionState: newCollisionState };
        });

        updatedCollisionHistory = [...state.collisionHistory, ...newCollisionHistoryItems];

      } else {
        updatedAircrafts = updatedAircraftsWithoutCollision.map(ac => ({ ...ac, collisionState: ac.collisionState === 'collision' ? 'collision' : 'safe' }));
      }

      return {
        ...state,
        aircrafts: updatedAircrafts,
        collisionHistory: updatedCollisionHistory,
        closestPairIds: newClosestPairIds
      };
    }

    default:
      return state;
  }
};

// --------------------------------------------------------------------------
// CONTEXTO Y PROVEEDOR
// --------------------------------------------------------------------------

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

// ... (Resto de tu lógica de generación de datos y useEffect para el intervalo, usando la estructura original)

export const AircraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aircraftReducer, initialState);

  // Lógica para generar datos aleatorios
  const generateRandomData = () => {
    // ... (Tu código de generateRandomData)
    const callsigns = ['AV', 'CO', 'LA', 'AA', 'BA'];
    const origins = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
    const destinations = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
    const pilotNames = ['Juan G.', 'Maria L.', 'Carlos R.', 'Ana P.', 'Luis T.', 'Sofia M.', 'Pedro D.'];

    return {
      callsign: `${callsigns[Math.floor(Math.random() * callsigns.length)]}-${Math.floor(Math.random() * 900) + 100}`,
      origin: origins[Math.floor(Math.random() * origins.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      pilotName: pilotNames[Math.floor(Math.random() * pilotNames.length)],
      passengers: Math.floor(Math.random() * 200) + 50
    };
  };

  const generateInitialAircrafts = (): Aircraft[] => {
    // ... (Tu código de generateInitialAircrafts)
    const numAircrafts = Math.floor(Math.random() * 11) + 10;
    const aircrafts: Aircraft[] = [];
    const existingPositions: { x: number; y: number }[] = [];

    for (let i = 0; i < numAircrafts; i++) {
      let x: number, y: number;
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

  // useEffect para inicialización
  useEffect(() => {
    dispatch({ type: 'SET_AIRCRAFTS', payload: generateInitialAircrafts() });
  }, []);

  // useEffect para el intervalo de actualización
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
