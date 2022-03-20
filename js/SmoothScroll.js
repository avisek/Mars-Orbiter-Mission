export class SmoothScroll {
  container = null
  content = null
  eventListenersBound = false
  resizeObserver = null
  containerWidth = 0
  containerHeight = 0
  contentWidth = 0
  contentHeight = 0
  scrollX = 0
  scrollY = 0
  scrollXSmoothed = 0
  scrollYSmoothed = 0
  velocityX = 0
  velocityY = 0
  touched = false
  touchId = null
  ppx = 0
  ppy = 0
  px = 0
  py = 0
  scrolling = false

  constructor(container) {
    this.container = container
    this.content = container.querySelector('.SmoothScroll_Content')

    this.bindEventListeners()

    this.timeLast = performance.now()
    requestAnimationFrame(this.step)
  }

  bindEventListeners() {
    if (this.eventListenersBound) return

    this.resizeObserver = new ResizeObserver(this.onContentResize)
    this.resizeObserver.observe(this.container)
    this.resizeObserver.observe(this.content)

    const c = this.container
    c.addEventListener('touchstart', this.onTouchStart)
    c.addEventListener('touchmove', this.onTouchMove)
    c.addEventListener('touchend', this.onTouchEnd)
    c.addEventListener('touchcancel', this.onTouchCancel)

    c.addEventListener('wheel', this.onWheel)

    this.eventListenersBound = true
  }

  unbindEventListeners() {
    if (!this.eventListenersBound) return

    this.resizeObserver.disconnect()
    this.resizeObserver = null

    const c = this.container
    c.removeEventListener('touchstart', this.onTouchStart)
    c.removeEventListener('touchmove', this.onTouchMove)
    c.removeEventListener('touchend', this.onTouchEnd)
    c.removeEventListener('touchcancel', this.onTouchCancel)

    c.removeEventListener('wheel', this.onWheel)

    this.eventListenersBound = false
  }

  onContentResize = () => {
    this.containerWidth = this.container.offsetWidth
    this.containerHeight = this.container.offsetHeight
    this.contentWidth = this.content.offsetWidth
    this.contentHeight = this.content.offsetHeight
  }

  onTouchStart = e => {
    const t = e.changedTouches[0]
    this.touchId = t.identifier
    this.touched = true
    this.firstMoveExceeded = false

    if (Math.abs(this.velocityX) && Math.abs(this.velocityX)) {
      e.preventDefault()
    }

    this.velocityX = 0
    this.velocityY = 0
  }

  onTouchMove = e => {
    e.preventDefault()
    const ts = e.changedTouches
    if (this.touchId === null) {
      this.touchId = ts[0].identifier
      this.firstMoveExceeded = false
    }
    let nt = ts.length
    while (nt--) {
      const t = e.changedTouches[nt]
      if (t.identifier == this.touchId) {
        this.move(t.pageX, t.pageY)
        break
      }
    }
  }

  onTouchEnd = e => {
    const now = performance.now()
    const ts = e.changedTouches
    let nt = ts.length
    while (nt--) {
      const t = e.changedTouches[nt]
      if (t.identifier == this.touchId) {
        this.touchId = null
        if (!e.touches.length) {
          this.touched = false
          if (this.firstMoveExceeded) {
            const timeDiff = now - this.lastMove
            if (timeDiff > 100) {
              this.velocityX = 0
              this.velocityY = 0
            }
          }
          this.lastMove = now
          this.stop()
        }
        break
      }
    }
  }

  onTouchCancel = e => {
    const ts = e.changedTouches
    let nt = ts.length
    while (nt--) {
      const t = e.changedTouches[nt]
      if (t.identifier == this.touchId) {
        this.touchId = null
        if (!e.touches.length) {
          this.touched = false
          this.stop()
        }
        break
      }
    }
  }

  onWheel = e => {
    e.preventDefault()
    this.velocityY += e.deltaY * 0.003
  }

  firstMoveExceeded = false
  move(x, y) {
    const now = performance.now()
    if (!this.firstMoveExceeded) {
      this.firstMoveExceeded = true
    } else {
      const timeDiff = now - this.lastMove
      const dx = x - this.px
      const dy = y - this.py
      this.velocityX = -(dx * 1.2) / timeDiff
      this.velocityY = -(dy * 1.2) / timeDiff
      this.scroll(this.scrollX - dx, this.scrollY - dy)
    }
    this.px = x
    this.py = y
    this.lastMove = now
  }

  stop() {
    this.firstMoveExceeded = false
  }

  scroll(x, y) {
    x = Math.min(Math.max(0, x), this.contentWidth - this.containerWidth)
    y = Math.min(Math.max(0, y), this.contentHeight - this.containerHeight)
    this.scrollX = x
    this.scrollY = y
  }

  step = timeNow => {
    const dt = Math.min(timeNow - this.timeLast, 150)
    this.timeLast = timeNow

    if (!this.touched) {
      this.velocityX += -this.velocityX * 0.003 * dt
      this.velocityY += -this.velocityY * 0.003 * dt

      if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0
      if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0

      this.scrollX += this.velocityX * dt
      this.scrollY += this.velocityY * dt

      this.scrollX = Math.min(Math.max(0, this.scrollX), this.contentWidth - this.containerWidth)
      this.scrollY = Math.min(Math.max(0, this.scrollY), this.contentHeight - this.containerHeight)
    }

    this.scrollXSmoothed += (this.scrollX - this.scrollXSmoothed) / 5
    this.scrollYSmoothed += (this.scrollY - this.scrollYSmoothed) / 5

    // this.content.style.setProperty('transform', `translate(${-this.scrollX}px, ${-this.scrollY}px)`)
    this.content.style.setProperty('transform', `translate(${-this.scrollXSmoothed}px, ${-this.scrollYSmoothed}px)`)

    requestAnimationFrame(this.step)
  }
}
