export type SpotKind = 'conventional' | 'pcd'

/** The PCD bay is intentionally present without inferred occupancy. */
export type Spot = {
  id: number
  kind: SpotKind
  monitored: boolean
  occupied?: boolean
}

export type GateState = 'open' | 'closed'
export type CameraView = 'isometric' | 'front' | 'right' | 'left' | 'rear' | 'top'
export type CameraReset = () => void
