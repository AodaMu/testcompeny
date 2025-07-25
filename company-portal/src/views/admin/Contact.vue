<template>
  <div class="contact-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>联系我们管理</span>
          <el-button type="primary" @click="submitForm">保存更改</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef" v-loading="loading">
        <el-form-item label="公司地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入公司地址" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        
        <el-form-item label="工作时间" prop="workTime">
          <el-input v-model="form.workTime" placeholder="请输入工作时间" />
        </el-form-item>
        
        <el-divider content-position="left">社交媒体</el-divider>
        
        <el-form-item label="微博" prop="socialMedia.weibo">
          <el-input v-model="form.socialMedia.weibo" placeholder="请输入微博链接" />
        </el-form-item>
        
        <el-form-item label="微信" prop="socialMedia.wechat">
          <el-input v-model="form.socialMedia.wechat" placeholder="请输入微信号" />
        </el-form-item>
        
        <el-form-item label="领英" prop="socialMedia.linkedin">
          <el-input v-model="form.socialMedia.linkedin" placeholder="请输入领英链接" />
        </el-form-item>
      </el-form>
      
      <div class="preview-container">
        <h3>预览</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="公司地址">{{ form.address }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ form.phone }}</el-descriptions-item>
          <el-descriptions-item label="电子邮箱">{{ form.email }}</el-descriptions-item>
          <el-descriptions-item label="工作时间">{{ form.workTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

// 表单数据
const formRef = ref(null)
const form = reactive({
  address: '',
  phone: '',
  email: '',
  workTime: '',
  socialMedia: {
    weibo: '',
    wechat: '',
    linkedin: ''
  }
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const rules = {
  address: [
    { required: true, message: '请输入公司地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  workTime: [
    { required: true, message: '请输入工作时间', trigger: 'blur' }
  ]
}

// 获取联系我们数据
const getContactData = async () => {
  loading.value = true
  try {
    const res = await api.getContact()
    if (res.code === 200) {
      form.address = res.data.address || ''
      form.phone = res.data.phone || ''
      form.email = res.data.email || ''
      form.workTime = res.data.workTime || ''
      
      if (res.data.socialMedia) {
        form.socialMedia.weibo = res.data.socialMedia.weibo || ''
        form.socialMedia.wechat = res.data.socialMedia.wechat || ''
        form.socialMedia.linkedin = res.data.socialMedia.linkedin || ''
      }
    }
  } catch (error) {
    console.error('获取联系我们数据失败', error)
    ElMessage.error('获取联系我们数据失败')
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
        const res = await api.updateContact({
          address: form.address,
          phone: form.phone,
          email: form.email,
          workTime: form.workTime,
          socialMedia: {
            weibo: form.socialMedia.weibo,
            wechat: form.socialMedia.wechat,
            linkedin: form.socialMedia.linkedin
          }
        })
        
        if (res.code === 200) {
          ElMessage.success('保存成功')
        }
      } catch (error) {
        console.error('保存联系我们数据失败', error)
        ElMessage.error('保存失败')
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
  getContactData()
})
</script>

<style lang="scss" scoped>
.contact-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-container {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
}
</style> 