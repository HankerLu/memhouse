// index.js
import { AssetsManager, CharacterController } from '../../utils/animation-manager';
import { analyzeImage } from '../../utils/ai-service';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    tempImagePath: '',
    keywords: [],
    analyzing: false,
    assetsLoaded: false
  },

  async onLoad() {
    // 初始化画布
    const query = wx.createSelectorQuery()
    query.select('#animationCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        const canvas = res[0].node
        canvas.width = 660  // 匹配单帧宽度
        canvas.height = 793 // 匹配单帧高度
        
        // 初始化资源管理器，传入 canvas
        this.assetsManager = new AssetsManager(canvas)
        
        // 配置精灵图资源
        const spriteConfigs = [
        {
          name: 'character',
          path: '../../images/extracted_sprite_sheet.png',
          width: 5280,  // 精灵图总宽度 (720 * 8)
          height: 6344, // 精灵图总高度
          frames: { width: 660, height: 793 } // 单帧尺寸
        }, 
        {
          name: 'character_talking',  // 添加说话状态的精灵图
          path: '../../images/1_141f_720×944_spritesheet.png',  // 假设有这个资源
          width: 5760,
          height: 16992,
          frames: { width: 720, height: 944 }
        },
        ]

        // 加载精灵图资源
        await this.assetsManager.loadSprites(spriteConfigs)

        // 定义动画序列
        this.assetsManager.defineAnimation('idle', {
          spriteName: 'character',
          frameSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], // 45帧动画
          frameDuration: 50, // 每帧持续时间(毫秒)
          loop: true
        })

        this.assetsManager.defineAnimation('talking', {
          spriteName: 'character_talking',
          frameSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140],  // 141帧动画
          frameDuration: 30,
          loop: true
        })
        
        this.characterController = new CharacterController(canvas, this.assetsManager)
        this.characterController.position = { 
          x: canvas.width / 2,  // 居中显示
          y: canvas.height / 2
        }
        this.characterController.scale = 0.5 // 调整缩放比例，根据需要调整
        
        // 开始动画循环
        this.startAnimationLoop(canvas)
        this.setData({ assetsLoaded: true })
      })
  },

  startAnimationLoop(canvas) {
    const animate = (timestamp) => {
      const deltaTime = timestamp - (this.lastTimestamp || timestamp)
      this.lastTimestamp = timestamp

      // 更新和绘制角色
      this.characterController.update(deltaTime)
      this.characterController.ctx.clearRect(
        0, 
        0, 
        this.characterController.canvas.width, 
        this.characterController.canvas.height
      )
      this.characterController.draw()

      // 继续动画循环
      if (this.characterController && this.characterController.canvas) {
        this.animationFrame = this.characterController.canvas.requestAnimationFrame(animate)
      }
    }

    // 确保初始化时有正确的时间戳
    this.lastTimestamp = performance.now()
    
    // 使用 canvas 的 requestAnimationFrame
    if (canvas && typeof canvas.requestAnimationFrame === 'function') {
      this.animationFrame = canvas.requestAnimationFrame(animate)
    } else {
      console.error('Canvas requestAnimationFrame is not available', canvas);
    }
  },

  onUnload() {
    // 清理动画循环
    if (this.animationFrame && this.characterController?.canvas) {
      this.characterController.canvas.cancelAnimationFrame(this.animationFrame)
    }
  },

  // 选择图片
  chooseImage: async function() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      });
      
      const tempFilePath = res.tempFiles[0].tempFilePath;
      this.setData({
        tempImagePath: tempFilePath,
        analyzing: true,
        keywords: []
      });

      // 分析图片
      const result = await analyzeImage(tempFilePath);
      
      // 将关键词转换为对象数组，添加selected属性
      const keywords = (result.keywords || []).map(text => ({
        text,
        selected: false
      }));

      this.setData({
        keywords: keywords,
        analyzing: false
      });

      // 保存图片到全局数据
      const app = getApp();
      app.globalData.selectedImage = tempFilePath;
      
    } catch (error) {
      console.error('处理图片失败：', error);
      wx.showToast({
        title: '图片处理失败',
        icon: 'none'
      });
      this.setData({
        analyzing: false
      });
    }
  },

  // 切换关键词选中状态
  toggleKeyword(e) {
    const index = e.currentTarget.dataset.index;
    const keywords = this.data.keywords;
    keywords[index].selected = !keywords[index].selected;
    
    this.setData({ keywords });
    
    // 更新全局数据中的选中关键词
    const app = getApp();
    app.globalData.imageKeywords = keywords
      .filter(k => k.selected)
      .map(k => k.text);
  },

  goToAIPoetry() {
    // 检查是否有选中的关键词
    const selectedKeywords = this.data.keywords.filter(k => k.selected);
    if (selectedKeywords.length === 0) {
      wx.showToast({
        title: '请至少选择一个关键词',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/aipoetry/aipoetry'
    });
  },

  // 添加切换状态的方法
  changeCharacterState(state) {
    if (this.characterController) {
      this.characterController.setState(state);
    }
  }
})
