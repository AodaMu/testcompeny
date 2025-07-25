<template>
  <div class="policy-detail-page">
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">{{ policyData.title || '优惠政策详情' }}</h1>
        <nav class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>优惠政策</el-breadcrumb-item>
            <el-breadcrumb-item>{{ policyData.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </nav>
      </div>
    </section>

    <section class="policy-content-section">
      <div class="container">
        <el-skeleton :rows="10" animated v-if="loading" />
        <div v-else>
          <div class="policy-header">
            <div class="policy-image" v-if="policyData.image">
              <img :src="processImageUrl(policyData.image)" :alt="policyData.title">
            </div>
            <h2 class="policy-title">{{ policyData.title }}</h2>
          </div>
          <div class="policy-content" v-html="policyData.detailContent"></div>

          <div class="policy-actions">
            <router-link to="/" class="back-link">
              <el-button type="primary">返回首页</el-button>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api, { processImageUrl } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const policyId = route.params.id

const loading = ref(true)
const policyData = ref({
  title: '',
  content: '',
  detailContent: '',
  image: ''
})

// 获取优惠政策详情
const fetchPolicyDetail = async () => {
  loading.value = true
  try {
    // 获取所有政策
    const res = await api.getPolicies()
    if (res.code === 200) {
      const policy = res.data.find(item => item.id == policyId)
      if (policy) {
        policyData.value = policy
      } else {
        ElMessage.error('未找到该优惠政策')
      }
    } else {
      ElMessage.error('获取优惠政策详情失败')
    }
  } catch (error) {
    console.error('获取优惠政策详情失败', error)
    ElMessage.error('获取优惠政策详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPolicyDetail()
})
</script>

<style lang="scss" scoped>
.policy-detail-page {
  padding-bottom: 60px;
}

.page-header {
  background-color: #f8f9fa;
  padding: 40px 0;
  margin-bottom: 40px;
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 10px;
    color: var(--primary-color);
  }
}

.policy-header {
  margin-bottom: 30px;
  
  .policy-image {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
    }
  }
  
  .policy-title {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 20px;
  }
}

.policy-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  
  ::v-deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 20px 0;
  }
  
  ::v-deep(h1, h2, h3, h4, h5, h6) {
    margin: 20px 0 10px;
    color: #333;
  }
  
  ::v-deep(p) {
    margin-bottom: 15px;
  }
  
  ::v-deep(ul, ol) {
    margin: 15px 0;
    padding-left: 20px;
  }
}

.policy-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style> 