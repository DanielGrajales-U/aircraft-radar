import { Panel } from './components/Panel';
import { Table } from './components/Table';
import { AircraftProvider, useAircraft } from './context/AircraftContext';

function AppContent() {
  const { state } = useAircraft();

  const { aircrafts, collisionHistory } = state;

  return (
    <main className="w-[100dvw] h-[100dvh] bg-black text-white font-sans">
      <div className="w-full h-full flex">
        <Panel />
        <Table />
      </div>
    </main>
  );
}

// 💡 El componente App solo se encarga de proveer el contexto
export default function App() {
  return (
    <AircraftProvider>
      <AppContent />
    </AircraftProvider>
  );
}
