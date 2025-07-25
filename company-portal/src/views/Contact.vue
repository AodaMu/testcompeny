<template>
  <div class="contact-page">
    <div class="page-banner">
      <div class="banner-overlay">
        <div class="container">
          <h1 class="page-title">联系我们</h1>
        </div>
      </div>
    </div>
    
    <section class="section contact-section">
      <div class="container">
        <el-row :gutter="30">
          <el-col :lg="24" :md="24" :sm="24">
            <div class="contact-info">
              <h2 class="section-title">联系方式</h2>
              <div class="info-card">
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon :size="36"><Location /></el-icon>
                  </div>
                  <div class="info-content">
                    <h3>公司地址</h3>
                    <p>{{ contactData.address }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon :size="36"><Phone /></el-icon>
                  </div>
                  <div class="info-content">
                    <h3>联系电话</h3>
                    <p>{{ contactData.phone }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon :size="36"><Message /></el-icon>
                  </div>
                  <div class="info-content">
                    <h3>电子邮箱</h3>
                    <p>{{ contactData.email }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon :size="36"><Clock /></el-icon>
                  </div>
                  <div class="info-content">
                    <h3>工作时间</h3>
                    <p>{{ contactData.workTime }}</p>
                  </div>
                </div>
              </div>
              
              <div class="social-media">
                <h3>关注我们</h3>
                <div class="social-icons">
                  <a href="#" class="social-icon">
                    <el-icon :size="24"><ChatDotRound /></el-icon>
                  </a>
                  <a href="#" class="social-icon">
                    <el-icon :size="24"><Share /></el-icon>
                  </a>
                  <a href="#" class="social-icon">
                    <el-icon :size="24"><Connection /></el-icon>
                  </a>
                  <a href="#" class="social-icon">
                    <el-icon :size="24"><VideoPlay /></el-icon>
                  </a>
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
import { Location, Phone, Message, Clock, ChatDotRound, Share, Connection, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

// 联系数据
const contactData = ref({
  address: '公司地址',
  phone: '联系电话',
  email: '联系邮箱',
  workTime: '工作时间'
})

// 获取联系信息
const fetchContactData = async () => {
  try {
    const res = await api.getContact()
    if (res.code === 200) {
      contactData.value = res.data
    }
  } catch (error) {
    console.error('获取联系信息失败', error)
  }
}

// 生命周期钩子
onMounted(() => {
  fetchContactData()
})
</script>

<style lang="scss" scoped>
.contact-page {
  min-height: 100vh;
}

// 页面横幅
.page-banner {
  height: 300px;
  background-image: url('https://via.placeholder.com/1920x300');
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

// 联系部分
.contact-section {
  padding: 80px 0;
}

// 联系信息
.contact-info {
  margin-bottom: 40px;
  
  @media (max-width: 992px) {
    margin-bottom: 60px;
  }
}

.info-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: var(--box-shadow);
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-icon {
  margin-right: 20px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

.info-content {
  h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: var(--primary-color);
  }
  
  p {
    color: var(--text-color);
    line-height: 1.5;
  }
}

// 社交媒体
.social-media {
  h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    color: var(--text-color);
  }
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--secondary-bg);
  color: var(--primary-color);
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
    color: #fff;
    transform: translateY(-3px);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .section {
    padding: 40px 0;
  }
}
</style> 