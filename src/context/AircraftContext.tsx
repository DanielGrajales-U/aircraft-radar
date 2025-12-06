import React, { createContext, useContext } from 'react';
import type { AircraftState, Action } from '../types';
import { useAircraftState } from '../hooks/useAircraftState';

// Define el tipo para el valor del contexto
interface AircraftContextValue {
  state: AircraftState;
  dispatch: React.Dispatch<Action>;
}

const AircraftContext = createContext<AircraftContextValue | undefined>(undefined);

export const useAircraft = () => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
};

export const AircraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch } = useAircraftState();

  return (
    <AircraftContext.Provider value={{ state, dispatch }}>
      {children}
    </AircraftContext.Provider>
  );
};
