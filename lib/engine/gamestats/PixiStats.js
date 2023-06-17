export default class PixiStats {
  constructor(main) {
    const { formats, renderer, options } = main.config.pixi
    this.formats = formats
    this.main = main
    this.renderer = renderer

    this.hijackedGL = false

    const defaultConfig = {
      maxMemorySize: 350,
      COLOR_MEM_TEXTURE: '#8ddcff',
      COLOR_MEM_BUFFER: '#ffd34d',
    }

    this.config = Object.assign(defaultConfig, options)
    ;(this.config.baseCanvasWidth = 100 * this.main.config.scale),
      (this.config.baseCanvasHeight = 80 * this.main.config.scale),
      (this.memGraph = {
        width: this.config.baseCanvasWidth,
        height: this.config.baseCanvasHeight * 0.38,
        drawY: this.config.baseCanvasHeight * 0.5,
        barWidth: this.config.baseCanvasWidth / this.main.config.maximumHistory,
      })

    this.dom
    this.canvas
    this.ctx
    this.graphYOffset = 0
    this.tempDrawCalls = 0
    this.drawCalls = 0
    this.realGLDrawElements = null

    this.init()
  }

  init() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = this.config.baseCanvasWidth
    this.canvas.height = this.config.baseCanvasHeight
    this.canvas.style.cssText = `width:${this.config.baseCanvasWidth * this.main.config.scale}px;height:${
      this.config.baseCanvasHeight * this.main.config.scale
    }px;background-color:${this.main.config.COLOR_BG}`

    this.main.dom.appendChild(this.canvas)
    this.update = this.update.bind(this)
    this.update()
  }

  collectStats() {
    if (!this.renderer) return

    const formatToSize = {
      [this.formats.RGB]: 3,
      [this.formats.RGBA]: 4,
      [this.formats.DEPTH_COMPONENT]: 3,
      [this.formats.DEPTH_STENCIL]: 4,
      [this.formats.ALPHA]: 1,
      [this.formats.LUMINANCE]: 1,
      [this.formats.LUMINANCE_ALPHA]: 2,
    }

    const textures = this.renderer.texture.managedTextures
    const buffers = this.renderer.geometry.managedBuffers
    const rts = this.renderer.framebuffer.managedFramebuffers

    let textureTotalMem = 0
    for (const key in textures) {
      const t = textures[key]
      textureTotalMem += t.width * t.height * formatToSize[t.format]
    }

    let bufferTotatlMem = 0
    for (const key in buffers) {
      const b = buffers[key]
      bufferTotatlMem += b.data.byteLength
    }

    return {
      count: {
        textures: textures.length,
        buffers: buffers ? Object.keys(buffers).length : 0,
        renderTextures: rts.length,
      },
      mem: {
        // in MBs
        textures: textureTotalMem / (1024 * 1024),
        buffers: bufferTotatlMem / (1024 * 1204),
      },
    }
  }

  draw() {
    const stats = this.collectStats()
    if (stats) {
      this.drawCounts(stats.count)
      this.drawMem(stats.mem)
    }
  }

  formatNum(n) {
    if (n < 1e3) return n
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K'
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M'
    return +(n / 1e9).toFixed(1) + '?'
  }

  drawCounts(counts) {
    let { textures, buffers, renderTextures } = counts

    const ctx = this.ctx
    const config = this.config
    const mainConfig = this.main.config

    const padding = config.baseCanvasHeight * 0.02

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height * 0.46)

    // tex buf rtex
    ctx.textAlign = 'left'
    let fontSize = config.baseCanvasWidth * 0.09
    ctx.font = `${fontSize}px ${mainConfig.FONT_FAMILY}`
    ctx.textBaseline = 'top'
    ctx.fillStyle = mainConfig.COLOR_TEXT_LABEL
    ctx.fillText('textures buffers render-t', padding * 2, padding)

    fontSize = config.baseCanvasWidth * 0.09
    ctx.font = `${fontSize}px ${mainConfig.FONT_FAMILY}`

    const avgMinMaxOffsetX = config.baseCanvasWidth * 0.2
    const avgMinMaxOffsetY = config.baseCanvasWidth * 0.1

    ctx.textAlign = 'right'
    // textures
    let startX = padding + config.baseCanvasWidth * 0.33
    ctx.fillStyle = mainConfig.COLOR_FPS_BAR
    ctx.fillText(`${this.formatNum(textures)}`, startX, avgMinMaxOffsetY + padding)

    // buffers
    ctx.fillStyle = mainConfig.COLOR_FPS_BAR
    ctx.fillText(`${this.formatNum(buffers)}`, startX + avgMinMaxOffsetX * 1.51, avgMinMaxOffsetY + padding)

    // render texture
    ctx.fillStyle = mainConfig.COLOR_FPS_BAR
    ctx.fillText(`${this.formatNum(renderTextures)}`, startX + avgMinMaxOffsetX * 3.2, avgMinMaxOffsetY + padding)

    //draw calls
    ctx.textAlign = 'left'
    ctx.fillStyle = mainConfig.COLOR_TEXT_LABEL
    ctx.fillText('drawcalls', padding * 2, config.baseCanvasWidth * 0.21)

    ctx.textAlign = 'right'
    ctx.fillStyle = mainConfig.COLOR_FPS_BAR
    ctx.fillText(`${this.formatNum(this.drawCalls)}`, startX + padding * 4, config.baseCanvasWidth * 0.3)
  }

  drawMem(mem) {
    const { textures, buffers } = mem

    const config = this.config
    const mainConfig = this.main.config

    // shift everything to the left:
    const ctx = this.ctx
    const imageData = ctx.getImageData(1, 0, ctx.canvas.width - this.memGraph.barWidth, ctx.canvas.height)
    ctx.putImageData(imageData, 0, 0)
    ctx.clearRect(ctx.canvas.width - this.memGraph.barWidth, 0, this.memGraph.barWidth, ctx.canvas.height)

    this.drawMemGraph(textures, config.COLOR_MEM_TEXTURE)
    this.drawMemGraph(buffers, config.COLOR_MEM_BUFFER, textures)

    ctx.clearRect(0, ctx.canvas.height * 0.87, ctx.canvas.width, ctx.canvas.height * 0.2)

    const padding = config.baseCanvasHeight * 0.01

    ctx.textAlign = 'left'
    let fontSize = config.baseCanvasWidth * 0.09
    ctx.textBaseline = 'top'
    ctx.font = `${fontSize}px ${mainConfig.FONT_FAMILY}`

    const avgMinMaxOffsetX = config.baseCanvasWidth * 0.2
    const avgMinMaxOffsetY = config.baseCanvasHeight * 0.88

    // mem-textures
    ctx.fillStyle = config.COLOR_MEM_TEXTURE
    ctx.fillText('mem-tex', padding, avgMinMaxOffsetY + padding)

    // mem-buffers
    ctx.fillStyle = config.COLOR_MEM_BUFFER
    ctx.fillText('mem-buf', avgMinMaxOffsetX * 2.2 - padding * 2, avgMinMaxOffsetY + padding)

    this.graphYOffset = 0
  }
  drawMemGraph(value, color, prevValue) {
    const config = this.config
    const mainConfig = this.main.config

    const ctx = this.ctx

    if (prevValue && value + prevValue > config.maxMemorySize) value = Math.max(0, config.maxMemorySize - prevValue)

    let yOffset = 0
    if (this.graphYOffset) yOffset += this.graphYOffset

    let x = mainConfig.maximumHistory * this.memGraph.barWidth - this.memGraph.barWidth
    let y = this.memGraph.drawY
    let w = this.memGraph.barWidth
    let h = Math.min(1, value / config.maxMemorySize) * this.memGraph.height
    y += this.memGraph.height - h - yOffset

    ctx.globalAlpha = 0.5
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)

    ctx.globalAlpha = 1.0
    ctx.fillRect(x, y, w, w)

    this.graphYOffset = (this.graphYOffset || 0) + h
  }

  hijackGL() {
    this.realGLDrawElements = this.renderer.gl.drawElements
    this.renderer.gl.drawElements = this.fakeGLdrawElements.bind(this)
    this.hijackedGL = true
  }

  fakeGLdrawElements(mode, count, type, offset) {
    this.tempDrawCalls++
    this.renderer?.gl && this.realGLDrawElements.call(this.renderer.gl, mode, count, type, offset)
  }

  restoreGL() {
    this.renderer.gl.drawElements = this.realGLDrawElements
    this.hijackedGL = false
  }

  update() {
    if (this.main.shown && this.renderer) {
      if (!this.hijackedGL) {
        this.hijackGL()
      }
      this.draw() // don't draw if we are not shown
    } else if (this.hijackedGL) {
      this.restoreGL()
    }
  }

  endFrame() {
    this.drawCalls = this.tempDrawCalls
    this.tempDrawCalls = 0
  }
}
