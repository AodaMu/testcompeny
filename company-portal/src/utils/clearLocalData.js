/**
 * 清除本地存储的模拟数据，为对接后端API做准备
 * 保留身份验证相关数据
 */

export function clearLocalData() {
  // 清除所有模拟数据
  localStorage.removeItem('carousel');
  localStorage.removeItem('policies');
  localStorage.removeItem('products');
  localStorage.removeItem('about');
  localStorage.removeItem('contact');
  localStorage.removeItem('logo');
  localStorage.removeItem('admin');
  
  // 不清除身份验证数据
  // localStorage.removeItem('adminToken');
  // localStorage.removeItem('adminInfo');
  
  console.log('本地模拟数据已清除，准备对接后端API');
}

// 立即执行清除操作
clearLocalData(); 