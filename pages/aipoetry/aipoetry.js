Page({
  data: {
    poem: '',
    isLoading: false
  },

  onLoad() {
    // 页面加载时的初始化
  },

  // 生成诗歌的方法
  generatePoem() {
    this.setData({
      isLoading: true
    });
    
    // 这里后续可以接入真实的AI接口
    setTimeout(() => {
      this.setData({
        poem: '春风又绿江南岸，\n明月何时照我还。',
        isLoading: false
      });
    }, 1000);
  }
}) 