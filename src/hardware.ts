export type VagaFisica = { id: number; ocupada: boolean; leitura_valida: boolean; ultima_leitura_ms: number; distancia_cm: number | null }
export type DadosVagas = { dispositivo: 'mawrl-sensores'; uptime_ms: number; vagas: VagaFisica[] }
export type DadosCancela = { dispositivo: 'mawrl-cancela'; estado: 'aberta' | 'fechada' | 'desconhecida'; uptime_ms: number }

async function obterJSON(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<unknown> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json() as unknown
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function lerSensores(): Promise<DadosVagas> {
  const data = await obterJSON('/api/sensores/vagas')
  if (typeof data !== 'object' || data === null || !('dispositivo' in data) || data.dispositivo !== 'mawrl-sensores' || !('vagas' in data) || !Array.isArray(data.vagas)) {
    throw new Error('Resposta inválida dos sensores')
  }
  const vagas = data.vagas as unknown[]
  if (vagas.length !== 4 || !vagas.every((v, i) => typeof v === 'object' && v !== null && 'id' in v && v.id === i + 1 && 'ocupada' in v && typeof v.ocupada === 'boolean' && 'leitura_valida' in v && typeof v.leitura_valida === 'boolean')) {
    throw new Error('Formato das quatro vagas inválido')
  }
  return data as DadosVagas
}

function validarCancela(data: unknown): DadosCancela {
  if (typeof data !== 'object' || data === null || !('dispositivo' in data) || data.dispositivo !== 'mawrl-cancela' || !('estado' in data) || !['aberta', 'fechada', 'desconhecida'].includes(String(data.estado))) {
    throw new Error('Resposta inválida da cancela')
  }
  return data as DadosCancela
}

export async function lerCancela(): Promise<DadosCancela> {
  return validarCancela(await obterJSON('/api/cancela/status'))
}
export async function comandarCancela(destino: 'open' | 'closed'): Promise<DadosCancela> {
  return validarCancela(await obterJSON(`/api/cancela/${destino === 'open' ? 'abrir' : 'fechar'}`, { method: 'POST' }, 4000))
}
