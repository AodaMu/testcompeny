<template>
  <div class="logo-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Logo管理</span>
          <el-button type="primary" @click="submitForm">保存更改</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef" v-loading="loading">
        <el-form-item label="Logo URL" prop="logo">
          <el-input v-model="form.logo" placeholder="请输入Logo图片URL" />
        </el-form-item>
        
        <div class="logo-preview">
          <h3>Logo预览</h3>
          <div class="preview-container">
            <div class="light-bg">
              <img :src="form.logo" alt="Logo预览" class="logo-image" />
            </div>
            <div class="dark-bg">
              <img :src="form.logo" alt="Logo预览" class="logo-image" />
            </div>
          </div>
        </div>
        
        <div class="logo-tips">
          <h3>Logo要求</h3>
          <ul>
            <li>推荐使用透明背景的PNG格式</li>
            <li>建议尺寸：200×60像素</li>
            <li>文件大小不超过200KB</li>
            <li>保持简洁清晰，确保在不同背景下可见</li>
          </ul>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { useConfigStore } from '@/store'

const configStore = useConfigStore()

// 表单数据
const formRef = ref(null)
const form = reactive({
  logo: ''
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const rules = {
  logo: [
    { required: true, message: '请输入Logo图片URL', trigger: 'blur' }
  ]
}

// 获取Logo数据
const getLogoData = async () => {
  loading.value = true
  try {
    const res = await api.getLogo()
    if (res.code === 200) {
      form.logo = res.data
    }
  } catch (error) {
    console.error('获取Logo失败', error)
    ElMessage.error('获取Logo失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await api.updateLogo(form.logo)
        
        if (res.code === 200) {
          ElMessage.success('Logo更新成功')
          configStore.updateLogo(form.logo)
        }
      } catch (error) {
        console.error('更新Logo失败', error)
        ElMessage.error('更新失败')
      } finally {
        loading.value = false
      }
    } else {
      return false
    }
  })
}

// 生命周期钩子
onMounted(() => {
  getLogoData()
})
</script>

<style lang="scss" scoped>
.logo-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-preview {
  margin-top: 30px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
}

.preview-container {
  display: flex;
  gap: 20px;
  
  .light-bg, .dark-bg {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    height: 100px;
    border-radius: 4px;
  }
  
  .light-bg {
    background-color: #fff;
    border: 1px solid #eee;
  }
  
  .dark-bg {
    background-color: #001529;
  }
  
  .logo-image {
    max-width: 200px;
    max-height: 60px;
    object-fit: contain;
  }
}

.logo-tips {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
  
  ul {
    padding-left: 20px;
    color: #666;
    
    li {
      margin-bottom: 8px;
    }
  }
}
</style> 