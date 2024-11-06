const BASE_URL = 'http://192.168.200.173:8000'; // 替换为你的实际域名
const MAX_RETRIES = 3;

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

// 添加初始化函数
export const initializeAnimation = async (onProgress) => {
  // 先检查本地是否存在
  const localPath = checkLocalAnimation();
  if (localPath) {
    console.log('找到本地动画文件:', localPath);
    return localPath;
  }

  // 本地不存在，尝试下载
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const filePath = await downloadAnimationWithProgress(onProgress);
      console.log('动画文件下载成功:', filePath);
      return filePath;
    } catch (error) {
      retries++;
      console.log(`第${retries}次下载失败:`, error.message);
      if (retries === MAX_RETRIES) {
        throw new Error(`下载失败，已重试${MAX_RETRIES}次: ${error.message}`);
      }
      // 等待一秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// 添加带进度的下载函数
export const downloadAnimationWithProgress = (onProgress) => {
  return new Promise((resolve, reject) => {
    const downloadTask = wx.downloadFile({
      url: `${BASE_URL}/api/animation`,
      success: (res) => {
        if (res.statusCode === 200) {
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

    // 添加下载进度监听
    if (onProgress) {
      downloadTask.onProgressUpdate((res) => {
        onProgress({
          progress: res.progress,
          totalBytesWritten: res.totalBytesWritten,
          totalBytesExpectedToWrite: res.totalBytesExpectedToWrite
        });
      });
    }
  });
}; 