const containerEl = document.querySelector('.Parallax')
const scrollEl = document.querySelector('.Parallax_Scroll')
const portalScrollEls = document.querySelectorAll('.Parallax_PortalScroll')

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
let lastTime = 0
let lastMove = 0
let timeLast = 0

new ResizeObserver(() => {
  containerWidth = containerEl.offsetWidth
  containerHeight = containerEl.offsetHeight
}).observe(containerEl)
new ResizeObserver(() => {
  scrollWidth = scrollEl.offsetWidth
  scrollHeight = scrollEl.offsetHeight
}).observe(scrollEl)

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

function step(timeNow) {
  const dt = Math.min(timeNow - timeLast, 150)
  timeLast = timeNow

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

  portalScrollEls[0].style.setProperty('transform', `translateY(${-sy}px)`)

  requestAnimationFrame(step)
}

timeLast = performance.now()
requestAnimationFrame(step)

document.documentElement.onclick = function() { this.requestFullscreen() }
