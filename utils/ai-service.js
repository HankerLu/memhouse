const BASE_URL = 'http://192.168.200.173:8000';  // 服务器IP

// 分析图片
export function analyzeImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/analyze_image`,
      filePath: tempFilePath,
      name: 'file',
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          resolve(data);
        } catch (error) {
          reject(new Error('解析响应数据失败'));
        }
      },
      fail: (error) => {
        console.error('上传图片失败：', error);
        reject(error);
      }
    });
  });
}

// 创建诗歌
export function createPoem(keywords, poemType = '古诗') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/create_poem`,
      method: 'POST',
      data: {
        keywords: keywords,
        poem_type: poemType
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error('生成诗歌失败: ' + JSON.stringify(res.data)));
        }
      },
      fail: (error) => {
        console.error('请求失败：', error);
        reject(error);
      }
    });
  });
} 