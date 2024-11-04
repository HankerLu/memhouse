import { createPoem } from '../../utils/ai-service';

Page({
  data: {
    poem: '',
    isLoading: false,
    error: '',
    selectedKeywords: []
  },

  onLoad() {
    // 获取全局数据中的选中关键词
    const app = getApp();
    const selectedKeywords = app.globalData.imageKeywords || [];
    this.setData({ selectedKeywords });
  },

  async generatePoem() {
    const { selectedKeywords } = this.data;
    if (!selectedKeywords || selectedKeywords.length === 0) {
      wx.showToast({
        title: '请先选择关键词',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isLoading: true,
      error: ''
    });
    
    try {
      const result = await createPoem(selectedKeywords);
      this.setData({
        poem: result.poem || result,
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