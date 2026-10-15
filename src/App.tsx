import { useMemo, useRef, useState } from 'react'
import { demoGateway, initialDemoSpots } from './data/demo'
import { ParkingModel } from './scene/ParkingModel'
import type { CameraView, GateState, Spot } from './types'

const views: Array<{ id: CameraView; label: string }> = [
  { id: 'isometric', label: 'Iso' }, { id: 'front', label: 'Frente' }, { id: 'right', label: 'Dir.' },
  { id: 'left', label: 'Esq.' }, { id: 'rear', label: 'Traseira' }, { id: 'top', label: 'Topo' },
]

export default function App() {
  const [spots, setSpots] = useState<Spot[]>(initialDemoSpots)
  const [gate, setGate] = useState<GateState>(demoGateway.initialGate)
  const [roofVisible, setRoofVisible] = useState(true)
  const [view, setView] = useState<CameraView>('isometric')
  const resetCamera = useRef<() => void>(() => undefined)
  const monitored = useMemo(() => spots.filter((spot) => spot.monitored), [spots])
  const available = useMemo(() => monitored.filter((spot) => !spot.occupied).length, [monitored])
  const occupied = monitored.length - available
  const toggleGate = () => setGate((current) => current === 'closed' ? 'open' : 'closed')

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">M</span><div><strong>SHOPPING MAWRL</strong><small>ESTACIONAMENTO INTELIGENTE</small></div></div><div className="demo-badge"><i/> MODO DEMONSTRAÇÃO</div></header>
    <section className="intro"><div><p className="eyebrow">GÊMEO DIGITAL · MAQUETE FÍSICA</p><h1>Estacionar, visualizar<br/><em>e controlar.</em></h1><p className="lede">Representação interativa da maquete SHOPPING MAWRL: cinco vagas físicas, quatro monitoradas e uma vaga PCD sem leitura eletrônica. Arraste para orbitar, use a roda para aproximar e clique na cancela para acioná-la.</p></div><div className="connection"><span className="offline-dot"/> <div><b>Simulação local</b><small>ESP32 não conectado nesta etapa</small></div></div></section>
    <section className="workspace">
      <div className="scene-card">
        <div className="scene-toolbar"><span>{views.find((item) => item.id === view)?.label.toUpperCase()} · VISTA 3D</span><div className="scene-actions"><div className="view-switcher">{views.map((item) => <button key={item.id} className={view === item.id ? 'selected' : ''} onClick={() => setView(item.id)}>{item.label}</button>)}</div><button onClick={() => setRoofVisible((visible) => !visible)}>{roofVisible ? '▱ Ocultar teto' : '▰ Exibir teto'}</button><button onClick={() => { setView('isometric'); resetCamera.current() }}>↺ Centralizar</button></div></div>
        <div className="scene-viewport">
          <ParkingModel spots={spots} gate={gate} roofVisible={roofVisible} view={view} onGate={toggleGate} onReady={(reset) => { resetCamera.current = reset }}/>
          <div className="scene-hint">Clique na cancela amarela para {gate === 'closed' ? 'abrir' : 'fechar'} · Controle 3D</div>
        </div>
      </div>
      <aside className="panel"><div className="panel-head"><div><p className="eyebrow">OCUPAÇÃO MONITORADA</p><h2>Vagas do piso superior</h2></div><span className="live-pill">DEMO</span></div>
        <div className="metrics"><div><b>05</b><span>Físicas</span></div><div><b>04</b><span>Monitoradas</span></div><div className="free"><b>{String(available).padStart(2, '0')}</b><span>Livres</span></div><div className="busy"><b>{String(occupied).padStart(2, '0')}</b><span>Ocupadas</span></div></div>
        <div className="monitor-note">Contadores consideram apenas as quatro vagas com sensor. A vaga PCD não tem estado inferido.</div>
        <div className="spots">{spots.map((spot) => spot.monitored ? <button key={spot.id} className={`spot ${spot.occupied ? 'occupied' : 'free'}`} onClick={() => setSpots((state) => demoGateway.toggleSpot(state, spot.id))}><span className="status-dot"/><span>Vaga 0{spot.id}</span><b>{spot.occupied ? 'Ocupada' : 'Livre'}</b></button> : <div key={spot.id} className="spot pcd-spot"><span className="pcd-icon">♿</span><span>Vaga 05 · PCD</span><b>Sem monitoramento</b></div>)}</div>
        <div className="gate-card"><div><p className="eyebrow">ACESSO PRINCIPAL</p><h3>Cancela {gate === 'open' ? 'aberta' : 'fechada'}</h3><small>Estado visual de demonstração</small></div><div className="gate-actions"><button className="gate-button" disabled={gate === 'open'} onClick={() => setGate('open')}>Abrir <span>↑</span></button><button className="gate-button secondary" disabled={gate === 'closed'} onClick={() => setGate('closed')}>Fechar <span>↓</span></button></div></div>
      </aside>
    </section>
    <footer><span>SHOPPING MAWRL · VERSÃO DEMONSTRAÇÃO</span><span>Dados e acionamento físico serão integrados posteriormente.</span></footer>
  </main>
}
