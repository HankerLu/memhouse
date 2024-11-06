// app.js
import { initializeImages } from './utils/api-service'

App({
  globalData: {
    userInfo: null,
    selectedImage: null,
    imageKeywords: [],
  },

  onLaunch() {
    // 初始化资源
    this.initializeResources();
  },

  async initializeResources() {
    try {
      // 初始化图片资源
      await initializeImages((progress) => {
        console.log('资源下载进度:', progress);
      });
      console.log('资源初始化完成');
    } catch (error) {
      console.error('资源初始化失败:', error);
      wx.showToast({
        title: '资源加载失败',
        icon: 'none'
      });
    }
  }
})
