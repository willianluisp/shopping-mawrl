import * as THREE from 'three'

export type Surface = 'asphalt' | 'concrete' | 'paint' | 'roof' | 'glass' | 'metal' | 'marking'

const textures = new Map<Surface, THREE.DataTexture>()

/** Tiny deterministic grain maps keep the scene lightweight and avoid flat plastic surfaces. */
export function surfaceTexture(surface: Surface): THREE.DataTexture | undefined {
  if (surface === 'glass' || surface === 'marking') return undefined
  const existing = textures.get(surface)
  if (existing) return existing

  const size = 64
  const data = new Uint8Array(size * size * 4)
  const contrast = surface === 'asphalt' ? 30 : surface === 'concrete' ? 20 : 10
  let seed = 173 + surface.length * 109
  for (let i = 0; i < size * size; i++) {
    seed = (1664525 * seed + 1013904223) >>> 0
    const grain = 235 - Math.floor((seed / 0xffffffff) * contrast)
    const offset = i * 4
    data[offset] = grain
    data[offset + 1] = grain
    data[offset + 2] = grain
    data[offset + 3] = 255
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  textures.set(surface, texture)
  return texture
}

export const finish: Record<Surface, { roughness: number; metalness: number }> = {
  asphalt: { roughness: 0.98, metalness: 0 },
  concrete: { roughness: 0.88, metalness: 0.02 },
  paint: { roughness: 0.65, metalness: 0.04 },
  roof: { roughness: 0.76, metalness: 0.08 },
  glass: { roughness: 0.16, metalness: 0.4 },
  metal: { roughness: 0.48, metalness: 0.55 },
  marking: { roughness: 0.9, metalness: 0 },
}
