<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img :src="logo" alt="Logo" class="login-logo">
        <h2 class="login-title">管理员登录</h2>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <div class="login-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </div>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>默认管理员账号：admin</p>
        <p>默认管理员密码：admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 其他状态
const loading = ref(false)
const rememberMe = ref(false)
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

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const res = await api.adminLogin(loginForm)
        
        // 登录成功
        userStore.setToken(res.data.token)
        userStore.setAdminInfo({
          username: res.data.username,
          id: res.data.id || 1,
          loginTime: new Date().toISOString()
        })
        
        ElMessage.success('登录成功')
        
        // 如果有重定向地址，则跳转到重定向地址
        const redirect = route.query.redirect || '/admin/home'
        setTimeout(() => {
          router.push(redirect)
            .catch(err => {
              console.error('导航失败', err)
              if (err.name !== 'NavigationDuplicated') {
                router.push('/admin/home')
              }
            })
        }, 500)
      } catch (error) {
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
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
  // 如果已登录，直接跳转到管理后台
  if (userStore.isLoggedIn) {
    router.push('/admin/home')
  }
  
  getLogo()
})
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--secondary-bg);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  padding: 40px;
  
  @media (max-width: 576px) {
    padding: 30px 20px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .login-logo {
    height: 60px;
    margin-bottom: 20px;
  }
  
  .login-title {
    font-size: 1.8rem;
    color: var(--text-color);
    margin: 0;
  }
}

.login-form {
  margin-bottom: 20px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  
  &:hover, &:focus {
    background-color: var(--primary-dark);
    border-color: var(--primary-dark);
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #999;
  font-size: 0.9rem;
  
  p {
    margin: 5px 0;
  }
}
</style> 