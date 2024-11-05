const BASE_URL = 'http://your-api-domain.com';  // 替换为你的实际域名

// 下载动画文件
export const downloadAnimation = () => {
  return new Promise((resolve, reject) => {
    const downloadTask = wx.downloadFile({
      url: `${BASE_URL}/api/animation`,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存到本地
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              wx.setStorageSync('animationPath', saveRes.savedFilePath);
              resolve(saveRes.savedFilePath);
            },
            fail: reject
          });
        } else {
          reject(new Error('下载动画文件失败'));
        }
      },
      fail: reject
    });
  });
};

// 检查本地是否已有动画文件
export const checkLocalAnimation = () => {
  const savedPath = wx.getStorageSync('animationPath');
  if (!savedPath) return null;
  
  try {
    const fs = wx.getFileSystemManager();
    fs.accessSync(savedPath);
    return savedPath;
  } catch (e) {
    wx.removeStorageSync('animationPath');
    return null;
  }
}; 