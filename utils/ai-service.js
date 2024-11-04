// 智谱AI接口配置
const API_KEY = '5970c032a7158d0f72d69890e806c912.KOAJqVp6cvhp7LS3';
const BASE_URL = 'http://192.168.200.173:8000';  // 更新为目标服务器IP

// 发送请求到智谱AI
export function generatePoemWithAI() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + encodeURIComponent(API_KEY)
      },
      data: {
        model: "glm-4",
        messages: [
          {
            "role": "system",
            "content": "你是一位擅长写诗的AI诗人，请创作一首优美的中国古诗。"
          },
          {
            "role": "user",
            "content": "请为我写一首优美的诗歌，要求意境优美，格律工整。"
          }
        ],
        stream: false
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0]) {
          resolve(res.data.choices[0].message.content);
        } else {
          reject(new Error('AI返回数据格式错误: ' + JSON.stringify(res.data)));
        }
      },
      fail: (error) => {
        console.error('请求失败：', error);
        reject(error);
      }
    });
  });
}

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