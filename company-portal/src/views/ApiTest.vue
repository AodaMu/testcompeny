<template>
  <div class="api-test-container">
    <h1>API 接口测试</h1>
    
    <el-tabs type="border-card">
      <!-- 前台API测试 -->
      <el-tab-pane label="前台API">
        <el-card class="api-card">
          <div class="api-buttons">
            <el-button @click="testGetCarousel" type="primary">获取轮播图列表</el-button>
            <el-button @click="testGetPolicies" type="primary">获取优惠政策列表</el-button>
            <el-button @click="testGetProducts" type="primary">获取产品列表</el-button>
            <el-button @click="testGetHotProducts" type="primary">获取热销产品列表</el-button>
            <el-button @click="testGetAbout" type="primary">获取关于我们</el-button>
            <el-button @click="testGetContact" type="primary">获取联系我们</el-button>
            <el-button @click="testGetLogo" type="primary">获取Logo</el-button>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 管理员API测试 -->
      <el-tab-pane label="管理员API">
        <el-card class="api-card">
          <h3>管理员登录</h3>
          <el-form :model="loginForm" label-width="120px" size="small">
            <el-form-item label="用户名">
              <el-input v-model="loginForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="testLogin" type="primary">登录</el-button>
            </el-form-item>
          </el-form>

          <el-divider></el-divider>
          
          <div class="api-buttons">
            <h3>轮播图管理</h3>
            <el-button @click="testGetAdminCarousel" type="primary">获取轮播图列表</el-button>
            <el-upload
              class="upload-demo"
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              :on-change="handleCarouselFileChange"
              :auto-upload="false"
              :limit="1"
            >
              <el-button type="primary">选择轮播图</el-button>
            </el-upload>
            <el-form :model="carouselForm" label-width="120px" size="small" class="mt-3">
              <el-form-item label="标题">
                <el-input v-model="carouselForm.title"></el-input>
              </el-form-item>
              <el-form-item label="链接">
                <el-input v-model="carouselForm.link"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="testAddCarousel" type="primary">添加轮播图</el-button>
              </el-form-item>
            </el-form>

            <el-divider></el-divider>
            
            <h3>产品管理</h3>
            <el-button @click="testGetAdminProducts" type="primary">获取产品列表</el-button>
            <el-upload
              class="upload-demo"
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              :on-change="handleProductFileChange"
              :auto-upload="false"
              :limit="1"
            >
              <el-button type="primary">选择产品图片</el-button>
            </el-upload>
            <el-form :model="productForm" label-width="120px" size="small" class="mt-3">
              <el-form-item label="产品名称">
                <el-input v-model="productForm.name"></el-input>
              </el-form-item>
              <el-form-item label="产品分类">
                <el-input v-model="productForm.category"></el-input>
              </el-form-item>
              <el-form-item label="产品描述">
                <el-input v-model="productForm.description" type="textarea"></el-input>
              </el-form-item>
              <el-form-item label="价格">
                <el-input v-model="productForm.price"></el-input>
              </el-form-item>
              <el-form-item label="是否热销">
                <el-switch v-model="productForm.isHot"></el-switch>
              </el-form-item>
              <el-form-item>
                <el-button @click="testAddProduct" type="primary">添加产品</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 响应结果 -->
    <el-card class="response-card">
      <h3>请求/响应信息</h3>
      <el-tabs>
        <el-tab-pane label="请求">
          <pre>{{ requestInfo }}</pre>
        </el-tab-pane>
        <el-tab-pane label="响应">
          <pre>{{ responseInfo }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import api from '@/api'
import { ElMessage } from 'element-plus'

export default {
  name: 'ApiTest',
  data() {
    return {
      requestInfo: '',
      responseInfo: '',
      loginForm: {
        username: 'admin',
        password: 'admin123'
      },
      carouselForm: {
        title: '测试轮播图',
        link: 'https://example.com',
        imageFile: null
      },
      productForm: {
        name: '测试产品',
        category: '测试分类',
        description: '这是一个测试产品描述',
        price: '99.99',
        isHot: true,
        mainFile: null
      }
    }
  },
  mounted() {
    // 检查是否已登录，如果未登录则自动使用默认账号登录
    const token = localStorage.getItem('adminToken')
    if (!token) {
      this.autoLogin()
    } else {
      ElMessage.success('您已登录，可以测试所有API')
      this.updateInfo('已登录', {}, { code: 200, message: '您已登录，可以测试所有API' })
    }
  },
  methods: {
    // 自动登录
    async autoLogin() {
      try {
        const response = await api.adminLogin(this.loginForm)
        if (response.code === 200 && response.data.token) {
          localStorage.setItem('adminToken', response.data.token)
          ElMessage.success('已自动登录，可以测试所有API')
          this.updateInfo('自动登录成功', this.loginForm, response)
        }
      } catch (error) {
        this.handleError(error)
        ElMessage.warning('自动登录失败，请手动登录')
      }
    },
    
    // 显示请求和响应信息
    updateInfo(requestName, requestData, response) {
      this.requestInfo = `请求: ${requestName}\n参数: ${JSON.stringify(requestData, null, 2)}`
      this.responseInfo = JSON.stringify(response, null, 2)
    },
    
    handleError(error) {
      if (error.response) {
        this.responseInfo = JSON.stringify(error.response.data, null, 2)
      } else {
        this.responseInfo = error.message
      }
      ElMessage.error('API请求失败')
    },
    
    // 前台API测试方法
    async testGetCarousel() {
      try {
        const response = await api.getCarousel()
        this.updateInfo('获取轮播图列表', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetPolicies() {
      try {
        const response = await api.getPolicies()
        this.updateInfo('获取优惠政策列表', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetProducts() {
      try {
        const response = await api.getProducts()
        this.updateInfo('获取产品列表', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetHotProducts() {
      try {
        const response = await api.getHotProducts()
        this.updateInfo('获取热销产品列表', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetAbout() {
      try {
        const response = await api.getAbout()
        this.updateInfo('获取关于我们', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetContact() {
      try {
        const response = await api.getContact()
        this.updateInfo('获取联系我们', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetLogo() {
      try {
        const response = await api.getLogo()
        this.updateInfo('获取Logo', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    // 管理员API测试方法
    async testLogin() {
      try {
        const response = await api.adminLogin(this.loginForm)
        this.updateInfo('管理员登录', this.loginForm, response)
        
        // 保存token到localStorage
        if (response.code === 200 && response.data.token) {
          localStorage.setItem('adminToken', response.data.token)
          ElMessage.success('登录成功，Token已保存')
        } else {
          ElMessage.warning('登录成功但未获取到Token')
        }
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetAdminCarousel() {
      try {
        const response = await api.getAdminCarousel()
        this.updateInfo('获取管理员轮播图列表', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    handleCarouselFileChange(file) {
      this.carouselForm.imageFile = file.raw
    },
    
    async testAddCarousel() {
      if (!this.carouselForm.imageFile) {
        ElMessage.warning('请先选择轮播图图片')
        return
      }
      
      try {
        const response = await api.addCarousel(this.carouselForm)
        this.updateInfo('添加轮播图', {
          title: this.carouselForm.title,
          link: this.carouselForm.link,
          imageFile: '(文件对象)'
        }, response)
        ElMessage.success('添加轮播图成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    async testGetAdminProducts() {
      try {
        const response = await api.getAdminProducts()
        this.updateInfo('获取管理员产品列表', {}, response)
        ElMessage.success('API请求成功')
      } catch (error) {
        this.handleError(error)
      }
    },
    
    handleProductFileChange(file) {
      this.productForm.mainFile = file.raw
    },
    
    async testAddProduct() {
      if (!this.productForm.mainFile) {
        ElMessage.warning('请先选择产品图片')
        return
      }
      
      try {
        const response = await api.addProduct(this.productForm)
        this.updateInfo('添加产品', {
          name: this.productForm.name,
          category: this.productForm.category,
          description: this.productForm.description,
          price: this.productForm.price,
          isHot: this.productForm.isHot,
          mainFile: '(文件对象)'
        }, response)
        ElMessage.success('添加产品成功')
      } catch (error) {
        this.handleError(error)
      }
    }
  }
}
</script>

<style scoped>
.api-test-container {
  padding: 20px;
}

.api-card {
  margin-bottom: 20px;
}

.api-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.api-buttons h3 {
  margin-top: 10px;
  margin-bottom: 10px;
}

.response-card {
  margin-top: 20px;
}

.mt-3 {
  margin-top: 15px;
}

.el-button {
  margin-right: 10px;
}

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}
</style> 