<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">抱歉，您访问的页面不存在或已被删除。</p>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">返回首页</el-button>
          <el-button @click="goBack">返回上一页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--secondary-bg);
  padding: 40px 0;
}

.not-found-content {
  text-align: center;
  background-color: #fff;
  padding: 60px 40px;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  max-width: 600px;
  margin: 0 auto;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--text-color);
}

.error-description {
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: var(--text-color);
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
  
  .el-button {
    min-width: 150px;
    
    &--primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      
      &:hover, &:focus {
        background-color: var(--primary-dark);
        border-color: var(--primary-dark);
      }
    }
  }
}
</style> 