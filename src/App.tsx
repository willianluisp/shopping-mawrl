import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { demoGateway, initialDemoSpots } from './data/demo'
import { comandarCancela, lerCancela, lerSensores } from './hardware'
import { ParkingModel } from './scene/ParkingModel'
import type { CameraView, GateState, Spot } from './types'

type Conn = 'checking' | 'online' | 'offline'
type Mode = 'demo' | 'real'
const views: Array<{ id: CameraView; label: string }> = [
  { id: 'isometric', label: 'Iso' }, { id: 'front', label: 'Frente' }, { id: 'right', label: 'Dir.' },
  { id: 'left', label: 'Esq.' }, { id: 'rear', label: 'Traseira' }, { id: 'top', label: 'Topo' },
]

export default function App() {
  const [mode, setMode] = useState<Mode>('demo')
  const [demoSpots, setDemoSpots] = useState<Spot[]>(initialDemoSpots)
  const [demoGate, setDemoGate] = useState<GateState>(demoGateway.initialGate)
  const [physicalSpots, setPhysicalSpots] = useState<Spot[] | null>(null)
  const [physicalGate, setPhysicalGate] = useState<GateState | null>(null)
  const [sensorsStatus, setSensorsStatus] = useState<Conn>('checking')
  const [gateStatus, setGateStatus] = useState<Conn>('checking')
  const [validSensors, setValidSensors] = useState<boolean[]>([false, false, false, false])
  const [gateBusy, setGateBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [roofVisible, setRoofVisible] = useState(true)
  const [view, setView] = useState<CameraView>('isometric')
  const resetCamera = useRef<() => void>(() => undefined)
  const modeRef = useRef(mode)
  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    if (mode !== 'real') return
    let active = true
    let sensorsTimer: number | undefined
    let gateTimer: number | undefined
    const refreshSensors = async () => {
      try {
        const data = await lerSensores()
        if (!active) return
        setPhysicalSpots([...data.vagas.map((v): Spot => ({ id: v.id, kind: 'conventional', monitored: true, occupied: v.leitura_valida ? v.ocupada : undefined })), { id: 5, kind: 'pcd', monitored: false }])
        setValidSensors(data.vagas.map((v) => v.leitura_valida))
        setSensorsStatus('online')
      } catch {
        if (active) { setSensorsStatus('offline'); setPhysicalSpots(null) }
      } finally {
        if (active) sensorsTimer = window.setTimeout(refreshSensors, 500)
      }
    }
    const refreshGate = async () => {
      try {
        const data = await lerCancela()
        if (!active) return
        setGateStatus('online')
        setPhysicalGate(data.estado === 'desconhecida' ? null : data.estado === 'aberta' ? 'open' : 'closed')
      } catch {
        if (active) { setGateStatus('offline'); setPhysicalGate(null) }
      } finally {
        if (active) gateTimer = window.setTimeout(refreshGate, 1200)
      }
    }
    setSensorsStatus('checking'); setGateStatus('checking')
    void refreshSensors(); void refreshGate()
    return () => { active = false; window.clearTimeout(sensorsTimer); window.clearTimeout(gateTimer) }
  }, [mode])

  const sendGate = useCallback(async (destino: GateState) => {
    if (modeRef.current === 'demo') { setDemoGate(destino); return }
    if (gateBusy || gateStatus !== 'online') return
    setGateBusy(true); setNotice('')
    try {
      const result = await comandarCancela(destino)
      if (modeRef.current === 'real') {
        setGateStatus('online')
        setPhysicalGate(result.estado === 'desconhecida' ? null : result.estado === 'aberta' ? 'open' : 'closed')
      }
    } catch {
      if (modeRef.current === 'real') {
        setGateStatus('offline'); setPhysicalGate(null)
        setNotice('Falha ao enviar comando. Verifique a cancela antes de tentar novamente.')
      }
    } finally { setGateBusy(false) }
  }, [gateBusy, gateStatus])

  const spots = mode === 'demo' ? demoSpots : (physicalSpots ?? [
    ...[1, 2, 3, 4].map((id) => ({ id, kind: 'conventional' as const, monitored: true, occupied: undefined })),
    { id: 5, kind: 'pcd' as const, monitored: false },
  ])
  const gate = mode === 'demo' ? demoGate : (physicalGate ?? 'closed')
  const monitored = useMemo(() => spots.filter((spot) => spot.monitored), [spots])
  const sensorDataAvailable = mode === 'demo' || (sensorsStatus === 'online' && physicalSpots !== null && validSensors.every(Boolean))
  const available = sensorDataAvailable ? monitored.filter((spot) => !spot.occupied).length : null
  const occupied = available === null ? null : monitored.length - available
  const toggleGate = () => {
    if (mode === 'real' && (gateBusy || gateStatus !== 'online' || physicalGate === null)) return
    void sendGate(gate === 'closed' ? 'open' : 'closed')
  }
  const changeMode = (next: Mode) => { setMode(next); setNotice(''); if (next === 'real') { setPhysicalSpots(null); setPhysicalGate(null) } }

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">M</span><div><strong>SHOPPING MAWRL</strong><small>ESTACIONAMENTO INTELIGENTE</small></div></div><div className="mode-controls"><button className={mode === 'demo' ? 'mode-selected' : ''} onClick={() => changeMode('demo')}>Demonstração</button><button className={mode === 'real' ? 'mode-selected' : ''} onClick={() => changeMode('real')}>Modo real</button></div></header>
    <section className="intro"><div><p className="eyebrow">GÊMEO DIGITAL · MAQUETE FÍSICA</p><h1>Estacionar, visualizar<br/><em>e controlar.</em></h1><p className="lede">Representação interativa da maquete SHOPPING MAWRL: cinco vagas físicas, quatro monitoradas e uma vaga PCD sem leitura eletrônica. Arraste para orbitar, use a roda para aproximar e clique na cancela para acioná-la.</p><br /><p className="eyebrow">Feito por: <b>Willian L · Luis F · Matheus X · Rui G · Arthur H </b></p></div><div className="connection"><span className={mode === 'real' && sensorsStatus === 'online' && gateStatus === 'online' ? 'online-dot' : 'offline-dot'}/><div><b>{mode === 'demo' ? 'Simulação local' : 'Conexão com a maquete'}</b><small>{mode === 'demo' ? 'Modo demonstração · sem acionamento físico' : `Sensores: ${sensorsStatus === 'online' ? 'conectados' : sensorsStatus === 'checking' ? 'verificando' : 'desconectados'} · Cancela: ${gateStatus === 'online' ? 'conectada' : gateStatus === 'checking' ? 'verificando' : 'desconectada'}`}</small></div></div></section>
    <section className="workspace">
      <div className="scene-card">
        <div className="scene-toolbar"><span>{views.find((item) => item.id === view)?.label.toUpperCase()} · VISTA 3D</span><div className="scene-actions"><div className="view-switcher">{views.map((item) => <button key={item.id} className={view === item.id ? 'selected' : ''} onClick={() => setView(item.id)}>{item.label}</button>)}</div><button onClick={() => setRoofVisible((visible) => !visible)}>{roofVisible ? '▱ Ocultar teto' : '▰ Exibir teto'}</button><button onClick={() => { setView('isometric'); resetCamera.current() }}>↺ Centralizar</button></div></div>
        <div className="scene-viewport"><ParkingModel spots={spots} gate={gate} roofVisible={roofVisible} view={view} onGate={toggleGate} onReady={(reset) => { resetCamera.current = reset }}/><div className="scene-hint">{mode === 'real' && (physicalGate === null || gateStatus !== 'online') ? 'Posição da cancela indisponível · comando 3D desativado' : `Clique na cancela amarela para ${gate === 'closed' ? 'abrir' : 'fechar'} · Controle 3D`}</div></div>
      </div>
      <aside className="panel"><div className="panel-head"><div><p className="eyebrow">OCUPAÇÃO MONITORADA</p><h2>Vagas do piso superior</h2></div><span className="live-pill">{mode === 'demo' ? 'DEMO' : sensorsStatus === 'online' ? 'AO VIVO' : 'SEM SINAL'}</span></div>
        <div className="metrics"><div><b>05</b><span>Físicas</span></div><div><b>04</b><span>Monitoradas</span></div><div className="free"><b>{available === null ? '—' : String(available).padStart(2, '0')}</b><span>Livres</span></div><div className="busy"><b>{occupied === null ? '—' : String(occupied).padStart(2, '0')}</b><span>Ocupadas</span></div></div>
        <div className="monitor-note">{mode === 'real' && !sensorDataAvailable ? 'Uma ou mais leituras estão indisponíveis. Os contadores ficam suspensos até todas as vagas responderem.' : 'Contadores consideram apenas as quatro vagas com sensor. A vaga PCD não tem estado inferido.'}</div>
        <div className="spots">{spots.map((spot) => spot.monitored ? <button key={spot.id} disabled={mode === 'real'} className={`spot ${mode === 'real' && (!sensorDataAvailable || !validSensors[spot.id - 1]) ? 'unavailable' : spot.occupied ? 'occupied' : 'free'}`} onClick={() => { if (mode === 'demo') setDemoSpots((state) => demoGateway.toggleSpot(state, spot.id)) }}><span className="status-dot"/><span>Vaga 0{spot.id}</span><b>{mode === 'real' && sensorsStatus !== 'online' ? 'Sem sinal' : mode === 'real' && !validSensors[spot.id - 1] ? 'Leitura inválida' : spot.occupied ? 'Ocupada' : 'Livre'}</b></button> : <div key={spot.id} className="spot pcd-spot"><span className="pcd-icon">♿</span><span>Vaga 05 · PCD</span><b>Sem monitoramento</b></div>)}</div>
        <div className="gate-card"><div><p className="eyebrow">ACESSO PRINCIPAL</p><h3>Cancela {mode === 'real' && (physicalGate === null || gateStatus !== 'online') ? 'sem estado confirmado' : gate === 'open' ? 'aberta' : 'fechada'}</h3><small>{mode === 'demo' ? 'Estado visual de demonstração' : 'Posição comandada pela ESP32 (sem sensor de posição)'}</small></div><div className="gate-actions"><button className="gate-button" disabled={gateBusy || (mode === 'real' && gateStatus !== 'online') || (mode === 'real' && physicalGate === null ? false : gate === 'open')} onClick={() => void sendGate('open')}>Abrir <span>↑</span></button><button className="gate-button secondary" disabled={gateBusy || (mode === 'real' && gateStatus !== 'online') || (mode === 'real' && physicalGate === null ? false : gate === 'closed')} onClick={() => void sendGate('closed')}>Fechar <span>↓</span></button></div>{notice && <p className="hardware-notice" role="alert">{notice}</p>}</div>
      </aside>
    </section>
    <footer><span>SHOPPING MAWRL · {mode === 'demo' ? 'VERSÃO DEMONSTRAÇÃO' : 'CONTROLE LOCAL'}</span><span>{mode === 'demo' ? 'Simulação sem acionamento físico.' : 'Conexão local pela rede SHOPPING_MAWRL · Vite'}</span></footer>
  </main>
}
