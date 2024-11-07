// 资源管理器
export class AssetsManager {
  constructor(canvas) {
    this.canvas = canvas  // 添加 canvas 引用
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
          image: sprite.image,
          width: config.width,
          height: config.height,
          frames: config.frames
        })
        this.loadedCount++
      } catch (error) {
        console.error(`Failed to load sprite: ${config.name}`, error)
      }
    }
  }

  loadImage(path) {
    return new Promise((resolve, reject) => {
      if (!this.canvas) {
        reject(new Error('Canvas is not initialized'))
        return
      }
      const image = this.canvas.createImage()
      image.onload = () => {
        resolve({ image })
      }
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${path}`))
      }
      image.src = path
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

  hasAnimation(animationName) {
    return this.animations.has(animationName)
  }

  getAnimation(animationName) {
    return this.animations.get(animationName)
  }
}

// 角色控制器
export class CharacterController {
  constructor(canvas, assetsManager) {
    this.canvas = canvas
    this.assetsManager = assetsManager
    this.ctx = canvas.getContext('2d')
    this.state = 'idle'
    this.position = { x: 150, y: 200 }
    this.scale = 1
    this.lastUpdate = Date.now()

    // 添加状态机
    this.stateMachine = new StateMachine();
    this.setupStates();
  }

  setupStates() {
    // 添加基础状态
    this.stateMachine.addState('idle', {
      animationName: 'idle',
      onEnter: () => {
        this.playAnimation('idle');
      }
    });

    // 添加其他状态
    this.stateMachine.addState('talking', {
      animationName: 'talking',
      onEnter: () => {
        this.playAnimation('talking');
      }
    });

    this.stateMachine.addState('shy', {
      animationName: 'shy',
      onEnter: () => {
        this.playAnimation('shy');
      }
    });

    // 添加状态转换
    this.stateMachine.addTransition('idle', 'talking');
    this.stateMachine.addTransition('talking', 'idle');
    this.stateMachine.addTransition('idle', 'shy');
    this.stateMachine.addTransition('shy', 'idle');
    this.stateMachine.addTransition('talking', 'shy');
    this.stateMachine.addTransition('shy', 'talking');
  }

  setState(stateName) {
    if (this.stateMachine.setState(stateName)) {
      const state = this.stateMachine.getCurrentState();
      if (state.onEnter) {
        state.onEnter();
      }
    }
  }

  playAnimation(animationName) {
    // 播放指定的动画
    if (this.assetsManager.hasAnimation(animationName)) {
      this.currentAnimation = this.assetsManager.getAnimation(animationName);
      this.currentFrame = 0;
      this.frameTime = 0;
    }
  }

  update(deltaTime) {
    const animation = this.assetsManager.animations.get(this.state)
    if (!animation) {
      console.error('No animation found for state:', this.state);
      return;
    }

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

  draw() {
    const animation = this.assetsManager.animations.get(this.state)
    if (!animation) {
      console.error('No animation found for state:', this.state);
      return;
    }

    const sprite = this.assetsManager.sprites.get(animation.spriteName)
    if (!sprite) {
      console.error('No sprite found for animation:', animation.spriteName);
      return;
    }

    const frameIndex = animation.frameSequence[this.assetsManager.frameIndex]
    const framesPerRow = Math.floor(sprite.width / sprite.frames.width)
    const row = Math.floor(frameIndex / framesPerRow)
    const col = frameIndex % framesPerRow

    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.scale(this.scale, this.scale)
    
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

export class StateMachine {
  constructor(initialState = 'idle') {
    this.currentState = initialState;
    this.states = new Map();
    this.transitions = new Map();
  }

  addState(name, config) {
    this.states.set(name, config);
  }

  addTransition(fromState, toState, condition = () => true) {
    if (!this.transitions.has(fromState)) {
      this.transitions.set(fromState, new Map());
    }
    this.transitions.get(fromState).set(toState, condition);
  }

  canTransition(fromState, toState) {
    return this.transitions.get(fromState)?.has(toState) || false;
  }

  setState(newState) {
    if (this.states.has(newState) && 
        (this.canTransition(this.currentState, newState) || newState === this.currentState)) {
      const condition = this.transitions.get(this.currentState)?.get(newState);
      if (condition && condition()) {
        this.currentState = newState;
        return true;
      }
    }
    return false;
  }

  getCurrentState() {
    return this.states.get(this.currentState);
  }
} 