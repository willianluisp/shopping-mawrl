import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [siteUrl, outputDir] = process.argv.slice(2)
if (!siteUrl || !outputDir) throw new Error('Uso: node scripts/browser-qa.mjs <url-local> <pasta-de-capturas>')

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const profile = await mkdtemp(join(tmpdir(), 'mawrl-browser-qa-'))
const processChrome = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-webgl',
  '--use-gl=angle', '--use-angle=swiftshader', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--window-size=1600,1100', siteUrl,
], { stdio: 'ignore', windowsHide: true })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let port
for (let i = 0; i < 100; i++) {
  try { port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break } catch { await sleep(100) }
}
if (!port) throw new Error('Chrome não iniciou a porta de depuração local')

let target
for (let i = 0; i < 100; i++) {
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  target = pages.find((page) => page.type === 'page' && page.url.startsWith(siteUrl))
  if (target) break
  await sleep(100)
}
if (!target) throw new Error('Página de teste não encontrada no Chrome')

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }) })
let nextId = 1
const pending = new Map()
const errors = []
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const task = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) task.reject(new Error(JSON.stringify(message.error)))
    else task.resolve(message.result)
  } else if (message.method === 'Runtime.exceptionThrown' || message.method === 'Log.entryAdded') {
    errors.push(message.params)
  }
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}
const capture = async (name) => {
  await sleep(1200)
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  const buffer = Buffer.from(shot.data, 'base64')
  await writeFile(join(outputDir, `${name}.png`), buffer)
  return buffer
}
const clickButton = (label) => evaluate(`Array.from(document.querySelectorAll('button')).find((button) => button.textContent.trim() === ${JSON.stringify(label)})?.click() ?? false`)

try {
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.enable')
  await send('Page.reload', { ignoreCache: true })
  await sleep(4500)
  console.log('Canvas:', await evaluate(`({present: Boolean(document.querySelector('canvas')), width: document.querySelector('canvas')?.width, height: document.querySelector('canvas')?.height})`))
  await capture('isometric')
  for (const [label, filename] of [['Frente', 'front'], ['Topo', 'top']]) {
    await clickButton(label)
    await capture(filename)
  }
  await clickButton('▱ Ocultar teto')
  await capture('top-open-roof')
  await clickButton('▰ Exibir teto')
  let centeredImage
  for (const [label, filename] of [['Dir.', 'right'], ['Traseira', 'rear'], ['Iso', 'isometric-return']]) {
    await clickButton(label)
    const screenshot = await capture(filename)
    if (filename === 'isometric-return') centeredImage = screenshot
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 500, y: 650 })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 500, y: 650, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 620, y: 650, button: 'left', buttons: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 620, y: 650, button: 'left', clickCount: 1 })
  const orbitedImage = await capture('orbited')
  assert.ok(!orbitedImage.equals(centeredImage), 'arrastar deve rotacionar a maquete')
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 500, y: 650, deltaX: 0, deltaY: -260 })
  const zoomedImage = await capture('zoomed')
  assert.ok(!zoomedImage.equals(orbitedImage), 'roda do mouse deve alterar zoom')
  await clickButton('↺ Centralizar')
  await capture('recentered')
  const before = await evaluate(`document.querySelector('.gate-card h3')?.textContent`)
  await clickButton('Abrir ↑')
  const opened = await evaluate(`document.querySelector('.gate-card h3')?.textContent`)
  await clickButton('Fechar ↓')
  const closed = await evaluate(`document.querySelector('.gate-card h3')?.textContent`)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 700, y: 875 })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 700, y: 875, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 700, y: 875, button: 'left', clickCount: 1 })
  await sleep(400)
  const clickedIn3D = await evaluate(`document.querySelector('.gate-card h3')?.textContent`)
  await capture('gate-open')
  await clickButton('Vaga 03Livre')
  const counters = await evaluate(`Array.from(document.querySelectorAll('.metrics b')).map((item) => item.textContent)`)
  assert.equal(before, 'Cancela fechada')
  assert.equal(opened, 'Cancela aberta')
  assert.equal(closed, 'Cancela fechada')
  assert.equal(clickedIn3D, 'Cancela aberta')
  assert.deepEqual(counters, ['05', '04', '00', '04'])
  console.log('Cancela:', { before, opened, closed, clickedIn3D }, 'Contadores após ocupar vaga 03:', counters)
  await send('Page.navigate', { url: `${siteUrl}?rota=1` })
  await sleep(3500)
  await clickButton('Topo')
  await clickButton('▱ Ocultar teto')
  await capture('route-top')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await send('Page.navigate', { url: siteUrl })
  await sleep(3500)
  const mobile = await evaluate(`({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, canvas: Boolean(document.querySelector('canvas')) })`)
  assert.equal(mobile.width, 390)
  assert.equal(mobile.scrollWidth, 390)
  assert.ok(mobile.canvas)
  console.log('Mobile:', mobile)
  await capture('mobile')
  const relevantErrors = errors.filter((entry) => entry.entry?.level === 'error' || entry.exceptionDetails)
  assert.deepEqual(relevantErrors, [])
  console.log('Erros do navegador:', relevantErrors)
} finally {
  ws.close()
  processChrome.kill()
}
