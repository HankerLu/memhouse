export class CharacterController {
  constructor(canvas, assetsManager) {
    this.canvas = canvas
    this.assetsManager = assetsManager
    this.ctx = canvas.getContext('2d')
    this.state = 'idle'
    this.position = { x: 150, y: 200 }
    this.scale = 1
    this.lastUpdate = Date.now()
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState
      this.assetsManager.frameIndex = 0
      this.assetsManager.frameTimer = 0
    }
  }

  update(deltaTime) {
    const animation = this.assetsManager.animations.get(this.state)
    if (!animation) return

    this.assetsManager.frameTimer += deltaTime
    if (this.assetsManager.frameTimer >= animation.frameDuration) {
      this.assetsManager.frameTimer = 0
      this.assetsManager.frameIndex++
      
      if (this.assetsManager.frameIndex >= animation.frameSequence.length) {
        if (animation.loop) {
          this.assetsManager.frameIndex = 0
        } else {
          this.setState('idle')
        }
      }
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = wx.createImage()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
    })
  }

  draw() {
    const animation = this.assetsManager.animations.get(this.state)
    if (!animation) return

    const sprite = this.assetsManager.sprites.get(animation.spriteName)
    if (!sprite) return

    const frameIndex = animation.frameSequence[this.assetsManager.frameIndex]
    const framesPerRow = Math.floor(sprite.width / sprite.frames.width)
    const row = Math.floor(frameIndex / framesPerRow)
    const col = frameIndex % framesPerRow

    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.scale(this.scale, this.scale)
    
    console.log('Drawing sprite:', {
      image: sprite.image,
      sourceX: col * sprite.frames.width,
      sourceY: row * sprite.frames.height,
      sourceWidth: sprite.frames.width,
      sourceHeight: sprite.frames.height
    });
    
    this.ctx.drawImage(
      sprite.image,
      col * sprite.frames.width,
      row * sprite.frames.height,
      sprite.frames.width,
      sprite.frames.height,
      -sprite.frames.width / 2,
      -sprite.frames.height / 2,
      sprite.frames.width,
      sprite.frames.height
    )
    
    this.ctx.restore()
  }
} 