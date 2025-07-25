<template>
  <div class="home-page" @touchstart.passive @touchmove.passive @touchend.passive>
    <!-- 轮播图模块 -->
    <section class="carousel-section">
      <el-carousel :interval="5000" :type="isMobile ? '' : 'card'" :height="isMobile ? '300px' : '500px'" :autoplay="true">
        <el-carousel-item v-for="item in carouselData" :key="item.id">
          <div class="carousel-item" :style="{ backgroundImage: `url(${processImageUrl(item.image)})` }">
            <div class="carousel-content">
              <h2 class="carousel-title">{{ item.title }}</h2>
              <el-button type="primary" size="large" @click="goToLink(item.link)">了解更多</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>
    
    <!-- 优惠政策模块 -->
    <section class="section policy-section">
      <div class="container">
        <h2 class="section-title">优惠政策</h2>
        <div class="policy-container">
          <el-row :gutter="30">
            <el-col :xs="24" :sm="12" :md="8" v-for="item in policiesData" :key="item.id">
              <div class="policy-card">
                <div class="policy-image">
                  <img :src="processImageUrl(item.image)" :alt="item.title">
                </div>
                <div class="policy-content">
                  <h3 class="policy-title">{{ item.title }}</h3>
                  <p class="policy-text">{{ item.content }}</p>
                  <div class="button-wrapper">
                    <el-tag type="success" size="small">优惠中</el-tag>
                    <el-button type="primary" size="small" class="policy-btn" @click.stop="goToPolicyDetail(item.id)">查看详情</el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </section>
    
    <!-- 热销产品模块 -->
    <section class="section products-section">
      <div class="container">
        <h2 class="section-title">热销产品</h2>
        <div class="products-container">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="8" :md="6" v-for="product in productsData" :key="product.id">
              <div class="product-card" @click.prevent @touchstart.prevent @touchmove.prevent @touchend.prevent>
                <div class="product-image">
                  <img :src="processImageUrl(product.image)" :alt="product.name">
                  <div class="hot-badge">
                    <el-tag type="danger">热销</el-tag>
                  </div>
                </div>
                <div class="product-content">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-price">{{ product.price }}</div>
                  <div class="button-wrapper">
                    <el-button type="primary" class="product-btn" @click.stop="goToProductDetail(product.id)">查看详情</el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </section>
    
    <!-- 关于我们简介 -->
    <section class="section about-section">
      <div class="container">
        <el-row :gutter="30">
          <el-col :md="12" :sm="24">
            <h2 class="section-title">关于我们</h2>
            <div class="about-content" v-html="aboutData.content"></div>
            <div class="button-wrapper">
              <router-link to="/about" class="about-link">
                <el-button type="primary">了解更多</el-button>
              </router-link>
            </div>
          </el-col>
          <el-col :md="12" :sm="24">
            <div class="about-image">
              <img :src="processImageUrl(aboutData.image)" alt="关于我们">
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store'
import api, { processImageUrl } from '@/api'
import { ElLoading } from 'element-plus'

const router = useRouter()
const contentStore = useContentStore()

// 数据
const carouselData = ref([])
const policiesData = ref([])
const productsData = ref([])
const aboutData = ref({
  title: '关于我们',
  content: '',
  image: ''
})

// 添加防止重复跳转的标志
const isNavigating = ref(false)

// 判断是否为移动端
const isMobile = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 预加载图片
const preloadImages = (imageNames) => {
  imageNames.forEach(imageName => {
    if (imageName) {
      const img = new Image()
      img.src = processImageUrl(imageName)
    }
  })
}

// 获取首页数据
const fetchHomeData = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })
  
  try {
    // 获取轮播图数据
    const carouselRes = await api.getCarousel()
    if (carouselRes.code === 200) {
      carouselData.value = carouselRes.data
      contentStore.setCarousel(carouselRes.data)
      // 预加载轮播图图片
      preloadImages(carouselRes.data.map(item => item.image))
    }
    
    // 获取优惠政策数据
    const policiesRes = await api.getPolicies()
    if (policiesRes.code === 200) {
      policiesData.value = policiesRes.data
      contentStore.setPolicies(policiesRes.data)
    }
    
    // 获取热销产品数据
    const productsRes = await api.getHotProducts()
    if (productsRes.code === 200) {
      productsData.value = productsRes.data
      contentStore.setProducts(productsRes.data)
    }
    
    // 获取关于我们数据
    const aboutRes = await api.getAbout()
    if (aboutRes.code === 200) {
      aboutData.value = aboutRes.data
      contentStore.setAboutContent(aboutRes.data.content)
    }
  } catch (error) {
    console.error('获取首页数据失败', error)
  } finally {
    loading.close()
  }
}

// 跳转到链接
const goToLink = (link) => {
  if (link.startsWith('http')) {
    window.open(link, '_blank')
  } else {
    router.push(link)
  }
}

// 跳转到产品详情页
const goToProductDetail = (id) => {
  // 防止事件冒泡和重复触发
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // 如果已经在导航中，则不再触发
  if (isNavigating.value) return
  
  // 设置导航标志
  isNavigating.value = true
  
  // 添加防抖，避免意外多次触发
  setTimeout(() => {
    router.push(`/product/${id}`)
    // 导航完成后重置标志
    setTimeout(() => {
      isNavigating.value = false
    }, 50)
  }, 50)
}

// 跳转到政策详情页
const goToPolicyDetail = (id) => {
  // 防止事件冒泡和重复触发
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // 如果已经在导航中，则不再触发
  if (isNavigating.value) return
  
  // 设置导航标志
  isNavigating.value = true
  
  // 添加防抖，避免意外多次触发
  setTimeout(() => {
    router.push(`/policy/${id}`)
    // 导航完成后重置标志
    setTimeout(() => {
      isNavigating.value = false
    }, 50)
  }, 50)
}

// 生命周期钩子
onMounted(() => {
  fetchHomeData()
  
  // 检查是否是移动设备
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  // 添加全局事件处理器来防止意外滚动导致的跳转
  const preventUnwantedNavigation = (e) => {
    // 如果目标元素或其父元素有特定的类，则不阻止事件
    const isButton = e.target.closest('.el-button') !== null
    const isLink = e.target.closest('a') !== null || e.target.closest('router-link') !== null
    
    if (!isButton && !isLink) {
      e.stopPropagation()
      if (e.cancelable) {
        e.preventDefault()
      }
    }
  }
  
  // 为可能导致跳转的事件添加处理器
  document.querySelectorAll('.policy-card, .product-card').forEach(card => {
    card.addEventListener('click', preventUnwantedNavigation, { passive: false })
    card.addEventListener('touchstart', preventUnwantedNavigation, { passive: false })
    card.addEventListener('touchmove', preventUnwantedNavigation, { passive: false })
    card.addEventListener('touchend', preventUnwantedNavigation, { passive: false })
  })
  
  // 组件卸载时移除事件监听器
  return () => {
    document.querySelectorAll('.policy-card, .product-card').forEach(card => {
      card.removeEventListener('click', preventUnwantedNavigation)
      card.removeEventListener('touchstart', preventUnwantedNavigation)
      card.removeEventListener('touchmove', preventUnwantedNavigation)
      card.removeEventListener('touchend', preventUnwantedNavigation)
    })
    window.removeEventListener('resize', checkIsMobile)
  }
})
</script>

<style lang="scss" scoped>
.home-page {
  overflow-x: hidden;
  /* 防止触摸事件引起的意外跳转 */
  touch-action: pan-y;
}

// 轮播图模块
.carousel-section {
  margin-bottom: 60px;
  
  .el-carousel {
    padding: 0;
  }
  
  .carousel-item {
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
    }
  }
  
  .carousel-content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 40px;
    color: #fff;
    text-align: center;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
    
    @media (max-width: 768px) {
      padding: 20px;
    }
  }
  
  .carousel-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 15px;
    }
  }
}

// 通用部分
.section {
  padding: 60px 0;
  
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .section-title {
    text-align: center;
    margin-bottom: 40px;
    font-size: 2rem;
    color: #333;
    position: relative;
    
    &:after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background-color: #409EFF;
      margin: 15px auto 0;
    }
  }
}

// 优惠政策模块
.policy-section {
  background-color: var(--secondary-bg);
  
  .policy-container {
    margin-top: 30px;
  }
  
  .policy-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
    pointer-events: none; /* 禁用整个卡片的点击事件 */
    touch-action: none; /* 禁用触摸操作 */
    user-select: none; /* 禁止选择文本 */
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    
    .policy-image {
      height: 200px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
    }
    
    &:hover .policy-image img {
      transform: scale(1.05);
    }
    
    .policy-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .policy-title {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 1.2rem;
        color: var(--primary-color);
      }
      
      .policy-text {
        color: #666;
        margin-bottom: 20px;
        flex: 1;
      }
      
      .button-wrapper {
        margin-top: auto;
        display: flex;
        justify-content: flex-start;
        pointer-events: auto; /* 恢复按钮容器的点击事件 */
        touch-action: manipulation; /* 允许按钮容器的触摸操作 */
        
        .policy-btn {
          margin-left: 10px; /* 添加一些间距 */
        }
      }
    }
  }
}

// 产品模块
.products-section {
  .products-container {
    margin-top: 30px;
  }
  
  .product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 30px;
    height: 100%;
    display: flex;
    flex-direction: column;
    pointer-events: none; /* 禁用整个卡片的点击事件 */
    touch-action: none; /* 禁用触摸操作 */
    user-select: none; /* 禁止选择文本 */
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    
    .product-image {
      height: 200px;
      overflow: hidden;
      position: relative;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      
      .hot-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
      }
    }
    
    &:hover .product-image img {
      transform: scale(1.05);
    }
    
    .product-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .product-name {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 1.2rem;
        color: var(--text-color);
      }
      
      .product-description {
        color: #666;
        margin-bottom: 10px;
        flex: 1;
        
        // 限制行数
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .product-price {
        color: #f56c6c;
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 15px;
      }
      
      .button-wrapper {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        pointer-events: auto; /* 恢复按钮容器的点击事件 */
        touch-action: manipulation; /* 允许按钮容器的触摸操作 */
        
        .product-btn {
          flex: 1;
          pointer-events: auto; /* 恢复按钮的点击事件 */
          touch-action: manipulation; /* 允许按钮的触摸操作 */
          z-index: 10; /* 确保按钮在最上层 */
          position: relative; /* 为z-index提供上下文 */
        }
      }
    }
  }
}

// 关于我们模块
.about-section {
  background-color: var(--secondary-bg);
  
  .about-content {
    margin-bottom: 30px;
    line-height: 1.8;
    color: #555;
    
    p {
      margin-bottom: 15px;
    }
  }
  
  .about-image {
    height: 100%;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  .about-link {
    text-decoration: none;
    display: inline-block;
    margin-top: 20px;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .carousel-section {
    .carousel-item {
      .carousel-content {
        .carousel-title {
          font-size: 1.8rem;
        }
      }
    }
  }
  
  .section {
    padding: 40px 0;
    
    .section-title {
      font-size: 1.6rem;
    }
  }
  
  .about-section {
    .about-image {
      margin-top: 30px;
    }
  }
}
</style> 