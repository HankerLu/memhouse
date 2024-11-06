const BASE_URL = 'http://192.168.200.173:8000';
const MAX_RETRIES = 3;

// 修改获取图片列表的函数，添加重试机制
export const getImages = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: `${BASE_URL}/api/images`,
          method: 'GET',
          success: (res) => {
            if (res.statusCode === 200) {
              const images = res.data.images.map(img => ({
                ...img,
                url: `${BASE_URL}${img.url}`
              }));
              resolve(images);
            } else {
              reject(new Error(`获取图片列表失败: ${res.statusCode}`));
            }
          },
          fail: reject
        });
      });
      return result;
    } catch (error) {
      console.error(`第${i + 1}次获取图片列表失败:`, error);
      if (i === retries - 1) throw error;
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// 添加下载单个图片的函数
export const downloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: imageUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error('下载图片失败'));
        }
      },
      fail: reject
    });
  });
};

// 添加批量下载图片的函数
export const downloadImages = async (images, onProgress) => {
  const total = images.length;
  const results = [];
  
  for (let i = 0; i < total; i++) {
    try {
      const tempPath = await downloadImage(images[i].url);
      results.push({
        filename: images[i].filename,
        path: tempPath
      });
      
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          filename: images[i].filename
        });
      }
    } catch (error) {
      console.error(`下载图片 ${images[i].filename} 失败:`, error);
      // 继续下载其他图片
    }
  }
  
  return results;
};

// 修改图片资源初始化函数，添加更好的错误处理
export const initializeImages = async (onProgress) => {
  try {
    // 获取图片列表
    const images = await getImages();
    console.log('获取到图片列表:', images);
    
    if (!images || images.length === 0) {
      console.log('没有找到可用的图片资源');
      return [];
    }
    
    // 下载所有图片
    const downloadedImages = await downloadImages(images, onProgress);
    console.log('图片下载完成:', downloadedImages);
    
    return downloadedImages;
  } catch (error) {
    console.error('初始化图片资源失败:', error);
    // 返回空数组而不是抛出错误，这样程序可以继续运行
    return [];
  }
};