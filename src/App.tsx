import { Panel } from './components/Panel';
import { Table } from './components/Table';
import { useAircraftSimulation } from './hooks/useAircraftSimulation';

export default function App() {
  const { aircrafts, collisionHistory } = useAircraftSimulation();
  return (
    <main className="w-[100dvw] h-[100dvh]">
      <div className="w-full h-full flex">
        <Panel aircrafts={aircrafts} />
        <Table aircrafts={aircrafts} collisionHistory={collisionHistory} />
      </div>
    </main>
  );
}
