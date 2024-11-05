// index.js
import { analyzeImage } from '../../utils/ai-service';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    tempImagePath: '',
    analyzing: false,
    keywords: [],
    currentFrame: 'memhouse',
    isAnimating: false,
    animationData: {},
    frames: [], // 存储所有帧的路径
    currentFrameIndex: 0
  },

  onLoad() {
    // 预先生成所有帧的路径
    const frames = Array.from({length: 60}, (_, i) => {
      return `../../images/frame_${String(i + 1).padStart(4, '0')}.png`;
    });
    this.setData({ frames });

    // 创建动画实例
    this.animation = wx.createAnimation({
      duration: 50, // 每一帧的持续时间
      timingFunction: 'step-start', // 使用阶梯式的动画效果
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

  previewImage: function() {
    wx.navigateTo({
      url: '/pages/preview/preview'
    });
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
    if (this.data.isAnimating) {
      // 停止动画
      if (this.animationTimer) {
        clearTimeout(this.animationTimer);
      }
      this.setData({
        isAnimating: false,
        currentFrame: 'memhouse'
      });
    } else {
      // 开始动画
      this.setData({
        isAnimating: true
      });
      this.playFrameAnimation(1);
    }
  },

  playFrameAnimation: function(frameIndex) {
    if (!this.data.isAnimating || frameIndex > 60) {
      // 动画结束，返回到初始状态
      this.setData({
        isAnimating: false,
        currentFrame: 'memhouse'
      });
      return;
    }

    // 设置当前帧的图片
    const currentFrame = String(frameIndex).padStart(4, '0');
    this.setData({
      currentFrame: currentFrame
    });

    // 设置下一帧的定时器
    this.animationTimer = setTimeout(() => {
      this.playFrameAnimation(frameIndex + 1);
    }, 15); // 3000ms/60帧 ≈ 50ms
  },

  onUnload: function() {
    // 页面卸载时清理定时器
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    this.setData({
      isAnimating: false
    });
  }
})
