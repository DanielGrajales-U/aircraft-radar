import type { Aircraft } from '../types';

const CALLSIGNS = ['AV', 'CO', 'LA', 'AA', 'BA'];
const ORIGINS = ['JFK', 'LAX', 'CDG', 'FRA', 'HND', 'DXB', 'LHR', 'SYD'];
const PILOTS = ['Juan G.', 'Maria L.', 'Carlos R.', 'Ana P.', 'Luis T.', 'Sofia M.', 'Pedro D.'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomAircraftData = () => ({
  callsign: `${getRandomItem(CALLSIGNS)}-${Math.floor(Math.random() * 900) + 100}`,
  origin: getRandomItem(ORIGINS),
  destination: getRandomItem(ORIGINS.filter(o => o !== getRandomItem(ORIGINS))), // evita origen = destino
  pilotName: getRandomItem(PILOTS),
  passengers: Math.floor(Math.random() * 200) + 50,
});

export const generateInitialAircrafts = (): Aircraft[] => {
  const numAircrafts = Math.floor(Math.random() * 11) + 10; // 10–20 aviones
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
      existingPositions.some(pos => Math.hypot(pos.x - x, pos.y - y) < 5) &&
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) continue;

    existingPositions.push({ x, y });

    const dx = parseFloat((Math.random() * 1 - 0.5).toFixed(2));
    const dy = parseFloat((Math.random() * 1 - 0.5).toFixed(2));
    const { callsign, origin, destination, pilotName, passengers } = generateRandomAircraftData();

    aircrafts.push({
      id: `ac-${i}`,
      x,
      y,
      dx,
      dy,
      callsign,
      collisionState: 'safe',
      passengers,
      pilotName,
      origin,
      destination,
    });
  }

  return aircrafts;
};
