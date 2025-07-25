<template>
  <div class="product-detail-page">
    <div class="page-banner">
      <div class="banner-overlay">
        <div class="container">
          <h1 class="page-title">产品详情</h1>
        </div>
      </div>
    </div>
    
    <section class="section product-detail-section">
      <div class="container">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="!productData" class="empty-result">
          <el-empty description="未找到该产品" />
          <div class="back-button">
            <el-button type="primary" @click="goBack">返回列表</el-button>
          </div>
        </div>
        
        <div v-else class="product-detail-container">
          <el-card class="product-detail-card">
            <div class="product-detail-content">
              <el-row :gutter="30">
                <el-col :md="12">
                  <div class="product-detail-image">
                    <div class="main-image-container" @click="openImageViewer(processImageUrl(productData.image), productData.name)">
                      <img :src="processImageUrl(productData.image)" :alt="productData.name" class="main-image">
                      <div class="zoom-hint">
                        <span>点击查看大图</span>
                      </div>
                    </div>
                    
                    <!-- 产品图集 -->
                    <div class="product-gallery" v-if="productData.images && productData.images.length > 0">
                      <h3>产品图集</h3>
                      <div class="gallery-container">
                        <div 
                          v-for="(img, index) in productData.images" 
                          :key="index" 
                          class="gallery-item"
                          @click="openImageViewer(processImageUrl(img), `产品图${index+1}`)"
                        >
                          <img :src="processImageUrl(img)" :alt="`产品图${index+1}`">
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :md="12">
                  <div class="product-info">
                    <h2 class="product-name">{{ productData.name }}</h2>
                    <div class="product-meta">
                      <div class="product-price">{{ productData.price }}</div>
                      <el-tag v-if="productData.isHot" type="danger" class="hot-tag">热销产品</el-tag>
                    </div>
                    <div class="product-description">
                      <h3>产品描述</h3>
                      <p>{{ productData.description }}</p>
                    </div>
                    <div class="product-features">
                      <h3>产品特点</h3>
                      <ul>
                        <li>高品质材料，耐用可靠</li>
                        <li>精细做工，美观大方</li>
                        <li>多种规格，满足不同需求</li>
                        <li>售后保障，安心购买</li>
                      </ul>
                    </div>
                    <div class="product-actions">
                      <!-- 按钮区域保留为空 -->
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
          
          <div class="related-products" v-if="relatedProducts.length > 0">
            <h2 class="section-title">相关产品</h2>
            <el-row :gutter="20">
              <el-col :xs="12" :sm="8" :md="6" v-for="product in relatedProducts" :key="product.id">
                <div class="product-card" @click="goToProductDetail(product.id)">
                  <div class="product-image">
                    <img :src="processImageUrl(product.image)" :alt="product.name">
                    <div v-if="product.isHot" class="hot-badge">
                      <el-tag type="danger">热销</el-tag>
                    </div>
                  </div>
                  <div class="product-content">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <div class="product-price">{{ product.price }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 添加图片查看器模态框 -->
    <el-dialog
      v-model="imageViewerVisible"
      :title="currentImageTitle"
      width="80%"
      destroy-on-close
      class="image-viewer-dialog"
    >
      <div class="image-viewer-container">
        <el-button 
          v-if="allImages.length > 1" 
          class="nav-button prev-button" 
          @click="showPrevImage" 
          circle
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <img :src="currentImageUrl" class="viewer-image" alt="图片预览">
        <el-button 
          v-if="allImages.length > 1" 
          class="nav-button next-button" 
          @click="showNextImage" 
          circle
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="imageViewerVisible = false">返回产品页</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElLoading, ElMessage } from 'element-plus'
import api, { processImageUrl } from '@/api'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 数据状态
const productData = ref(null)
const loading = ref(false)
const allProducts = ref([])

// 图片查看器状态
const imageViewerVisible = ref(false)
const currentImageUrl = ref('')
const currentImageTitle = ref('')
const currentImageIndex = ref(0)

// 计算所有图片列表
const allImages = computed(() => {
  if (!productData.value) return [];
  
  const images = [];
  // 添加主图
  images.push({
    url: processImageUrl(productData.value.image),
    title: productData.value.name || '主图'
  });
  
  // 添加附图
  if (productData.value.images && Array.isArray(productData.value.images)) {
    productData.value.images.forEach((img, index) => {
      if (img) {
        images.push({
          url: processImageUrl(img),
          title: `产品图${index + 1}`
        });
      }
    });
  }
  
  return images;
});

// 获取产品详情
const fetchProductDetail = async () => {
  const productId = parseInt(route.params.id)
  if (!productId) {
    ElMessage.error('无效的产品ID')
    return
  }
  
  loading.value = true
  
  try {
    const res = await api.getProductById(productId)
    if (res.code === 200) {
      productData.value = res.data
      
      // 获取所有产品用于相关产品展示
      const productsRes = await api.getProducts()
      if (productsRes.code === 200) {
        allProducts.value = productsRes.data
      }
    } else {
      ElMessage.error('获取产品详情失败')
    }
  } catch (error) {
    console.error('获取产品详情失败', error)
    ElMessage.error('获取产品详情失败')
  } finally {
    loading.value = false
  }
}

// 相关产品
const relatedProducts = computed(() => {
  if (!productData.value || allProducts.value.length === 0) return []
  
  return allProducts.value
    .filter(item => item.id !== productData.value.id)
    .slice(0, 4)
})

// 返回上一页
const goBack = () => {
  router.push('/products')
}

// 联系咨询
const contactUs = () => {
  router.push('/contact')
}

// 跳转到产品详情
const goToProductDetail = (id) => {
  router.push(`/product/${id}`)
  // 重新获取产品详情
  fetchProductDetail()
}

// 打开图片查看器
const openImageViewer = (imgUrl, title) => {
  // 找到当前图片索引
  const index = allImages.value.findIndex(img => img.url === imgUrl);
  currentImageIndex.value = index >= 0 ? index : 0;
  currentImageUrl.value = imgUrl;
  currentImageTitle.value = title;
  imageViewerVisible.value = true;
};

// 显示上一张图片
const showPrevImage = () => {
  if (allImages.value.length <= 1) return;
  
  currentImageIndex.value = (currentImageIndex.value - 1 + allImages.value.length) % allImages.value.length;
  const image = allImages.value[currentImageIndex.value];
  currentImageUrl.value = image.url;
  currentImageTitle.value = image.title;
};

// 显示下一张图片
const showNextImage = () => {
  if (allImages.value.length <= 1) return;
  
  currentImageIndex.value = (currentImageIndex.value + 1) % allImages.value.length;
  const image = allImages.value[currentImageIndex.value];
  currentImageUrl.value = image.url;
  currentImageTitle.value = image.title;
};

// 监听ESC键关闭图片查看器
const handleKeyDown = (e) => {
  if (!imageViewerVisible.value) return;
  
  switch (e.key) {
    case 'Escape':
      imageViewerVisible.value = false;
      break;
    case 'ArrowLeft':
      showPrevImage();
      break;
    case 'ArrowRight':
      showNextImage();
      break;
    default:
      break;
  }
};

// 生命周期钩子
onMounted(() => {
  fetchProductDetail();
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);
});

// 组件销毁前移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style lang="scss" scoped>
.product-detail-page {
  min-height: 100vh;
}

// 页面横幅
.page-banner {
  height: 250px;
  background-image: url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80');
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
    font-size: 2.5rem;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
}

.product-detail-section {
  padding: 60px 0;
}

.product-detail-card {
  box-shadow: var(--box-shadow);
  border-radius: 8px;
  margin-bottom: 40px;
}

.product-detail-image {
  .main-image-container {
    width: 100%;
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0; /* Fallback background */

    @media (max-width: 768px) {
      height: 300px;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .zoom-hint {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 0.8rem;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      .main-image {
        transform: scale(1.05);
      }
      .zoom-hint {
        opacity: 1;
      }
    }
  }
}

.product-gallery {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);

  h3 {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 15px;
    padding-left: 10px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 5px;
      height: 20px;
      background-color: var(--primary-color);
    }
  }

  .gallery-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  .gallery-item {
    width: 90px;
    height: 90px;
    margin: 5px;
    overflow: hidden;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid #eaeaea;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #409EFF;
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.product-info {
  padding: 20px;
  
  .product-name {
    font-size: 2rem;
    color: var(--text-color);
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    .product-price {
      color: var(--primary-color);
      font-size: 1.8rem;
      font-weight: 600;
      margin-right: 20px;
    }
    
    .hot-tag {
      background-color: var(--primary-color);
      color: #fff;
      font-size: 0.9rem;
      padding: 5px 10px;
      border-radius: 5px;
      font-weight: 600;
    }
  }
  
  .product-description, .product-features {
    margin-bottom: 20px;
    
    h3 {
      font-size: 1.3rem;
      color: var(--text-color);
      margin-bottom: 15px;
      position: relative;
      padding-left: 15px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 5px;
        height: 20px;
        background-color: var(--primary-color);
      }
    }
    
    p {
      line-height: 1.8;
      color: var(--text-color);
    }
    
    ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 10px;
        position: relative;
        color: var(--text-color);
        
        &::before {
          content: '✓';
          color: var(--primary-color);
          margin-right: 10px;
        }
      }
    }
  }
  
  .product-actions {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    
    @media (max-width: 576px) {
      flex-direction: column;
    }
    
    .el-button {
      flex: 1;
    }
  }
}

.related-products {
  margin-top: 60px;
  
  .section-title {
    font-size: 1.8rem;
    color: var(--text-color);
    margin-bottom: 30px;
    position: relative;
    padding-left: 15px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 5px;
      background-color: var(--primary-color);
      border-radius: 3px;
    }
  }
  
  .product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    cursor: pointer;
    height: 100%;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .product-image {
      height: 180px;
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
      
      &:hover img {
        transform: scale(1.05);
      }
    }
    
    .product-content {
      padding: 15px;
      
      .product-name {
        font-size: 1.1rem;
        margin-bottom: 10px;
        color: var(--text-color);
        
        // 限制行数
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .product-price {
        color: var(--primary-color);
        font-weight: bold;
        font-size: 1.1rem;
      }
    }
  }
}

.loading-container, .empty-result {
  padding: 40px 0;
  text-align: center;
  
  .back-button {
    margin-top: 20px;
  }
}

.image-viewer-dialog {
  .image-viewer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 600px; /* Adjust height as needed */
    position: relative;

    .viewer-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      z-index: 10;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      }
      
      &.prev-button {
        left: 10px;
      }
      
      &.next-button {
        right: 10px;
      }
    }
  }

  .dialog-footer {
    text-align: center;
    padding: 15px 0;
  }
}
</style> 