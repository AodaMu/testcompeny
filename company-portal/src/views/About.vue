<template>
  <div class="about-page">
    <div class="page-banner" :style="{ backgroundImage: `url(${aboutData.image})` }">
      <div class="banner-overlay">
        <div class="container">
          <h1 class="page-title">{{ aboutData.title }}</h1>
        </div>
      </div>
    </div>
    
    <section class="section about-content-section">
      <div class="container">
        <el-row :gutter="30">
          <el-col :md="16" :sm="24">
            <div class="about-content" v-html="aboutData.content"></div>
          </el-col>
          <el-col :md="8" :sm="24">
            <div class="about-sidebar">              
              <div class="company-values">
                <h3 class="sidebar-title">公司价值观</h3>
                <div class="value-item">
                  <div class="value-icon">
                    <el-icon :size="36"><Star /></el-icon>
                  </div>
                  <div class="value-content">
                    <h4>专业</h4>
                    <p>我们拥有专业的团队和技术，为客户提供高质量的服务。</p>
                  </div>
                </div>
                <div class="value-item">
                  <div class="value-icon">
                    <el-icon :size="36"><Connection /></el-icon>
                  </div>
                  <div class="value-content">
                    <h4>创新</h4>
                    <p>我们不断创新，追求卓越，引领行业发展。</p>
                  </div>
                </div>
                <div class="value-item">
                  <div class="value-icon">
                    <el-icon :size="36"><UserFilled /></el-icon>
                  </div>
                  <div class="value-content">
                    <h4>诚信</h4>
                    <p>我们诚信经营，赢得客户的信任和支持。</p>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useContentStore } from '@/store'
import { Star, Connection, UserFilled } from '@element-plus/icons-vue'
import api from '@/api'
import { ElLoading } from 'element-plus'

const contentStore = useContentStore()

// 关于我们数据
const aboutData = ref({
  title: '关于我们',
  content: '',
  image: 'https://via.placeholder.com/1920x500'
})

// 获取关于我们数据
const fetchAboutData = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })
  
  try {
    const res = await api.getAbout()
    if (res.code === 200) {
      aboutData.value = res.data
      contentStore.setAboutContent(res.data.content)
    }
  } catch (error) {
    console.error('获取关于我们数据失败', error)
  } finally {
    loading.close()
  }
}

// 生命周期钩子
onMounted(() => {
  fetchAboutData()
})
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
}

// 页面横幅
.page-banner {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  
  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
  }
  
  .page-title {
    color: #fff;
    font-size: 3rem;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
}

// 关于内容部分
.about-content-section {
  padding: 80px 0;
  
  .about-content {
    line-height: 1.8;
    
    p {
      margin-bottom: 20px;
    }
  }
  
  .about-sidebar {
    background-color: var(--secondary-bg);
    border-radius: 8px;
    padding: 30px;
    box-shadow: var(--box-shadow);
    
    @media (max-width: 768px) {
      margin-top: 40px;
    }
  }
  
  .sidebar-title {
    font-size: 1.5rem;
    color: var(--primary-color);
    margin-bottom: 20px;
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
  
  .company-values {
    margin-top: 0;
  }
  
  .value-item {
    display: flex;
    margin-bottom: 20px;
  }
  
  .value-icon {
    margin-right: 15px;
    color: var(--primary-color);
  }
  
  .value-content {
    h4 {
      margin-bottom: 10px;
      color: var(--primary-color);
    }
    
    p {
      font-size: 0.9rem;
      line-height: 1.6;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .section {
    padding: 40px 0;
  }
  
  .page-banner {
    height: 300px;
  }
}
</style> 