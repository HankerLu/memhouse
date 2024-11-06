// app.js
import { initializeAnimation } from './utils/api-service';

App({
  onLaunch: async function() {
    try {
      // 初始化动画资源
      wx.showLoading({
        title: '正在准备动画资源...',
        mask: true
      });
      
      const animationPath = await initializeAnimation((progressInfo) => {
        // 更新加载进度提示
        wx.showLoading({
          title: `加载中...${progressInfo.progress}%`,
        });
      });
      
      // 将动画路径保存到全局数据
      this.globalData.animationPath = animationPath;
      
    } catch (error) {
      console.error('初始化动画失败:', error);
      wx.showToast({
        title: '资源加载失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
    }
  },

  globalData: {
    animationPath: null,
    canvasContext: null,
    canvasWidth: 0,
    canvasHeight: 0
  }
});
