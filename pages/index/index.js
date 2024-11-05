// index.js
import { analyzeImage } from '../../utils/ai-service';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    tempImagePath: '',
    analyzing: false,
    keywords: [],
    currentFrame: '0015',
    isAnimating: false,
    timer: null
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
      if (this.data.timer) {
        clearInterval(this.data.timer);
      }
      this.setData({
        isAnimating: false,
        currentFrame: '0015'
      });
    } else {
      // 开始动画
      const timer = setInterval(() => {
        this.setData({
          currentFrame: this.data.currentFrame === '0015' ? '0049' : '0015'
        });
      }, 500); // 每500毫秒切换一次图片

      this.setData({
        isAnimating: true,
        timer: timer
      });
    }
  },

  onUnload: function() {
    // 页面卸载时清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
})
