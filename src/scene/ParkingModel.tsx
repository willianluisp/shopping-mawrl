import { OrbitControls, PerspectiveCamera, Text, useCursor } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { model } from '../config/model'
import type { CameraView, GateState, Spot } from '../types'
import { finish, surfaceTexture, type Surface } from './surfaces'

const C = {
  blue: '#0755a3', deepBlue: '#092e60', glass: '#112b46', asphalt: '#20252b',
  yellow: '#edbc28', concrete: '#777c80', darkConcrete: '#41484d',
  green: '#55e480', red: '#ef5961', white: '#e8edf0', pcd: '#1675b9',
}
const target: [number, number, number] = [0, 7.5, -1.6]
const cameraViews: Record<CameraView, { position: [number, number, number]; target: [number, number, number] }> = {
  isometric: { position: [-42, 31, -56], target },
  front: { position: [0, 19, -64], target: [0, 7.5, -1] },
  right: { position: [-62, 22, -2], target },
  left: { position: [62, 22, -2], target },
  rear: { position: [0, 23, 65], target },
  top: { position: [0, 73, -1], target: [0, 8, -1] },
}

type SolidProps = {
  args: [number, number, number]
  position: [number, number, number]
  color: string
  surface?: Surface
  rotation?: [number, number, number]
  emissive?: string
  emissiveIntensity?: number
}
function Solid({ args, position, color, surface = 'concrete', rotation = [0, 0, 0], emissive, emissiveIntensity = 0 }: SolidProps) {
  return <mesh castShadow receiveShadow position={position} rotation={rotation}>
    <boxGeometry args={args}/>
    <meshStandardMaterial color={color} map={surfaceTexture(surface)} {...finish[surface]} emissive={emissive} emissiveIntensity={emissiveIntensity}/>
  </mesh>
}

const arrowShape = new THREE.Shape()
arrowShape.moveTo(-.14, .86)
arrowShape.lineTo(.14, .86)
arrowShape.lineTo(.14, -.15)
arrowShape.lineTo(.56, -.15)
arrowShape.lineTo(0, -.93)
arrowShape.lineTo(-.56, -.15)
arrowShape.lineTo(-.14, -.15)
arrowShape.closePath()

function RampArrow({ z }: { z: number }) {
  return <mesh receiveShadow position={[0, .19, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <shapeGeometry args={[arrowShape]}/>
    <meshStandardMaterial color={C.white} side={THREE.DoubleSide} roughness={.9}/>
  </mesh>
}

function HazardStripe({ x, y, z, face = 'front', width = .76, height = 1.5 }: { x: number; y: number; z: number; face?: 'front' | 'side'; width?: number; height?: number }) {
  // Shallow diagonal bands remain legible on the narrow corner guards.
  return <group position={[x, y, z]} rotation={face === 'side' ? [0, Math.PI / 2, 0] : [0, 0, 0]}>
    <Solid args={[width, height, .025]} position={[0, 0, 0]} color={C.yellow} surface="paint"/>
    {[-.48, .03, .54].map((offset) =>
      <Solid key={offset} args={[width * 1.5, .2, .04]} position={[0, offset, -.025]} rotation={[0, 0, -.62]} color="#151a1b" surface="paint"/>
    )}
  </group>
}

function Car({ x, z, color }: { x: number; z: number; color: string }) {
  const wheelZ = [-1.15, 1.15]
  return <group position={[x, model.parking.floorY + model.parking.surfaceOffset + .47 * model.vehicle.scale, z]} scale={model.vehicle.scale}>
    <Solid args={[model.vehicle.bodyWidth, .62, model.vehicle.bodyLength]} position={[0, .28, 0]} color={color} surface="paint"/>
    <Solid args={[1.83, .12, 3.52]} position={[0, .66, 0]} color={color} surface="paint"/>
    <Solid args={[1.74, .7, 1.9]} position={[0, 1.06, .03]} color={color} surface="paint"/>
    <Solid args={[1.67, .42, 1.22]} position={[0, 1.08, -.03]} color="#284259" surface="glass"/>
    <Solid args={[1.63, .35, .06]} position={[0, 1.1, -1.02]} rotation={[-.26, 0, 0]} color="#5b7687" surface="glass"/>
    <Solid args={[1.62, .31, .06]} position={[0, 1.1, 1.08]} rotation={[.28, 0, 0]} color="#4c6679" surface="glass"/>
    {[-1.01, 1.01].flatMap((wx) => wheelZ.map((wz) =>
      <group key={`${wx}-${wz}`} position={[wx, -.08, wz]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[.39, .39, .17, 20]}/><meshStandardMaterial color="#121719" roughness={.95}/></mesh>
        <mesh position={[0, .09, 0]}><cylinderGeometry args={[.22, .22, .02, 16]}/><meshStandardMaterial color="#838a8e" metalness={.7} roughness={.4}/></mesh>
      </group>
    ))}
    {[-.69, .69].map((lx) => <group key={lx}>
      <Solid args={[.44, .16, .04]} position={[lx, .38, -1.98]} color="#e9e3c9" surface="glass" emissive="#e2d6a8" emissiveIntensity={.5}/>
      <Solid args={[.42, .14, .04]} position={[lx, .38, 1.98]} color="#ac282b" surface="glass"/>
    </group>)}
    <Solid args={[.4, .16, .32]} position={[-1.03, .96, -.5]} color={color} surface="paint"/>
    <Solid args={[.4, .16, .32]} position={[1.03, .96, -.5]} color={color} surface="paint"/>
  </group>
}

function AccessibleMark({ x, z }: { x: number; z: number }) {
  // Keep the full symbol above the blue paint layer; otherwise only the wheel/head show.
  const y = model.parking.floorY + .135
  return <group position={[x, y, z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-.33, 0, -.43]}><torusGeometry args={[.7, .1, 8, 28, Math.PI * 1.7]}/><meshBasicMaterial color={C.white}/></mesh>
    <mesh position={[.22, .025, .98]}><sphereGeometry args={[.24, 16, 12]}/><meshBasicMaterial color={C.white}/></mesh>
    <Solid args={[.19, .03, .98]} position={[.16, 0, .31]} color={C.white} surface="marking"/>
    <Solid args={[.98, .03, .18]} position={[.5, 0, -.07]} color={C.white} surface="marking"/>
    <Solid args={[.76, .03, .18]} position={[.78, 0, -.55]} rotation={[0, .52, 0]} color={C.white} surface="marking"/>
  </group>
}

function Led({ x, occupied }: { x: number; occupied: boolean }) {
  const color = occupied ? C.red : C.green
  return <group>
    <Solid args={[.74, .58, .18]} position={[x, model.building.roofY - 1.15, model.building.rear - .4]} color="#1e282a" surface="metal"/>
    <mesh position={[x, model.building.roofY - 1.15, model.building.rear - .52]}><sphereGeometry args={[.2, 16, 12]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={3}/></mesh>
    <pointLight position={[x, model.building.roofY - 1.65, model.building.rear - 1]} color={color} intensity={occupied ? 13 : 10} distance={8} decay={2}/>
  </group>
}

function ParkingDeck({ spots }: { spots: Spot[] }) {
  const p = model.parking
  const y = p.floorY
  const aisleDepth = p.aisleRear - p.aisleFront
  const bayDepth = p.bayRear - p.bayFront
  const bayMiddle = (p.bayFront + p.bayRear) / 2
  return <group>
    {/* Aisle and landing overlap: the ramp opens straight into a turning space. */}
    <Solid args={[model.building.width - .5, .075, aisleDepth]} position={[0, y + .04, (p.aisleFront + p.aisleRear) / 2]} color="#23282a" surface="asphalt"/>
    <Solid args={[model.building.width - .5, .075, bayDepth]} position={[0, y + .04, (p.bayFront + p.bayRear) / 2]} color="#303536" surface="asphalt"/>
    <Solid args={[model.building.width - 1.4, .035, .1]} position={[0, y + .1, p.aisleRear - .16]} color={C.yellow} surface="marking"/>
    {spots.filter((spot) => spot.monitored).map((spot, i) => {
      const x = p.bayCenters[i]
      return <group key={spot.id}>
        <Solid args={[.12, .035, bayDepth - .28]} position={[x - p.bayWidth / 2, y + .11, bayMiddle]} color={C.yellow} surface="marking"/>
        <Solid args={[.12, .035, bayDepth - .28]} position={[x + p.bayWidth / 2, y + .11, bayMiddle]} color={C.yellow} surface="marking"/>
        <Text position={[x, y + .13, p.bayFront + .53]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={.62} color={C.white} anchorX="center">{`0${spot.id}`}</Text>
        {typeof spot.occupied === 'boolean' && <Led x={x} occupied={spot.occupied}/>}
        {spot.occupied && <Car x={x} z={bayMiddle + .15} color={['#7c2629', '#af3031', '#5a646b', '#234d78'][i]}/>}
      </group>
    })}
    <Solid args={[p.accessibleBayWidth, .04, bayDepth - .18]} position={[p.bayCenters[4], y + .095, bayMiddle]} color={C.pcd} surface="paint"/>
    {[-1, 1].map((side) => <Solid key={side} args={[.12, .035, bayDepth - .28]} position={[p.bayCenters[4] + side * p.accessibleBayWidth / 2, y + .13, bayMiddle]} color={C.white} surface="marking"/>)}
    <AccessibleMark x={p.bayCenters[4]} z={bayMiddle + .36}/>
    <Text position={[p.bayCenters[4], y + .14, p.bayFront + .53]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={.62} color={C.white} anchorX="center">PCD</Text>
    <Solid args={[model.building.width - .8, .18, .22]} position={[0, y + .12, p.bayRear + .06]} color={C.yellow} surface="paint"/>
  </group>
}

function Ramp() {
  const r = model.ramp
  const run = r.topZ - r.bottomZ
  const roadSurfaceY = model.road.surfaceY
  const upperSurfaceY = model.parking.floorY + model.parking.surfaceOffset
  const rise = upperSurfaceY - roadSurfaceY
  const length = Math.hypot(run, rise)
  const angle = Math.atan2(rise, run)
  const midZ = (r.bottomZ + r.topZ) / 2
  return <group>
    <group position={[r.centerX, (roadSurfaceY + upperSurfaceY) / 2 - .15 * Math.cos(angle), midZ + .15 * Math.sin(angle)]} rotation={[-angle, 0, 0]}>
      <Solid args={[r.width, .3, length]} position={[0, 0, 0]} color={C.asphalt} surface="asphalt"/>
      {[-1, 1].map((side) => <group key={side}>
        <Solid args={[.28, r.guardHeight, length]} position={[side * (r.width / 2 - .14), r.guardHeight / 2, 0]} color={C.concrete} surface="concrete"/>
        <Solid args={[.12, .07, length - .25]} position={[side * (r.width / 2 - .45), .18, 0]} color={C.yellow} surface="marking"/>
        {[-length / 2 + .8, length / 2 - .8].map((z) =>
          <HazardStripe key={z} x={side * (r.width / 2 - .14)} y={r.guardHeight / 2} z={z} face="side" width={.7} height={1.04}/>
        )}
      </group>)}
      {[-length * .21, length * .19].map((z) => <RampArrow key={z} z={z}/>)}
      <Solid args={[r.width - .5, .045, .14]} position={[0, .18, -length / 2 + .25]} color={C.yellow} surface="marking"/>
    </group>
    {/* Horizontal turning apron overlaps the full-width front aisle, with no inner wall. */}
    <Solid args={[r.landingWidth, .3, r.landingRear - r.topZ]} position={[r.centerX + r.landingShiftX, upperSurfaceY - .15, (r.topZ + r.landingRear) / 2]} color={C.asphalt} surface="asphalt"/>
    <Solid args={[.28, r.guardHeight, r.landingRear - r.topZ]} position={[r.centerX - r.width / 2 + .14, upperSurfaceY + r.guardHeight / 2 - .15, (r.topZ + r.landingRear) / 2]} color={C.concrete} surface="concrete"/>
    <Solid args={[.12, .04, r.landingRear - r.topZ - .35]} position={[r.centerX - r.width / 2 + .42, upperSurfaceY + .02, (r.topZ + r.landingRear) / 2]} color={C.yellow} surface="marking"/>
    <HazardStripe x={r.centerX - r.width / 2 + .15} y={upperSurfaceY + .42} z={r.landingRear - .05} width={.28} height={1.04}/>
  </group>
}

function Gate({ state, onToggle }: { state: GateState; onToggle: () => void }) {
  const arm = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  useFrame((_, delta) => { if (arm.current) arm.current.rotation.z = THREE.MathUtils.damp(arm.current.rotation.z, state === 'open' ? 1.42 : 0, 6, delta) })
  return <group position={[model.gate.x, .2, model.gate.z]} onClick={(event) => { event.stopPropagation(); onToggle() }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <Solid args={[1.08, 2.65, 1.06]} position={[0, 1.32, 0]} color={C.yellow} surface="paint"/>
    <Solid args={[1.35, .22, 1.34]} position={[0, .08, 0]} color="#1c2324" surface="concrete"/>
    <Solid args={[.57, .38, .1]} position={[0, 2.25, -.55]} color="#202528" surface="metal"/>
    <group ref={arm} position={[.25, model.gate.pivotY, 0]}>
      <Solid args={[model.gate.arm, .24, .31]} position={[model.gate.arm / 2, 0, 0]} color={C.yellow} surface="paint"/>
      {[.83, 1.77, 2.71, 3.65, 4.59, 5.53].map((x) => <Solid key={x} args={[.4, .25, .33]} position={[x, 0, 0]} color="#181e1e" surface="paint"/>)}
    </group>
    <Text position={[0, 3.05, -.6]} rotation={[0, Math.PI, 0]} fontSize={.4} color={C.white} anchorX="center">{hovered ? 'CLIQUE' : 'CANCELA'}</Text>
  </group>
}

function Road() {
  const road = model.road
  const rampInnerEdge = model.ramp.centerX + model.ramp.width / 2
  const sidewalkWidth = model.base.width / 2 - rampInnerEdge
  return <group>
    <Solid args={[model.base.width, .17, road.depth]} position={[0, .08, (road.front + road.rear) / 2]} color={C.asphalt} surface="asphalt"/>
    {/* The front sidewalk ends at the ramp lane; asphalt remains exposed beneath its entrance. */}
    <Solid args={[sidewalkWidth, .36, road.sidewalk]} position={[(rampInnerEdge + model.base.width / 2) / 2, .19, road.front - road.sidewalk / 2 + .28]} color="#858684" surface="concrete"/>
    <Solid args={[model.base.width, .32, .62]} position={[0, .16, road.rear - .22]} color="#8c8d8b" surface="concrete"/>
    <Solid args={[model.base.width - .6, .045, .14]} position={[0, .18, road.front + .6]} color={C.yellow} surface="marking"/>
    <Solid args={[model.base.width - .6, .045, .14]} position={[0, .18, road.rear - .83]} color={C.yellow} surface="marking"/>
    {[-3.5, 2.5, 8.5, 14.5].map((x) => <Solid key={x} args={[2.45, .035, .16]} position={[x, .18, -12.2]} color={C.white} surface="marking"/>)}
    {/* The six transverse rectangles cross the road in front of the facade, not the ramp. */}
    {Array.from({ length: 6 }, (_, i) => <Solid key={i} args={[3.4, .035, .46]} position={[road.crosswalkX, .19, road.front + 1.9 + i * 1.3]} color={C.white} surface="marking"/>)}
  </group>
}

/** Opt-in QA overlay (?rota=1); never shown in the normal demonstration. */
function RouteDebug() {
  const lines = useMemo(() => model.parking.bayCenters.map((bayX) => {
    const r = model.ramp
    const turn = model.vehicle.turnRadius
    const upperY = model.parking.floorY + model.parking.surfaceOffset + .2
    const points = [new THREE.Vector3(r.centerX, model.road.surfaceY + .2, model.gate.z)]
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      points.push(new THREE.Vector3(r.centerX, model.road.surfaceY + .2 + (upperY - model.road.surfaceY - .2) * t, r.bottomZ + (r.topZ - r.bottomZ) * t))
    }
    points.push(new THREE.Vector3(r.centerX, upperY, model.vehicle.upperTurnStartZ))
    const turnCenterX = r.centerX + turn
    for (let i = 1; i <= 12; i++) {
      const angle = Math.PI - i * Math.PI / 24
      points.push(new THREE.Vector3(turnCenterX + turn * Math.cos(angle), upperY, model.vehicle.upperTurnStartZ + turn * Math.sin(angle)))
    }
    const parkingTurnStartX = bayX - turn
    points.push(new THREE.Vector3(parkingTurnStartX, upperY, model.vehicle.upperTurnStartZ + turn))
    for (let i = 1; i <= 12; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 24
      points.push(new THREE.Vector3(parkingTurnStartX + turn * Math.cos(angle), upperY, model.vehicle.upperTurnStartZ + 2 * turn + turn * Math.sin(angle)))
    }
    points.push(new THREE.Vector3(bayX, upperY, (model.parking.bayFront + model.parking.bayRear) / 2))
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: '#5de7ff', transparent: true, opacity: .78, depthTest: false }),
    )
  }), [])
  return <group>{lines.map((line, i) => <primitive key={i} object={line}/>)}</group>
}

function Building({ spots, roofVisible }: { spots: Spot[]; roofVisible: boolean }) {
  const b = model.building
  const y = model.parking.floorY
  const depth = b.rear - b.front
  return <group>
    {/* Ground floor is a built shell, not a solid block. */}
    <Solid args={[b.width, b.groundHeight, .42]} position={[0, b.groundHeight / 2, b.rear]} color={C.concrete} surface="concrete"/>
    {[-1, 1].map((side) => <Solid key={side} args={[.42, b.groundHeight, depth]} position={[side * (b.width / 2 - .6), b.groundHeight / 2, (b.front + b.rear) / 2]} color={C.concrete} surface="concrete"/>)}
    <Solid args={[b.width - 1.3, 9.6, .25]} position={[0, 5.27, b.front + .15]} color={C.glass} surface="glass"/>
    <Solid args={[b.width - 1.6, 8.7, .06]} position={[0, 5.25, b.front - .03]} color="#163860" surface="glass"/>
    {[ -8.45, 0, 8.45 ].map((x) => <Solid key={x} args={[.18, 8.8, .09]} position={[x, 5.23, b.front - .08]} color="#6685a2" surface="metal"/>)}
    <Solid args={[b.width + .75, 2.55, .55]} position={[0, 12.26, b.front - .12]} color={C.blue} surface="paint"/>
    {[-1, 1].map((side) => <Solid key={side} args={[.7, b.groundHeight, .55]} position={[side * b.width / 2, b.groundHeight / 2, b.front - .13]} color={C.blue} surface="paint"/>)}
    <Text position={[0, 12.72, b.front - .43]} rotation={[0, Math.PI, 0]} fontSize={1.28} letterSpacing={.13} color={C.white} anchorX="center">SHOPPING MAWRL</Text>
    <Solid args={[b.width, .44, depth]} position={[0, y - .22, (b.front + b.rear) / 2]} color="#676d70" surface="concrete"/>
    {/* The ramp-side bay is open: only the opposite flank and the rear remain closed. */}
    <Solid args={[b.width, b.upperHeight - .6, .38]} position={[0, y + (b.upperHeight - .6) / 2, b.rear - .15]} color="#626b6d" surface="concrete"/>
    <Solid args={[.38, b.upperHeight - .6, b.rear - 2.1]} position={[b.width / 2 - .2, y + (b.upperHeight - .6) / 2, (2.1 + b.rear) / 2]} color="#697174" surface="concrete"/>
    <Solid args={[b.width - .6, .12, .14]} position={[0, y + 3.8, b.rear - .39]} color={C.yellow} surface="paint"/>
    <ParkingDeck spots={spots}/>
    {[-1, 1].flatMap((side) => [model.supports.frontZ, model.supports.rearZ].map((z) => {
      const x = side * model.supports.sideX
      return <group key={`${side}-${z}`}>
        <Solid args={[.7, b.upperHeight, .7]} position={[x, y + b.upperHeight / 2, z]} color={C.darkConcrete} surface="concrete"/>
        <HazardStripe x={x} y={y + .93} z={z - .37} width={.72} height={1.75}/>
      </group>
    }))}
    {roofVisible && <group>
      <Solid args={[b.width + .7, .48, b.rear - model.supports.roofFrontZ]} position={[0, b.roofY + .24, (b.rear + model.supports.roofFrontZ) / 2]} color="#797f80" surface="roof"/>
      <Solid args={[b.width + .56, .16, .16]} position={[0, b.roofY + .03, model.supports.roofFrontZ]} color="#4e575b" surface="metal"/>
      {[-8.5, 0, 8.5].map((x) => <Solid key={x} args={[.14, .08, b.rear - model.supports.roofFrontZ - .7]} position={[x, b.roofY - .07, (b.rear + model.supports.roofFrontZ) / 2]} color="#596266" surface="metal"/>)}
      {[-10.2, 0, 10.2].map((x) => <group key={x}>
        <Solid args={[1.45, .055, .18]} position={[x, b.roofY - .08, 2.6]} color="#e6d7b3" surface="glass" emissive="#e4d5af" emissiveIntensity={.45}/>
        <pointLight position={[x, b.roofY - .65, 2.6]} color="#f3e9d5" intensity={3} distance={7} decay={2}/>
      </group>)}
    </group>}
  </group>
}

function Scene({ spots, gate, roofVisible, onGate }: { spots: Spot[]; gate: GateState; roofVisible: boolean; onGate: () => void }) {
  return <>
    <ambientLight intensity={.65}/>
    <hemisphereLight args={['#c2d7e4', '#29343c', 1.35]}/>
    <directionalLight castShadow position={[-17, 35, -27]} intensity={2.5} shadow-mapSize={[2048, 2048]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-bias={-.0003}/>
    <Solid args={[model.base.width, model.base.thickness, model.base.depth]} position={[0, -model.base.thickness / 2, 0]} color="#394347" surface="concrete"/>
    <Road/>
    <Building spots={spots} roofVisible={roofVisible}/>
    <Ramp/>
    <Gate state={gate} onToggle={onGate}/>
    {typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('rota') && <RouteDebug/>}
  </>
}

export function ParkingModel({ spots, gate, roofVisible, view, onGate, onReady }: { spots: Spot[]; gate: GateState; roofVisible: boolean; view: CameraView; onGate: () => void; onReady?: (reset: () => void) => void }) {
  const controls = useRef<any>(null)
  const setCamera = (nextView: CameraView) => {
    const preset = cameraViews[nextView]
    if (!controls.current) return
    controls.current.object.up.set(...(nextView === 'top' ? [0, 0, 1] : [0, 1, 0]))
    controls.current.object.position.set(...preset.position)
    controls.current.target.set(...preset.target)
    controls.current.update()
  }
  useEffect(() => { setCamera(view) }, [view])
  useEffect(() => { onReady?.(() => setCamera('isometric')) }, [onReady])
  return <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }} camera={{ position: cameraViews.isometric.position, fov: 37 }}>
    <PerspectiveCamera makeDefault position={cameraViews.isometric.position} fov={37}/>
    <Scene spots={spots} gate={gate} roofVisible={roofVisible} onGate={onGate}/>
    <OrbitControls makeDefault ref={controls} enablePan={false} minDistance={26} maxDistance={78} maxPolarAngle={Math.PI / 2.03} target={target}/>
  </Canvas>
}
