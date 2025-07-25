<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section about">
          <h3 class="footer-title">关于我们</h3>
          <p class="footer-text">我们是一家专业的公司，致力于为客户提供高质量的产品和服务。</p>
          <div class="contact">
            <p><i class="el-icon"><Location /></i> {{ contactInfo.address }}</p>
            <p><i class="el-icon"><Phone /></i> {{ contactInfo.phone }}</p>
            <p><i class="el-icon"><Message /></i> {{ contactInfo.email }}</p>
          </div>
        </div>
        
        <div class="footer-section links">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li v-for="item in navItems" :key="item.path">
              <router-link :to="item.path">{{ item.name }}</router-link>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} 公司门户网站. 版权所有.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Location, Phone, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '@/store'
import api from '@/api'

const configStore = useConfigStore()

// 导航菜单项
const navItems = [
  { name: '首页', path: '/' },
  { name: '关于我们', path: '/about' },
  { name: '产品展示', path: '/products' },
  { name: '联系我们', path: '/contact' }
]

// 联系信息
const contactInfo = ref({
  address: '公司地址',
  phone: '联系电话',
  email: '联系邮箱'
})

// 获取联系信息
const getContactInfo = async () => {
  try {
    const res = await api.getContact()
    if (res.code === 200) {
      contactInfo.value = res.data
      configStore.updateContactInfo(res.data)
    }
  } catch (error) {
    console.error('获取联系信息失败', error)
  }
}

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 生命周期钩子
onMounted(() => {
  getContactInfo()
})
</script>

<style lang="scss" scoped>
.footer {
  background-color: #333;
  color: #fff;
  padding: 60px 0 20px;
  margin-top: 60px;
  
  &-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
    margin-bottom: 40px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  &-section {
    margin-bottom: 20px;
  }
  
  &-title {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin-bottom: 20px;
    font-weight: 600;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 50px;
      height: 2px;
      background-color: var(--primary-color);
    }
  }
  
  &-text {
    line-height: 1.6;
    margin-bottom: 20px;
  }
  
  &-links {
    list-style: none;
    padding: 0;
    
    li {
      margin-bottom: 10px;
      
      a {
        color: #fff;
        text-decoration: none;
        transition: color 0.3s;
        
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
  
  &-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.contact {
  p {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 10px;
      color: var(--primary-color);
    }
  }
}
</style> 