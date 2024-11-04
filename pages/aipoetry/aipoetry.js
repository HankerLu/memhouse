import { generatePoemWithAI } from '../../utils/ai-service';

Page({
  data: {
    poem: '',
    isLoading: false,
    error: ''
  },

  onLoad() {
    // 页面加载时的初始化
  },

  // 生成诗歌的方法
  async generatePoem() {
    this.setData({
      isLoading: true,
      error: ''
    });
    
    try {
      const poem = await generatePoemWithAI();
      this.setData({
        poem: poem,
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