import assert from 'node:assert/strict'
import { model } from '../src/config/model.ts'
import { initialDemoSpots } from '../src/data/demo.ts'

const { base, road, building, parking, ramp, supports, vehicle, gate } = model
const halfWidth = vehicle.bodyWidth * vehicle.scale / 2
const halfLength = vehicle.bodyLength * vehicle.scale / 2
const turnEndZ = vehicle.upperTurnStartZ + vehicle.turnRadius
const step = Math.PI / 128
const upperY = parking.floorY + parking.surfaceOffset
const roadFrontEdge = (road.front + road.rear - road.depth) / 2

const rects = [
  { name: 'rampa', x0: ramp.centerX - ramp.width / 2, x1: ramp.centerX + ramp.width / 2, z0: ramp.bottomZ, z1: ramp.topZ },
  { name: 'patamar', x0: ramp.centerX + ramp.landingShiftX - ramp.landingWidth / 2, x1: ramp.centerX + ramp.landingShiftX + ramp.landingWidth / 2, z0: ramp.topZ, z1: ramp.landingRear },
  { name: 'circulacao', x0: -building.width / 2 + .25, x1: building.width / 2 - .25, z0: parking.aisleFront, z1: parking.aisleRear },
  { name: 'vagas', x0: -building.width / 2 + .25, x1: building.width / 2 - .25, z0: parking.bayFront, z1: parking.bayRear },
]

function drivable(x, z) {
  return rects.some(({ x0, x1, z0, z1 }) => x >= x0 - 1e-6 && x <= x1 + 1e-6 && z >= z0 - 1e-6 && z <= z1 + 1e-6)
}

function footprint({ x, z, yaw }) {
  const points = []
  for (let a = -4; a <= 4; a++) for (let b = -8; b <= 8; b++) {
    const lateral = halfWidth * a / 4
    const longitudinal = halfLength * b / 8
    points.push({ x: x + lateral * Math.cos(yaw) + longitudinal * Math.sin(yaw), z: z - lateral * Math.sin(yaw) + longitudinal * Math.cos(yaw) })
  }
  return points
}

function checkPose(pose, label) {
  for (const point of footprint(pose)) {
    assert.ok(drivable(point.x, point.z), `${label}: carro fora da pista em (${point.x.toFixed(2)}, ${point.z.toFixed(2)})`)
    for (const side of [-1, 1]) for (const pillarZ of [supports.frontZ, supports.rearZ]) {
      const pillarX = side * supports.sideX
      assert.ok(Math.abs(point.x - pillarX) > .35 || Math.abs(point.z - pillarZ) > .35, `${label}: pilar intercepta a trajetoria`)
    }
    assert.ok(point.z < building.rear - .34 || point.x < -building.width / 2, `${label}: parede traseira intercepta a trajetoria`)
    assert.ok(point.x < building.width / 2 - .39 || point.z < 2.1, `${label}: parede lateral intercepta a trajetoria`)
    assert.ok(point.x > ramp.centerX - ramp.width / 2 + .28 || point.z < ramp.topZ, `${label}: guarda-corpo externo intercepta a trajetoria`)
  }
}

assert.equal(parking.bayCenters.length, 5, 'devem existir cinco vagas fisicas')
assert.deepEqual(initialDemoSpots.map((spot) => spot.monitored), [true, true, true, true, false], 'somente quatro vagas monitoradas')
assert.ok(!('occupied' in initialDemoSpots[4]), 'PCD sem estado de ocupacao automatico')
assert.ok(ramp.width === 7 && base.width === 40 && base.depth === 38, 'proporcoes principais da maquete')
assert.ok(ramp.bottomZ > road.front && ramp.bottomZ < road.rear, 'rampa deve comecar no asfalto')
assert.ok(ramp.bottomZ - roadFrontEdge > vehicle.bodyLength * vehicle.scale, 'acesso plano deve acomodar um carro inteiro')
assert.ok(gate.z < ramp.bottomZ && ramp.bottomZ - gate.z <= 1.2 && gate.x < ramp.centerX, 'cancela junto ao inicio da subida')
assert.ok(gate.z + .67 < ramp.bottomZ, 'base da cancela nao pode interceptar protecoes da rampa')
assert.ok(gate.z - .1 - vehicle.bodyLength * vehicle.scale >= roadFrontEdge, 'carro deve poder aguardar no plano antes da cancela')
assert.ok(gate.x + gate.arm > ramp.centerX + ramp.width / 2 - .3, 'braco fechado deve atravessar a faixa de subida')
assert.ok(gate.x + .675 < ramp.centerX - halfWidth, 'base da cancela nao pode obstruir o carro')
assert.ok(ramp.topZ < vehicle.upperTurnStartZ && vehicle.upperTurnStartZ + vehicle.turnRadius + halfLength < ramp.landingRear, 'trecho plano deve acomodar a curva inteira')
assert.ok(vehicle.upperTurnStartZ - ramp.topZ >= halfLength, 'carro precisa chegar inteiro ao patamar antes da curva')
assert.ok(ramp.landingRear >= parking.aisleRear - .06, 'patamar deve se conectar ao corredor')
assert.ok(road.crosswalkX - 1.7 > ramp.centerX + ramp.width / 2, 'faixa de pedestres nao pode cruzar a rampa')
assert.ok(parking.bayFront === parking.aisleRear, 'corredor deve tocar as vagas')
assert.ok(parking.bayRear - parking.bayFront > 4.5, 'cinco vagas com profundidade ampliada')
assert.ok(Math.abs(upperY - (building.groundHeight + parking.surfaceOffset)) < 1e-6, 'rampa e segundo piso no mesmo nivel')
assert.ok(ramp.topZ - ramp.bottomZ >= 12, 'subida precisa continuar pela lateral até o patamar')
assert.ok((upperY - road.surfaceY) / (ramp.topZ - ramp.bottomZ) < 1.2, 'inclinação ultrapassa a geometria estimada da maquete')
const slopeHeight = (z) => road.surfaceY + (upperY - road.surfaceY) * (z - ramp.bottomZ) / (ramp.topZ - ramp.bottomZ)
assert.ok(Math.abs(slopeHeight(ramp.bottomZ) - road.surfaceY) < 1e-9, 'sem degrau inferior')
assert.ok(Math.abs(slopeHeight(ramp.topZ) - upperY) < 1e-9, 'sem degrau superior')

// Stop before the closed arm, then cross the flat access and entire inclined lane.
for (let z = gate.z - .1 - halfLength; z <= ramp.bottomZ; z += .1) {
  assert.ok(z - halfLength >= roadFrontEdge - .01, 'carro fora do asfalto frontal')
  assert.ok(ramp.centerX - halfWidth > ramp.centerX - ramp.width / 2 + .28, 'carro toca a protecao externa')
  assert.ok(ramp.centerX + halfWidth < ramp.centerX + ramp.width / 2 - .28, 'carro toca a protecao interna')
}
for (let z = ramp.bottomZ; z <= ramp.topZ; z += .1) {
  assert.ok(slopeHeight(z) >= road.surfaceY && slopeHeight(z) <= upperY, 'superficie da subida descontínua')
}

for (const bayX of parking.bayCenters) {
  const name = `vaga ${bayX}`
  for (let z = ramp.topZ + halfLength; z <= vehicle.upperTurnStartZ; z += .1) checkPose({ x: ramp.centerX, z, yaw: 0 }, name)
  for (let theta = 0; theta <= Math.PI / 2 + step / 2; theta += step) {
    checkPose({ x: ramp.centerX + vehicle.turnRadius * (1 - Math.cos(theta)), z: vehicle.upperTurnStartZ + vehicle.turnRadius * Math.sin(theta), yaw: theta }, `${name} / curva da rampa`)
  }
  const firstTurnEndX = ramp.centerX + vehicle.turnRadius
  const secondTurnStartX = bayX - vehicle.turnRadius
  assert.ok(secondTurnStartX >= firstTurnEndX, `${name}: corredor insuficiente`)
  for (let x = firstTurnEndX; x <= secondTurnStartX; x += .1) checkPose({ x, z: turnEndZ, yaw: Math.PI / 2 }, `${name} / corredor`)
  for (let theta = 0; theta <= Math.PI / 2 + step / 2; theta += step) {
    checkPose({ x: secondTurnStartX + vehicle.turnRadius * Math.sin(theta), z: turnEndZ + vehicle.turnRadius * (1 - Math.cos(theta)), yaw: Math.PI / 2 - theta }, `${name} / entrada da vaga`)
  }
  const bayMiddle = (parking.bayFront + parking.bayRear) / 2
  for (let z = turnEndZ + vehicle.turnRadius; z <= bayMiddle; z += .1) checkPose({ x: bayX, z, yaw: 0 }, `${name} / estacionamento`)
  assert.ok(bayMiddle + halfLength < parking.bayRear, `${name}: carro nao cabe na vaga`)
}

console.log(`Geometria verificada: 5 trajetorias; acesso plano ${ (ramp.bottomZ - roadFrontEdge).toFixed(1) } cm, subida ${ (ramp.topZ - ramp.bottomZ).toFixed(1) } cm, inclinacao ${ (Math.atan2(upperY - road.surfaceY, ramp.topZ - ramp.bottomZ) * 180 / Math.PI).toFixed(1) }°; sem pilares, paredes ou guarda-corpos no percurso.`)
