// index.js
import { AssetsManager, CharacterController } from '../../utils/animation-manager';
import { analyzeImage, createPoem } from '../../utils/ai-service';
import { initializeImages } from '../../utils/api-service';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    tempImagePath: '',
    keywords: [],
    analyzing: false,
    assetsLoaded: false,
    downloadProgress: 0,
    currentFile: '',
    dialogText: '主人你好，让我为你的照片题一首诗吧！', // 默认对话内容
    poem: null, // 用于存储生成的诗歌
    canvasWidth: 360, // 默认宽度
    canvasHeight: 472, // 默认高度
    selectedImage: '', // 添加新的数据属性
  },

  async onLoad() {
    try {
      // 下载并获取图片路径
      const downloadedImages = await initializeImages((progress) => {
        this.setData({
          downloadProgress: Math.floor((progress.current / progress.total) * 100),
          currentFile: progress.filename
        });
      });
      
      console.log('图片资源初始化完成，下载路径:', downloadedImages);

      // 初始化画布
      const query = wx.createSelectorQuery()
      query.select('#animationCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          const canvas = res[0].node
          canvas.width = 660
          canvas.height = 793
          
          this.assetsManager = new AssetsManager(canvas)
          // 根据下载的图片路径配置精灵图
          const spriteConfigs = [
            {
              name: 'character_idle',
              path: downloadedImages.find(img => img.filename === 'extracted_sprite_sheet.png')?.path,
              width: 5280,
              height: 6344,
              frames: { width: 660, height: 793 }
            }, 
            {
              name: 'character_talking',
              path: downloadedImages.find(img => img.filename === '1_141f_660x793_spritesheet.png')?.path,
              width: 5280,
              height: 14274,
              frames: { width: 660, height: 793 }
            },
            {
              name: 'character_shy',
              path: downloadedImages.find(img => img.filename === 'new_shy_141f_660x793_spritesheet.png')?.path,
              width: 5280,
              height: 14274,
              frames: { width: 660, height: 793 }
            }
          ]
          
          console.log('准备加载精灵图，使用下载后的路径:', spriteConfigs.map(config => config.path))
          
          // 验证所有路径都存在
          if (spriteConfigs.some(config => !config.path)) {
            throw new Error('某些精灵图资源未能成功下载')
          }

          await this.assetsManager.loadSprites(spriteConfigs)
          console.log('精灵图加载完成')

          // 定义动画序列
          this.assetsManager.defineAnimation('idle', {
            spriteName: 'character_idle',
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

          this.assetsManager.defineAnimation('shy', {
            spriteName: 'character_shy',
            frameSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], // 45帧动画
            frameDuration: 50, // 每帧持续时间(毫秒)
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
    } catch (error) {
      console.error('图片资源初始化失败:', error);
      wx.showToast({
        title: '资源加载失败',
        icon: 'none'
      });
    }
  },

  startAnimationLoop(canvas) {
    const animate = (timestamp) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - (this.lastTimestamp || currentTime)
      this.lastTimestamp = currentTime

      // 更新和绘制角色
      this.characterController.update(deltaTime)
      this.characterController.ctx.clearRect(
        0, 
        0, 
        this.characterController.canvas.width, 
        this.characterController.canvas.height
      )
      this.characterController.draw()
      // console.log('Drawing character...');

      // 继续动画循环
      if (this.characterController && this.characterController.canvas) {
        this.animationFrame = this.characterController.canvas.requestAnimationFrame(animate)
      }
    }

    // 使用 Date.now() 初始化时间戳
    this.lastTimestamp = Date.now()
    
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
      
      // 更新图片路径和状态
      this.setData({
        tempImagePath: tempFilePath,
        analyzing: true,
        keywords: []
      });

      this.updateDialog('好的，请稍等')
      this.characterController.setTransform({ x: 100, y: 650 }, 0.3);

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
      
      this.updateDialog('这是从图片中提取的关键词，主人选择一些吧')

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

  // 添加切换状态的方法
  changeCharacterState(state) {
    if (this.characterController) {
      this.characterController.setState(state);
    }
  },

  /**
   * 更新对话框内容
   * @param {string} text - 新的对话内容
   */
  updateDialog(text) {
    this.setData({
      dialogText: text
    });
  },

  async generatePoetry() {
    const selectedKeywords = this.data.keywords.filter(k => k.selected);
    if (selectedKeywords.length === 0) {
      wx.showToast({
        title: '请先选择关键词',
        icon: 'none'
      });
      return;
    }

    this.updateDialog('让我想想，该怎么写这首诗呢...');
    
    try {
      const keywords = selectedKeywords.map(k => k.text);
      const result = await createPoem(keywords);
      
      // 处理诗歌内容的换行
      const formattedPoem = (result.poem || result)
        .split('。')
        .filter(line => line.trim())
        .map(line => line + '。\n')
        .join('');
      console.log(formattedPoem);
      this.updateDialog(formattedPoem);
      
    } catch (error) {
      console.error('AI写诗错误：', error);
      wx.showToast({
        title: '生成诗歌失败，请稍后重试',
        icon: 'none'
      });
      this.updateDialog('抱歉，我现在灵感不太好...');
      this.changeCharacterState('idle');
    }
  },

  // 添加设置 canvas 尺寸的方法
  setCanvasSize: function(width, height) {
    this.setData({
      canvasWidth: width,
      canvasHeight: height
    }, () => {
      // 重新获取 canvas 上下文并更新实际尺寸
      const query = wx.createSelectorQuery();
      query.select('#animationCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node;
          // 设置 canvas 实际尺寸
          canvas.width = width;
          canvas.height = height;
          
          // 如果你之前保存了 canvas 上下文，需要重新获取
          const ctx = canvas.getContext('2d');
          // 在这里可以重新绘制 canvas 内容
        });
    });
  },

  // 在选择图片的处理函数中添加
  async handleImageSelected(tempFilePath) {
    // ... 现有代码
    this.setData({
      selectedImage: tempFilePath
    });
    
    // 缩小机器人
    this.characterController.setTransform({ x: 100, y: 650 }, 0.3);
    
    // ... 其他处理代码
  }
})
