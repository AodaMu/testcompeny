import axios from 'axios'

// 后端API基础URL
const API_BASE_URL = 'https://krauztutcqup.sealosbja.site'  // 修改为不带/api的基础URL
const IMAGE_BASE_URL = 'https://krauztutcqup.sealosbja.site'  // 图片基础URL

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 创建专用于文件上传的axios实例
const uploadInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 上传文件需要更长的超时时间
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加调试日志
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      params: config.params
    })
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 上传请求拦截器
uploadInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加调试日志
    console.log('发送上传请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers
    })
    
    return config
  },
  (error) => {
    console.error('上传请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 添加详细日志记录
    console.log(`API响应成功 [${response.config.url}]:`, response.data)
    return response.data
  },
  (error) => {
    // 添加详细错误日志
    console.error(`API响应错误 [${error.config?.url}]:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    
    if (error.response) {
      if (error.response.status === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('adminToken')
        window.location.href = '/admin/login'
      } else if (error.response.status === 403) {
        // 添加403错误处理
        console.error('API访问被拒绝(403):', error.config.url)
        // 返回空数据但表明这是403错误
        return Promise.resolve({ 
          code: 403, 
          data: [], 
          message: 'API访问被拒绝，可能是权限不足或API未实现' 
        })
      }
    }
    return Promise.reject(error)
  }
)

// 上传响应拦截器
uploadInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('adminToken')
        window.location.href = '/admin/login'
      } else if (error.response.status === 403) {
        // 添加403错误处理
        console.error('API访问被拒绝(403):', error.config.url)
        // 返回空数据但表明这是403错误
        return Promise.resolve({ 
          code: 403, 
          data: [], 
          message: 'API访问被拒绝，可能是权限不足或API未实现' 
        })
      }
    }
    return Promise.reject(error)
  }
)

// 处理图片URL，添加基础URL前缀
const processImageUrl = (urlPath) => {
  if (!urlPath) return ''
  if (urlPath.startsWith('http')) return urlPath
  // 如果是相对路径，添加基础URL
  if (urlPath.startsWith('/uploads')) {
    // 直接使用基础URL + 路径，不添加/api前缀
    return `${IMAGE_BASE_URL}${urlPath}`
  }
  return urlPath
}

// 定义API对象 - 严格按照接口文档实现
const api = {
  // 图片API
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return uploadInstance.post('/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  getImage(imageName) {
    return `${API_BASE_URL}/api/images/${imageName}`
  },
  
  deleteImage(imageName) {
    return axiosInstance.delete(`/api/images/${imageName}`)
  },
  
  // 产品分类API
  getCategories() {
    // 公开接口，获取所有产品分类
    return axiosInstance.get('/api/categories')
  },
  
  getAdminCategories() {
    // 管理员接口，需要JWT认证
    return axiosInstance.get('/api/admin/categories')
  },
  
  addCategory(data) {
    // 添加新产品分类，需要JWT认证
    // data格式: { name: "分类名称" }
    return axiosInstance.post('/api/admin/categories', data)
  },
  
  deleteCategory(id) {
    // 删除产品分类，需要JWT认证
    return axiosInstance.delete(`/api/admin/categories/${id}`)
  },
  
  // 文件上传API
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return uploadInstance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 前台API
  getCarousel() {
    return axiosInstance.get('/api/carousel')
  },
  
  getPolicies() {
    return axiosInstance.get('/api/policies')
  },
  
  // 获取单个产品详情
  getProductById(id) {
    return axiosInstance.get(`/api/products/${id}`)
  },
  
  getProducts() {
    return axiosInstance.get('/api/products')
  },
  
  // 获取热销产品
  getHotProducts() {
    return axiosInstance.get('/api/products/hot')
  },
  
  getAbout() {
    return axiosInstance.get('/api/about')
  },
  
  getContact() {
    return axiosInstance.get('/api/contact')
  },
  
  getLogo() {
    return axiosInstance.get('/api/logo')
  },
  
  // 管理员API
  adminLogin(data) {
    return axiosInstance.post('/api/admin/login', data)
  },
  
  // 轮播图管理
  getAdminCarousel() {
    return axiosInstance.get('/api/admin/carousel')
  },
  
  // 添加轮播图（文件上传）
  addCarousel(data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('link', data.link)
    
    if (data.imageFile) {
      formData.append('file', data.imageFile)
    }
    
    return uploadInstance.post('/api/admin/carousel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新轮播图（文件上传）
  updateCarousel(id, data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('link', data.link)
    
    if (data.imageFile) {
      formData.append('file', data.imageFile)
    }
    
    return uploadInstance.put(`/api/admin/carousel/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  deleteCarousel(id) {
    return axiosInstance.delete(`/api/admin/carousel/${id}`)
  },
  
  // 优惠政策管理
  getAdminPolicies() {
    return axiosInstance.get('/api/admin/policies')
  },
  
  // 添加优惠政策（文件上传）
  addPolicy(data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    formData.append('detailContent', data.detailContent)
    
    if (data.imageFile) {
      formData.append('file', data.imageFile)
    }
    
    return uploadInstance.post('/api/admin/policies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新优惠政策（文件上传）
  updatePolicy(id, data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    formData.append('detailContent', data.detailContent)
    
    if (data.imageFile) {
      formData.append('file', data.imageFile)
    }
    
    return uploadInstance.put(`/api/admin/policies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  deletePolicy(id) {
    return axiosInstance.delete(`/api/admin/policies/${id}`)
  },
  
  // 产品管理
  getAdminProducts() {
    return axiosInstance.get('/api/admin/products')
  },
  
  // 添加产品（文件上传）
  addProduct(data) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('category', data.category)
    formData.append('description', data.description)
    formData.append('price', data.price)
    formData.append('isHot', data.isHot ? 'true' : 'false')
    
    if (data.mainFile) {
      formData.append('mainFile', data.mainFile)
    } else if (data.image && !data.image.startsWith('data:')) {
      // 如果是已上传的图片名称而非File对象
      formData.append('image', data.image)
    }
    
    // 添加对附加图片的支持
    if (data.additionalFiles && data.additionalFiles.length > 0) {
      data.additionalFiles.forEach(file => {
        formData.append('additionalFiles', file)
      })
    } else if (data.images && data.images.length > 0) {
      // 如果是已上传的图片名称数组
      data.images.forEach(imageName => {
        // 检查是否是临时预览对象
        if (typeof imageName === 'object' && imageName.url) {
          // 跳过临时预览对象
          return;
        }
        if (typeof imageName === 'string' && !imageName.startsWith('data:')) {
          formData.append('images', imageName)
        }
      })
    }
    
    return uploadInstance.post('/api/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新产品（文件上传）
  updateProduct(id, data) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('category', data.category)
    formData.append('description', data.description)
    formData.append('price', data.price)
    formData.append('isHot', data.isHot ? 'true' : 'false')
    
    if (data.mainFile) {
      formData.append('mainFile', data.mainFile)
    } else if (data.image && !data.image.startsWith('data:')) {
      // 如果是已上传的图片名称而非File对象
      formData.append('image', data.image)
    }
    
    // 添加对附加图片的支持
    if (data.additionalFiles && data.additionalFiles.length > 0) {
      data.additionalFiles.forEach(file => {
        formData.append('additionalFiles', file)
      })
    } else if (data.images && data.images.length > 0) {
      // 如果是已上传的图片名称数组
      data.images.forEach(imageName => {
        // 检查是否是临时预览对象
        if (typeof imageName === 'object' && imageName.url) {
          // 跳过临时预览对象
          return;
        }
        if (typeof imageName === 'string' && !imageName.startsWith('data:')) {
          formData.append('images', imageName)
        }
      })
    }
    
    return uploadInstance.put(`/api/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新产品（使用图片名称）
  updateProductWithImageNames(id, data) {
    return axiosInstance.put(`/api/admin/products/${id}/images`, data)
  },
  
  deleteProduct(id) {
    return axiosInstance.delete(`/api/admin/products/${id}`)
  },
  
  // 关于我们管理
  updateAbout(data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    
    if (data.imageFile) {
      formData.append('file', data.imageFile)
    }
    
    return uploadInstance.put('/api/admin/about', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 联系我们管理 - 使用JSON格式
  updateContact(data) {
    return axiosInstance.put('/api/admin/contact', data)
  },
  
  // 修改管理员密码
  changePassword(data) {
    return axiosInstance.put('/api/admin/password', data)
  },
  
  // Logo管理
  updateLogo(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return uploadInstance.put('/api/admin/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 导出API对象
export default api 

// 导出工具函数
export { processImageUrl } 