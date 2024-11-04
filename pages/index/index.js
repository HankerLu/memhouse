// index.js
import { analyzeImage } from '../../utils/ai-service';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    tempImagePath: '',
    analyzing: false,
    keywords: []
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
      
      this.setData({
        keywords: result.keywords || [],
        analyzing: false
      });

      // 保存图片和关键词到全局数据
      const app = getApp();
      app.globalData.selectedImage = tempFilePath;
      app.globalData.imageKeywords = result.keywords;
      
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

  previewImage: function() {
    wx.navigateTo({
      url: '/pages/preview/preview'
    });
  },

  goToAIPoetry() {
    wx.navigateTo({
      url: '/pages/aipoetry/aipoetry'
    });
  }
})
