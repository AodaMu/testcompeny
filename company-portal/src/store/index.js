import { defineStore } from 'pinia'

// 获取本地存储的用户信息
const getStoredAdminInfo = () => {
  try {
    const storedInfo = localStorage.getItem('adminInfo')
    return storedInfo ? JSON.parse(storedInfo) : null
  } catch (e) {
    console.error('解析存储的管理员信息失败', e)
    return null
  }
}

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    adminInfo: getStoredAdminInfo(),
    token: localStorage.getItem('adminToken') || null,
    isInitialized: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    getAdminInfo: (state) => state.adminInfo,
  },
  
  actions: {
    initialize() {
      if (this.isInitialized) return;
      
      // 从本地存储恢复状态
      const token = localStorage.getItem('adminToken');
      const adminInfo = getStoredAdminInfo();
      
      if (token) {
        this.token = token;
      }
      
      if (adminInfo) {
        this.adminInfo = adminInfo;
      }
      
      this.isInitialized = true;
    },
    
    setToken(token) {
      this.token = token
      localStorage.setItem('adminToken', token)
    },
    
    setAdminInfo(adminInfo) {
      this.adminInfo = adminInfo
      localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
    },
    
    logout() {
      this.token = null
      this.adminInfo = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
    },
  },
})

// 网站配置状态管理
export const useConfigStore = defineStore('config', {
  state: () => ({
    logo: '/logo.jpg',
    companyName: '公司名称',
    contactInfo: {
      address: '公司地址',
      phone: '联系电话',
      email: '联系邮箱',
    },
  }),
  
  actions: {
    updateLogo(logo) {
      this.logo = logo
    },
    
    updateCompanyName(name) {
      this.companyName = name
    },
    
    updateContactInfo(contactInfo) {
      this.contactInfo = { ...this.contactInfo, ...contactInfo }
    },
  },
})

// 网站内容状态管理
export const useContentStore = defineStore('content', {
  state: () => ({
    carousel: [],
    policies: [],
    products: [],
    aboutContent: '',
    loading: false,
  }),
  
  actions: {
    setLoading(status) {
      this.loading = status
    },
    
    setCarousel(carousel) {
      this.carousel = carousel
    },
    
    setPolicies(policies) {
      this.policies = policies
    },
    
    setProducts(products) {
      this.products = products
    },
    
    setAboutContent(content) {
      this.aboutContent = content
    },
  },
}) 