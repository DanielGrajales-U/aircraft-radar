import { useReducer, useEffect, useCallback } from 'react';
import type { Aircraft, AircraftState, Action, CollisionHistoryItem } from '../types';
import { analyzeCollisionRisk } from '../utils/closestPair';

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
      const DANGER_THRESHOLD = 1; // Distancia crítica (colisión inminente)
      const WARNING_THRESHOLD = 5; // Distancia de alerta (aviso)

      // 1. Actualización de Posición y Rebote (Lógica ya existente)
      const updatedAircraftsWithoutCollision = state.aircrafts.map(ac => {
        if (ac.collisionState === 'collision') return ac;

        let newX = ac.x + ac.dx;
        let newY = ac.y + ac.dy;
        let dx = ac.dx;
        let dy = ac.dy;
        let bounced = false;

        // Lógica de rebote en los bordes
        if (newX < 0 || newX > 100) {
          dx = -ac.dx;
          newX = newX < 0 ? 0 : 100;
          bounced = true;
        }
        if (newY < 0 || newY > 100) {
          dy = -ac.dy;
          newY = newY < 0 ? 0 : 100;
          bounced = true;
        }

        // Aplicar el rebote en la nueva posición
        if (bounced) return { ...ac, x: ac.x, y: ac.y, dx, dy }; // Aplica cambio de dirección, mantiene posición si es un borde estático.

        return { ...ac, x: newX, y: newY, dx, dy };
      });

      const activePoints: Aircraft[] = updatedAircraftsWithoutCollision
        .filter(ac => ac.collisionState !== 'collision');

      let newClosestPairIds: [string, string] | null = null;
      let newHistoryItems: CollisionHistoryItem[] = [];
      let updatedAircrafts: Aircraft[] = [];

      if (activePoints.length >= 2) {
        // 2. Análisis de Riesgo con Dividir y Vencer O(n log n)
        const riskAnalysis = analyzeCollisionRisk(activePoints, DANGER_THRESHOLD, WARNING_THRESHOLD);
        newClosestPairIds = riskAnalysis.newClosestPairIds;

        updatedAircrafts = updatedAircraftsWithoutCollision.map(ac => {
          // Si ya está en colisión, se mantiene
          if (ac.collisionState === 'collision') return ac;

          const newCollisionState = riskAnalysis.newCollisionStates[ac.id] || 'safe';

          // Lógica para registrar Colisión REAL
          // Si el estado es 'danger' y la distancia es realmente pequeña (casi 0)
          if (newCollisionState === 'danger' && riskAnalysis.minDistance < 0.1) {
            const existingHistory = state.collisionHistory.some(item => item.id === ac.id && item.finalCollisionState === 'collision');

            if (!existingHistory) {
              // Solo agregamos al historial si es la primera vez que se registra este avión
              const newHistoryItem: CollisionHistoryItem = {
                ...ac,
                finalCollisionState: 'collision',
                timestamp: Date.now(),
                distance: riskAnalysis.minDistance // Distancia al momento de la colisión
              };
              newHistoryItems.push(newHistoryItem);
            }

            return { ...ac, collisionState: 'collision' };
          }

          // Aplicar el estado de riesgo (danger/warning/safe)
          return { ...ac, collisionState: newCollisionState };
        });

      } else {
        // No hay suficientes aviones para análisis
        updatedAircrafts = updatedAircraftsWithoutCollision;
      }

      // 3. Actualizar Historial
      const updatedCollisionHistory = [...state.collisionHistory, ...newHistoryItems];

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


// --- HOOK PERSONALIZADO ---

export const useAircraftState = () => {
  const [state, dispatch] = useReducer(aircraftReducer, initialState);

  // Funciones de generación de datos (moved from Context.tsx)
  const generateRandomData = useCallback(() => {
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
  }, []);
  const generateInitialAircrafts = useCallback(() => {
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
  }, []);

  // Efecto para inicializar aviones (moved from Context.tsx)
  useEffect(() => {
    dispatch({ type: 'SET_AIRCRAFTS', payload: generateInitialAircrafts() });
  }, [generateInitialAircrafts]);

  // Efecto para el bucle de simulación (moved from Context.tsx)
  useEffect(() => {
    // Intervalo de 2000ms (2 segundos) para el movimiento
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_AIRCRAFT_POSITIONS' });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    state,
    dispatch
  };
};
