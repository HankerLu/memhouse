// 智谱AI接口配置
const API_KEY = '5970c032a7158d0f72d69890e806c912.KOAJqVp6cvhp7LS3';
const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

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