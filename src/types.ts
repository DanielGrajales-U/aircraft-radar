export interface Aircraft {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  callsign: string;
  collisionState: 'safe' | 'warning' | 'danger' | 'collision';
  passengers: number;
  pilotName: string;
  origin: string;
  destination: string;
}

export interface CollisionHistoryItem
  extends Omit<Aircraft, 'collisionState'> {
  finalCollisionState: 'warning' | 'danger' | 'collision';
  timestamp: number;
}
