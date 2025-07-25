import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/main.scss'
import { useUserStore } from './store'
import './utils/clearLocalData' // 清除本地存储的模拟数据

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 初始化用户状态
const userStore = useUserStore(pinia)
userStore.initialize()

app.use(router)
app.use(ElementPlus, {
  size: 'default'
})

app.mount('#app') 