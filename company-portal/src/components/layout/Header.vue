<template>
  <header class="header">
    <div class="container header-container">
      <div class="logo-container">
        <router-link to="/">
          <img :src="`${logo}?t=${new Date().getTime()}`" alt="公司Logo" class="logo-img" />
        </router-link>
      </div>
      
      <!-- PC导航菜单 -->
      <nav class="nav-menu" v-show="!isMobile">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link :to="item.path" class="nav-link" :class="{ 'active': isActive(item.path) }">
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" v-show="isMobile" @click="toggleMobileMenu">
        <el-icon :size="24"><Menu /></el-icon>
      </div>
      
      <!-- 移动端导航菜单 -->
      <transition name="slide-fade">
        <div class="mobile-menu" v-if="isMobile && mobileMenuVisible">
          <div class="mobile-menu-header">
            <div class="mobile-menu-close" @click="toggleMobileMenu">
              <el-icon :size="24"><Close /></el-icon>
            </div>
          </div>
          <ul class="mobile-nav-list">
            <li v-for="item in navItems" :key="item.path" class="mobile-nav-item" @click="toggleMobileMenu">
              <router-link :to="item.path" class="mobile-nav-link" :class="{ 'active': isActive(item.path) }">
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </transition>
      
      <!-- 移动菜单遮罩层 -->
      <div class="mobile-menu-overlay" v-if="isMobile && mobileMenuVisible" @click="toggleMobileMenu"></div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/store'
import { Menu, Close } from '@element-plus/icons-vue'
import api from '@/api'

const route = useRoute()
const configStore = useConfigStore()

// 导航菜单项
const navItems = [
  { name: '首页', path: '/' },
  { name: '关于我们', path: '/about' },
  { name: '产品展示', path: '/products' },
  { name: '联系我们', path: '/contact' }
]

// Logo
const logo = ref('/logo.jpg')

// 获取Logo
const getLogo = async () => {
  try {
    const res = await api.getLogo()
    if (res.code === 200 && res.data && res.data.trim() !== '') {
      logo.value = res.data
      configStore.updateLogo(res.data)
    }
  } catch (error) {
    console.error('获取Logo失败', error)
  }
}

// 移动端菜单状态
const isMobile = ref(false)
const mobileMenuVisible = ref(false)

// 检查是否为移动端
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 切换移动端菜单显示状态
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
  if (mobileMenuVisible.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 判断当前路由是否激活
const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 生命周期钩子
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  // getLogo() // 禁用API请求，使用本地设置的logo
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transform: translateZ(0);
  will-change: transform;
  
  &-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    padding: 0 20px;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  
  .logo-img {
    height: 50px;
    max-width: 180px;
    object-fit: contain;
  }
}

.nav-menu {
  display: flex;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 15px;
  
  &:last-child {
    margin-right: 0;
  }
}

.nav-link {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
  
  &:hover, &.active {
    color: var(--primary-color);
    
    &::after {
      width: 100%;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--primary-color);
    transition: width 0.3s;
  }
}

// 移动端菜单样式
.mobile-menu-btn {
  cursor: pointer;
  padding: 8px;
  
  .el-icon {
    color: var(--text-color);
  }
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background-color: var(--bg-color);
  z-index: 1000;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
  
  &-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px;
  }
  
  &-close {
    cursor: pointer;
    padding: 8px;
    
    .el-icon {
      color: var(--text-color);
    }
  }
  
  &-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}

.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav-item {
  margin-bottom: 20px;
}

.mobile-nav-link {
  display: block;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
  text-decoration: none;
  padding: 10px 0;
  
  &:hover, &.active {
    color: var(--primary-color);
  }
}

// 动画效果
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style> 