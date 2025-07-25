<template>
  <div class="password-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>密码修改</span>
        </div>
      </template>
      
      <el-form 
        :model="form" 
        label-width="100px" 
        :rules="rules" 
        ref="formRef" 
        v-loading="loading"
        class="password-form"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="form.oldPassword" 
            type="password" 
            placeholder="请输入原密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">修改密码</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="tips">
        <h3>密码修改说明</h3>
        <ul>
          <li>密码长度应不少于6个字符</li>
          <li>建议使用字母、数字和特殊字符的组合</li>
          <li>定期更换密码可以提高账号安全性</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formRef = ref(null)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 加载状态
const loading = ref(false)

// 验证新密码与确认密码是否一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await api.updatePassword({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        })
        
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          // 退出登录
          setTimeout(() => {
            userStore.logout()
            router.push('/admin/login')
          }, 1500)
        }
      } catch (error) {
        console.error('密码修改失败', error)
        ElMessage.error(error.message || '密码修改失败')
      } finally {
        loading.value = false
      }
    } else {
      return false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
.password-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.password-form {
  max-width: 500px;
  margin: 0 auto;
}

.tips {
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