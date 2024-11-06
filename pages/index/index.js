// index.js
import { analyzeImage } from '../../utils/ai-service';
import { CharacterController } from '../../utils/character-controller';
import { AssetsManager } from '../../utils/assets-manager';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    tempImagePath: '',
    analyzing: false,
    keywords: [],
    isAnimating: false,
    animationData: {},
    assetsLoaded: false,
    showCanvas: true
  },

  async onLoad() {
    // 初始化资源管理器
    this.assetsManager = new AssetsManager();
    
    // 配置精灵图资源
    const spriteConfig = {
      name: 'character',
      path: '../../images/c1_sprite_sheet.png',
      width: 1024,  // 根据实际图片调整
      height: 1024,  // 根据实际图片调整
      frames: { width: 128, height: 128 }  // 根据实际单帧尺寸调整
    };

    // 加载精灵图资源
    await this.assetsManager.loadSprites([spriteConfig]);

    // 定义动画序列
    this.assetsManager.defineAnimation('idle', {
      spriteName: 'character',
      frameSequence: [0, 1, 2, 3], // 根据实际帧序列调整
      frameDuration: 150,
      loop: true
    });

    this.initCanvas();
  },

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#animationCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          console.error('Canvas element not found');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const { width, height } = res[0];
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // 初始化角色控制器
        this.characterController = new CharacterController(canvas, this.assetsManager);
        
        // 开始动画循环
        this.startAnimationLoop();
        
        this.setData({ assetsLoaded: true });
      });
  },

  startAnimationLoop() {
    const animate = () => {
      if (!this.data.isAnimating) {
        return;
      }

      // 更新和绘制角色
      this.characterController.update(16); // 假设 60fps，约16ms每帧
      this.characterController.draw();

      // 继续下一帧
      setTimeout(() => {
        if (this.data.isAnimating) {
          animate();
        }
      }, 1000 / 60);
    };

    // 开始动画
    this.setData({ isAnimating: true }, () => {
      animate();
    });
  },

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

  toggleAnimation: function() {
    this.setData({
      isAnimating: !this.data.isAnimating
    });
  },

  onUnload: function() {
    this.setData({
      isAnimating: false
    });
  },

  async onReady() {
    const query = wx.createSelectorQuery();
    query.select('#animationCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('Canvas query result:', res);
        if (!res[0]) {
          console.error('Canvas element not found');
          return;
        }
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // 获取实际显示尺寸
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const { width, height } = res[0];
        
        // 设置 Canvas 的实际尺寸
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // 缩放上下文以适应 DPR
        ctx.scale(dpr, dpr);
        
        // 保存到全局
        const app = getApp();
        app.globalData.canvasContext = ctx;
        app.globalData.canvasWidth = width;
        app.globalData.canvasHeight = height;

        // 开始动画
        this.startAnimation();
      });
  },

  // 开始动画的方法
  startAnimation() {
    // 设置动画标志
    this.setData({
      isAnimating: true
    });

    const app = getApp();
    const ctx = app.globalData.canvasContext;
    
    if (!ctx) {
      console.error('Canvas context not initialized');
      return;
    }

    const animate = () => {
      // 如果动画已停止，则不继续执行
      if (!this.data.isAnimating) {
        return;
      }

      const { canvasWidth, canvasHeight } = app.globalData;
      
      // 清除画布
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // 绘制动画
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      // 使用时间来创建脉动效果
      const time = Date.now() / 1000; // 转换为秒
      const baseRadius = 30;
      const pulseAmount = 10;
      const radius = baseRadius + Math.sin(time * 2) * pulseAmount; // 半径在20-40之间脉动
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFB6C1';
      ctx.fill();
      
      // 使用setTimeout继续下一帧
      setTimeout(() => {
        if (this.data.isAnimating) {
          animate();
        }
      }, 1000 / 60);
    };

    animate();
  },

  // 停止动画的方法
  stopAnimation() {
    this.setData({
      isAnimating: false
    });
  },

  // 在页面隐藏时停止动画
  onHide() {
    this.stopAnimation();
  },

  // 在页面卸载时停止动画
  onUnload() {
    this.stopAnimation();
  }
})
