// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Welcome',
    tempImagePath: ''
  },

  chooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          tempImagePath: tempFilePath
        })
        
        // 将选中的图片保存到全局数据
        const app = getApp()
        app.globalData.selectedImage = tempFilePath
      }
    })
  },

  previewImage: function() {
    wx.navigateTo({
      url: '/pages/preview/preview'
    })
  },

  goToAIPoetry() {
    wx.navigateTo({
      url: '/pages/aipoetry/aipoetry'
    })
  }
})
