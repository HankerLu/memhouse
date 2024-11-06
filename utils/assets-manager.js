export class AssetsManager {
  constructor() {
    this.sprites = new Map()  // 存储精灵图
    this.animations = new Map()  // 存储动画序列
    this.currentAnimation = null
    this.frameIndex = 0
    this.frameTimer = 0
    this.loadedCount = 0
    this.totalAssets = 0
  }

  async loadSprites(spriteConfigs) {
    this.totalAssets = spriteConfigs.length
    
    for (const config of spriteConfigs) {
      try {
        const sprite = await this.loadImage(config.path)
        this.sprites.set(config.name, {
          image: sprite,
          width: config.width,
          height: config.height,
          frames: config.frames
        })
        this.loadedCount++
        
        // 打印加载的sprite信息
        console.log(`Loaded sprite: ${config.name}`, {
          path: config.path,
          width: config.width,
          height: config.height,
          frames: config.frames
        })
      } catch (error) {
        console.error(`Failed to load sprite: ${config.name}`, error)
      }
    }
  }

  loadImage(path) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: path,
        success: (res) => resolve(res.path),
        fail: reject
      })
    })
  }

  defineAnimation(name, config) {
    this.animations.set(name, {
      spriteName: config.spriteName,
      frameSequence: config.frameSequence,
      frameDuration: config.frameDuration,
      loop: config.loop ?? true
    })
  }
} 