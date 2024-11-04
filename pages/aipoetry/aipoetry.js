import { createPoem } from '../../utils/ai-service';

Page({
  data: {
    poem: '',
    isLoading: false,
    error: ''
  },

  onLoad() {
    // 获取全局数据中的图片关键词
    const app = getApp();
    this.imageKeywords = app.globalData.imageKeywords || [];
  },

  // 生成诗歌的方法
  async generatePoem() {
    if (!this.imageKeywords || this.imageKeywords.length === 0) {
      wx.showToast({
        title: '请先选择并分析图片',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isLoading: true,
      error: ''
    });
    
    try {
      const result = await createPoem(this.imageKeywords);
      this.setData({
        poem: result.poem || result, // 根据实际API返回格式调整
        isLoading: false
      });
    } catch (error) {
      this.setData({
        error: '生成诗歌失败，请稍后重试',
        isLoading: false
      });
      console.error('AI写诗错误：', error);
    }
  }
}) 