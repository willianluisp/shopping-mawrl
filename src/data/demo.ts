import type { GateState, Spot } from '../types'

export const initialDemoSpots: Spot[] = [
  { id: 1, kind: 'conventional', monitored: true, occupied: true },
  { id: 2, kind: 'conventional', monitored: true, occupied: true },
  { id: 3, kind: 'conventional', monitored: true, occupied: false },
  { id: 4, kind: 'conventional', monitored: true, occupied: true },
  { id: 5, kind: 'pcd', monitored: false },
]

/** Interface seam for the future WebSocket source; demo intentionally has no network calls. */
export const demoGateway = {
  initialGate: 'closed' as GateState,
  toggleSpot: (spots: Spot[], id: number) => spots.map((spot) => spot.id === id && spot.monitored ? { ...spot, occupied: !spot.occupied } : spot),
}
