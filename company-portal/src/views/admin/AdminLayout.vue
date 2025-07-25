<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-sidebar">
      <div class="logo-container">
        <img :src="logo" alt="Logo" class="logo-image" v-if="!isCollapse">
        <img :src="logo" alt="Logo" class="logo-image-small" v-else>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#ffd700"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/admin/home">
          <el-icon><HomeFilled /></el-icon>
          <template #title>控制面板</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/carousel">
          <el-icon><Picture /></el-icon>
          <template #title>轮播图管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/policy">
          <el-icon><Document /></el-icon>
          <template #title>优惠政策管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <template #title>热销产品管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/categories">
          <el-icon><Menu /></el-icon>
          <template #title>产品分类管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/about">
          <el-icon><InfoFilled /></el-icon>
          <template #title>关于我们管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/contact">
          <el-icon><Phone /></el-icon>
          <template #title>联系我们管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/password">
          <el-icon><Lock /></el-icon>
          <template #title>密码修改</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/api-test">
          <el-icon><Connection /></el-icon>
          <template #title>API接口测试</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主要内容区域 -->
    <el-container class="admin-container">
      <!-- 头部 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-button
            type="text"
            class="toggle-button"
            @click="toggleSidebar"
          >
            <el-icon :size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRouteMeta.title">{{ currentRouteMeta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" icon="User" />
              <span class="username">{{ adminInfo?.username || '管理员' }}</span>
              <el-icon><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="preview">预览网站</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      
      <!-- 页脚 -->
      <el-footer class="admin-footer">
        <div class="footer-content">
          <p>© {{ currentYear }} 公司门户网站管理系统. 版权所有.</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import {
  HomeFilled,
  Picture,
  Document,
  Goods,
  InfoFilled,
  Phone,
  Lock,
  Fold,
  Expand,
  CaretBottom,
  Connection,
  Menu
} from '@element-plus/icons-vue'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// Logo
const logo = ref('/logo.png')

// 获取Logo
const getLogo = async () => {
  try {
    const res = await api.getLogo()
    if (res.code === 200) {
      logo.value = res.data
    }
  } catch (error) {
    console.error('获取Logo失败', error)
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 当前路由元信息
const currentRouteMeta = computed(() => {
  return route.meta || {}
})

// 管理员信息
const adminInfo = computed(() => {
  return userStore.getAdminInfo
})

// 当前年份
const currentYear = computed(() => {
  return new Date().getFullYear()
})

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'password':
      router.push('/admin/password')
      break
    case 'preview':
      window.open('/', '_blank')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理菜单选择
const handleMenuSelect = (path) => {
  console.log('菜单点击:', path);
  
  // 特殊处理优惠政策管理
  if (path === '/admin/policy') {
    console.log('导航到优惠政策管理页面');
  }
  
  if (path === '/admin/products') {
    console.log('导航到热销产品管理页面');
  }
  
  // 强制导航到选中的路径
  router.replace(path).catch(err => {
    console.error('路由导航失败:', err);
    if (err.name !== 'NavigationDuplicated') {
      throw err;
    }
  });
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      userStore.logout()
      ElMessage.success('退出登录成功')
      router.push('/admin/login')
    })
    .catch(() => {})
}

// 生命周期钩子
onMounted(() => {
  getLogo()
})
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

// 侧边栏
.admin-sidebar {
  background-color: #001529;
  height: 100%;
  transition: width 0.3s;
  overflow-x: hidden;
  will-change: width;
  transform: translateZ(0);
  
  .logo-container {
    height: 60px;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .logo-image {
    height: 40px;
    max-width: 160px;
    object-fit: contain;
  }
  
  .logo-image-small {
    height: 40px;
    max-width: 40px;
    object-fit: contain;
  }
  
  .admin-menu {
    border-right: none;
    
    :deep(.el-menu-item) {
      &.is-active {
        background-color: #1890ff;
      }
      
      &:hover {
        background-color: #1890ff;
        color: #fff;
      }
    }
  }
}

// 主要内容区域
.admin-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

// 头部
.admin-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: relative;
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .toggle-button {
      margin-right: 15px;
      font-size: 18px;
    }
    
    .breadcrumb {
      font-size: 14px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin: 0 5px 0 10px;
        font-size: 14px;
      }
    }
  }
}

// 内容区域
.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background-color: #f0f2f5;
}

// 页脚
.admin-footer {
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #e8e8e8;
  
  .footer-content {
    font-size: 14px;
    color: #999;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 