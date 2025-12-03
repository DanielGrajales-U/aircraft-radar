import { type Aircraft, type Point } from '../types';

export const calculateDistance = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const toPoint = (ac: Aircraft): Point => ({ x: ac.x, y: ac.y, id: ac.id });
