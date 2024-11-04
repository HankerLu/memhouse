Page({
  data: {
    imagePath: ''
  },
  onLoad(options) {
    const app = getApp()
    this.setData({
      imagePath: app.globalData.selectedImage
    })
  },
  preventDefault(e) {
    // 防止图片点击事件冒泡
    return
  },
  hideImage() {
    wx.navigateBack()
  }
}) 