import { useState, useEffect } from 'react';
import { generateInitialAircrafts } from '../data/generateInitialAircrafts.ts';
import type { Aircraft, CollisionHistoryItem } from '../types';
import { findClosestPairs } from '../utils/closestPair';
import { ArbolBST } from '../structures/bst.ts';

const DANGER_THRESHOLD = 1.0;
const WARNING_THRESHOLD = 5.0;

export const useAircraftSimulation = () => {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [collisionHistoryBST] = useState(() => new ArbolBST<CollisionHistoryItem>());
  const [collisionHistory, setCollisionHistory] = useState<CollisionHistoryItem[]>([]);

  // Inicializar aviones
  useEffect(() => {
    setAircrafts(generateInitialAircrafts());
    collisionHistoryBST.root = null; // reset BST
    setCollisionHistory([]);
  }, [collisionHistoryBST]);

  // Simulación periódica
  useEffect(() => {
    if (aircrafts.length === 0) return;

    const interval = setInterval(() => {
      setAircrafts(prev => {
        // 1. Mover aviones (sin colisionados)
        let updated = prev.map(ac => {
          if (ac.collisionState === 'collision') return ac;
          let newX = ac.x + ac.dx;
          let newY = ac.y + ac.dy;

          // Rebote en bordes
          if (newX < 0 || newX > 100) newX = ac.x; // o invertir dx, como prefieras
          if (newY < 0 || newY > 100) newY = ac.y;

          return { ...ac, x: newX, y: newY };
        });

        // 2. Detectar colisiones
        const active = updated.filter(ac => ac.collisionState !== 'collision');
        const points = active.map(ac => ({ id: ac.id, x: ac.x, y: ac.y }));

        const { minDistance, pairs } = findClosestPairs(points);

        // 3. Determinar nuevos estados
        const newStateMap: Record<string, Aircraft['collisionState']> = {};
        active.forEach(ac => newStateMap[ac.id] = 'safe');

        const now = Date.now();
        const newHistoryItems: CollisionHistoryItem[] = [];

        if (minDistance < DANGER_THRESHOLD) {
          for (const [a, b] of pairs) {
            newStateMap[a.id] = 'collision';
            newStateMap[b.id] = 'collision';

            // Agregar al historial (BST y array)
            if (!collisionHistory.some(h => h.id === a.id)) {
              const itemA: CollisionHistoryItem = { ...a, finalCollisionState: 'collision', timestamp: now };
              collisionHistoryBST.insertar(now, itemA);
              newHistoryItems.push(itemA);
            }
            if (!collisionHistory.some(h => h.id === b.id)) {
              const itemB: CollisionHistoryItem = { ...b, finalCollisionState: 'collision', timestamp: now };
              collisionHistoryBST.insertar(now, itemB);
              newHistoryItems.push(itemB);
            }
          }
        } else if (minDistance < WARNING_THRESHOLD) {
          for (const [a, b] of pairs) {
            if (newStateMap[a.id] !== 'collision') newStateMap[a.id] = 'danger';
            if (newStateMap[b.id] !== 'collision') newStateMap[b.id] = 'danger';
          }
        }

        // 4. Actualizar estados
        updated = updated.map(ac =>
          ac.collisionState !== 'collision'
            ? { ...ac, collisionState: newStateMap[ac.id] ?? 'safe' }
            : ac
        );

        // 5. Actualizar historial
        if (newHistoryItems.length > 0) {
          const fullHistory = [...collisionHistory, ...newHistoryItems];
          setCollisionHistory(fullHistory);
        }

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [aircrafts.length, collisionHistory, collisionHistoryBST]);

  return { aircrafts, collisionHistory };
};
