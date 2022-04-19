import { cubicBezier } from "./utils.js"

const logEl = document.querySelector('.Log')

const containerEl = document.querySelector('.Parallax')
const scrollEl = document.querySelector('.Parallax_Scroll')

const s1Mars = document.querySelector('.Positioner-mars')
let s1MarsWidth = 0
const s1MarsSurface = document.querySelector('#s-mars-surface')
const s1MarsShadow = document.querySelector('#s-mars-shadow')
const s1Tip = document.querySelector('.Tip')

const s3Rocket = document.querySelector('#s-launch-rocket')
const s3Stand1 = document.querySelector('#s-launch-stand1')
const s3Stand2 = document.querySelector('#s-launch-stand2')
const s3Tower1Light = document.querySelector('#s-launch-tower1Light')
const s3Tower2Light = document.querySelector('#s-launch-tower2Light')
const s3Svg = document.querySelector('.Svg-launch')
const s3Ground = document.querySelector('#s-launch-ground')

const s5Bg = document.querySelector('.Parallax_Layer-moiBg')
const s5Progress = document.querySelector('#s-moi-porgress')
const s5Spacecraft = document.querySelector('#s-moi-spacecraft')
const s5SpacecraftFire = document.querySelector('#s-moi-spacecraftFire')
const s5Texts = document.querySelectorAll('.moiText')

const s6Credit = document.querySelector('.Credit')

const smokeCanvas = document.querySelector('.RocketSmoke')
const ctx = smokeCanvas.getContext("2d")
let smokeCanvasWidth = 0
let smokeCanvasHeight = 0
let smokeScale = 1
let smokeY = 0
let svgHeight = 0

let containerWidth = 0
let containerHeight = 0
let scrollWidth = 0
let scrollHeight = 0
let scrollX = 0
let scrollY = 0
let scrollXSmoothed = 0
let scrollYSmoothed = 0
let velocityX = 0
let velocityY = 0
let touched = false
let touchId = null
let lastTouchX = 0
let lastTouchY = 0
let firstMoveExceeded = false
let lastMove = 0
let lastTime = 0

const sceneEls = document.querySelectorAll('.Scene')
const sceneRects = []

function onResize() {
  containerWidth = containerEl.offsetWidth
  containerHeight = containerEl.offsetHeight

  scrollWidth = scrollEl.offsetWidth
  scrollHeight = scrollEl.offsetHeight

  sceneEls.forEach((s, i) => {
    sceneRects[i] = {
      top: s.offsetTop,
      height: s.offsetHeight
    }
  })

  s1MarsWidth = s1Mars.offsetWidth

  const svgRect = s3Svg.getBoundingClientRect()

  smokeCanvas.style.setProperty('height', `${
    s3Ground.getBoundingClientRect().top - svgRect.top
  }px`)

  const canvasRect = smokeCanvas.getBoundingClientRect()

  smokeCanvasWidth = Math.round(canvasRect.width * window.devicePixelRatio)
  smokeCanvasHeight = Math.round(canvasRect.height * window.devicePixelRatio)

  smokeCanvas.width = smokeCanvasWidth
  smokeCanvas.height = smokeCanvasHeight

  svgHeight = Math.round(svgRect.height * window.devicePixelRatio)
  smokeScale = Math.max(smokeCanvasWidth, svgHeight) / 1000
}

window.addEventListener('resize', onResize)

containerEl.addEventListener('touchstart', e => {
  const t = e.changedTouches[0]
  touchId = t.identifier
  touched = true
  firstMoveExceeded = false

  if (Math.abs(velocityX) && Math.abs(velocityX)) {
    e.preventDefault()
  }

  velocityX = 0
  velocityY = 0
})
containerEl.addEventListener('touchmove', e => {
  e.preventDefault()
  const ts = e.changedTouches
  if (touchId === null) {
    touchId = ts[0].identifier
    firstMoveExceeded = false
  }
  let nt = ts.length
  while (nt--) {
    const t = e.changedTouches[nt]
    if (t.identifier == touchId) {
      move(t.pageX, t.pageY)
      break
    }
  }
})
containerEl.addEventListener('touchend', e => {
  const now = performance.now()
  const ts = e.changedTouches
  let nt = ts.length
  while (nt--) {
    const t = e.changedTouches[nt]
    if (t.identifier == touchId) {
      touchId = null
      if (!e.touches.length) {
        touched = false
        if (firstMoveExceeded) {
          const timeDiff = now - lastMove
          if (timeDiff > 100) {
            velocityX = 0
            velocityY = 0
          }
        }
        lastMove = now
        stop()
      }
      break
    }
  }
})
containerEl.addEventListener('touchcancel', e => {
  const now = performance.now()
  const ts = e.changedTouches
  let nt = ts.length
  while (nt--) {
    const t = e.changedTouches[nt]
    if (t.identifier == touchId) {
      touchId = null
      if (!e.touches.length) {
        touched = false
        if (firstMoveExceeded) {
          const timeDiff = now - lastMove
          if (timeDiff > 100) {
            velocityX = 0
            velocityY = 0
          }
        }
        lastMove = now
        stop()
      }
      break
    }
  }
})

containerEl.addEventListener('wheel', e => {
  e.preventDefault()
  velocityY += e.deltaY * 0.003
})

function move(x, y) {
  const now = performance.now()
  if (!firstMoveExceeded) {
    firstMoveExceeded = true
  } else {
    const timeDiff = now - lastMove
    const dx = x - lastTouchX
    const dy = y - lastTouchY
    velocityX = -(dx * 1.2) / timeDiff
    velocityY = -(dy * 1.2) / timeDiff
    scroll(scrollX - dx, scrollY - dy)
  }
  lastTouchX = x
  lastTouchY = y
  lastMove = now
}

function stop() {
  firstMoveExceeded = false
}

function scroll(x, y) {
  x = Math.min(Math.max(0, x), scrollWidth - containerWidth)
  y = Math.min(Math.max(0, y), scrollHeight - containerHeight)
  scrollX = x
  scrollY = y
}

function step(now) {
  const dt = Math.min(now - lastTime, 150)
  lastTime = now

  if (!touched) {
    velocityX += -velocityX * 0.003 * dt
    velocityY += -velocityY * 0.003 * dt

    if (Math.abs(velocityX) < 0.01) velocityX = 0
    if (Math.abs(velocityY) < 0.01) velocityY = 0

    scrollX += velocityX * dt
    scrollY += velocityY * dt

    scrollX = Math.min(Math.max(0, scrollX), scrollWidth - containerWidth)
    scrollY = Math.min(Math.max(0, scrollY), scrollHeight - containerHeight)
  }

  scrollXSmoothed += (scrollX - scrollXSmoothed) / 5
  scrollYSmoothed += (scrollY - scrollYSmoothed) / 5

  const sx = Math.round(scrollXSmoothed * 1000) / 1000
  const sy = Math.round(scrollYSmoothed * 1000) / 1000

  // scrollEl.style.setProperty('transform', `translate(${-scrollX}px, ${-scrollY}px)`)
  scrollEl.style.setProperty('transform', `translate(${-sx}px, ${-sy}px)`)

  // Scene 1
  if (sy < sceneRects[0].height) {
    s1MarsSurface.style.setProperty('transform', `translateY(${-sy * 120/(120+240) * 640/s1MarsWidth}px)`)
    s1MarsShadow.style.setProperty('transform', `translateY(${-sy * 120/(120+480) * 640/s1MarsWidth}px)`)
    s1Tip.style.setProperty('opacity', sy > sceneRects[0].height * 0.25 ? 0 : 1)
  }

  // Scene 3
  const s3 = (sy + containerHeight - sceneRects[2].top) / (sceneRects[2].height + containerHeight)
  if (s3 >= 0 && s3 <= 1) {
    s5Bg.style.setProperty('--t', -121)
    //                             Start Duration Scale down so it wont go above 1
    let rocketTranslation = ((s3 - 0.32) / 0.5) / 1.36
    rocketTranslation = cubicBezier(.25,0,.5,.1, rocketTranslation) * (sceneRects[2].height / 2) * 1.36
    s3Rocket.style.setProperty('transform', `translateY(${-rocketTranslation}px)`)
    smokeY = -rocketTranslation

    let standRotation = (s3 - 0.26) / 0.12
    standRotation = cubicBezier(.5,0,.6,1, standRotation) * 7
    s3Stand1.style.setProperty('transform', `rotate(${-standRotation}deg)`)
    s3Stand2.style.setProperty('transform', `rotate(${standRotation}deg)`)

    let towerLight = s3 > 0.33 ? 1 : 0
    s3Tower1Light.style.setProperty('transform', `scale(${towerLight})`)
    s3Tower2Light.style.setProperty('transform', `scale(${towerLight})`)
  }

    // Scene 5
    const s5 = (sy + containerHeight - sceneRects[4].top) / (sceneRects[4].height + containerHeight)
    if (s5 >= 0 && s5 <= 1) {
      s5Bg.style.setProperty('--t', -119)
      const p = (s5 + 0.1) / 1.15
      // p = cubicBezier(0,0,1,1, p)
      // logEl.innerText = p
      s5Progress.setAttribute('keyPoints', `${p}; ${p}`)
      s5Progress.beginElement()

      s5Spacecraft.style.setProperty('transform', `rotate(${
        -115 +
        cubicBezier(.2,0,.5,1, (p - 0.175) / 0.35) *  195 +
        cubicBezier(.2,0,.8,1, (p - 0.65) / 0.275) *  -80
      }deg)`)

      s5SpacecraftFire.style.setProperty('transform', `scale(${
        cubicBezier(.1,0,.8,1, (p - 0.425) / 0.03) -
        cubicBezier(.1,0,.8,1, (p - 0.65) / 0.05)
      })`)

      s5Texts[0].classList.toggle('moiText-active', p >= 0.1 && p <= 0.35)
      s5Texts[1].classList.toggle('moiText-active', p >= 0.25 && p <= 0.5)
      s5Texts[2].classList.toggle('moiText-active', p >= 0.35 && p <= 0.675)
      s5Texts[3].classList.toggle('moiText-active', p >= 0.5 && p <= 0.75)
      s5Texts[4].classList.toggle('moiText-active', p >= 0.675 && p <= 0.8)
    }

    s6Credit.classList.toggle('Credit-active', sy > sceneRects[5].top - sceneRects[5].height * 0.01)

  requestAnimationFrame(step)
}

onResize()
lastTime = performance.now()
requestAnimationFrame(step)

document.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  }
})



function random(min, max) {
  return min + Math.random() * (max - min)
}

const MAX_PARTICLES = Infinity // 280
const COLOURS = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423']

const particles = []
const pool = []

class Particle {
  constructor(x, y, radius) {
    this.init(x, y, radius)
  }

  init(x, y, radius) {
    this.alive = true

    this.radius = radius || 10
    this.wander = 0.15
    this.theta = random(0, 2 * Math.PI)
    this.drag = 0.92
    this.color = '#fff'

    this.x = x || 0.0
    this.y = y || 0.0

    this.vx = 0.0
    this.vy = 0.0
  }

  move() {
    this.x += this.vx
    this.y += this.vy

    this.vx *= this.drag
    this.vy *= this.drag

    this.theta += random(-0.5, 0.5) * this.wander
    this.vx += Math.sin(this.theta) * 0.01
    this.vy += Math.cos(this.theta) * 0.01

    // this.radius *= 1.02 /* 0.96 */
    this.radius += 0.5
    // if (this.y < 740 + smokeY) this.radius += 1
    this.alive = this.radius < 60
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    // ctx.fillStyle = this.color
    ctx.fillStyle = `hsla(0deg, 0%, 100%, ${1 - (this.radius - 20) / 40})`
    ctx.fill()
  }
}


function init() {
  let i, x, y

  for (i = 0; i < 20; i++) {
    x = (smokeCanvasWidth * 0.5) + random(-100, 100)
    y = (smokeCanvasHeight * 0.5) + random(-100, 100)
    spawn(x, y)
  }
}

function spawn(x, y) {
  if (particles.length >= MAX_PARTICLES)
    pool.push(particles.shift())

  const particle = pool.length ? pool.pop() : new Particle()
  particle.init(x, y, random(10, 15 /* 40 */))

  // particle.wander = random(0.5, 2.0)
  particle.wander = 0
  particle.color = COLOURS[Math.floor(Math.random() * COLOURS.length)]
  // particle.drag = random(0.9, 0.99)
  particle.drag = 1

  // const theta = random(0, 2 * Math.PI)
  // const theta = random(-0.1, 0.1)
  const theta = 0
  // const force = random(2, 8)
  const force = random(2, 8)

  particle.vx = Math.sin(theta) * force
  particle.vy = Math.cos(theta) * force

  particles.push(particle)
}

function update() {
  let i, particle

  for (i = particles.length - 1; i >= 0; i--) {
    particle = particles[i]

    if (particle.alive) particle.move()
    else pool.push(particles.splice(i, 1)[0])
  }
}

function draw() {
  ctx.globalCompositeOperation = 'lighter'

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].draw(ctx)
  }
}

function step2() {
  requestAnimationFrame(step2)

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(smokeScale, smokeScale)
  ctx.translate(-(1000 - smokeCanvasWidth / smokeScale) / 2, -(1000 - svgHeight / smokeScale) / 2)
  ctx.clearRect(0, 0, 1000, 1000)

  logEl.innerText = [smokeCanvasWidth, smokeCanvasHeight, particles.length]

  const max = random(1, 2)
  for (let i = 0; i < max; i++) spawn(494, 740 + smokeY)
  update()
  draw()
}

init()
step2()
