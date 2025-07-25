<template>
  <div class="products-page">
    <div class="page-banner">
      <div class="banner-overlay">
        <div class="container">
          <h1 class="page-title">产品展示</h1>
        </div>
      </div>
    </div>
    
    <section class="section products-section">
      <div class="container">
        <!-- 产品分类 -->
        <div class="category-filter">
          <el-radio-group v-model="activeCategory" size="large">
            <el-radio-button label="all">全部产品</el-radio-button>
            <el-radio-button label="hot">热销产品</el-radio-button>
            <el-radio-button v-for="category in categories" :key="category.id" :label="category.id">
              {{ category.name }}
            </el-radio-button>
          </el-radio-group>
          
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索产品"
              clearable
              prefix-icon="Search"
            />
          </div>
        </div>
        
        <!-- 产品列表 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="4" animated />
        </div>
        
        <div v-else-if="filteredProducts.length === 0" class="empty-result">
          <el-empty description="没有找到匹配的产品" />
        </div>
        
        <div v-else class="products-container">
          <el-row :gutter="30">
            <el-col :lg="6" :md="8" :sm="12" :xs="24" v-for="product in filteredProducts" :key="product.id">
              <div class="product-card" @click.prevent @touchstart.prevent @touchmove.prevent @touchend.prevent>
                <div class="product-image">
                  <img :src="product.image" :alt="product.name">
                  <div class="product-overlay">
                    <el-button type="primary" size="small" circle @click.stop="showProductDetail(product)">
                      <el-icon><View /></el-icon>
                    </el-button>
                  </div>
                  <div v-if="product.isHot" class="hot-badge">
                    <el-tag type="danger">热销</el-tag>
                  </div>
                </div>
                <div class="product-content">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-price">{{ product.price }}</div>
                  <div class="button-wrapper">
                    <el-button type="primary" class="product-btn" @click.stop="showProductDetail(product)">查看详情</el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="filteredProducts.length > 0">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredProducts.length"
            :page-size="pageSize"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContentStore } from '@/store'
import { View } from '@element-plus/icons-vue'
import api from '@/api'
import { ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'

const contentStore = useContentStore()
const router = useRouter()

// 数据状态
const productsData = ref([])
const loading = ref(false)
const activeCategory = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)

// 产品分类
const categories = ref([])
const loadingCategories = ref(false)

// 获取产品分类
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const res = await api.getCategories()
    console.log('前台页面获取到的分类数据:', res);
    
    if (res.code === 200) {
      categories.value = res.data.map(cat => ({
        id: cat.name, // 使用分类名称作为ID
        name: cat.name
      }))
      console.log('处理后的前台分类数据:', categories.value);
    } else {
      console.error('获取产品分类失败:', res.message);
      categories.value = []
    }
  } catch (error) {
    console.error('获取产品分类失败', error);
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

// 过滤产品
const filteredProducts = computed(() => {
  let result = [...productsData.value]
  
  // 按分类过滤
  if (activeCategory.value === 'hot') {
    result = result.filter(item => item.isHot === true)
  } else if (activeCategory.value !== 'all') {
    result = result.filter(item => item.category === activeCategory.value)
  }
  
  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 分页后的产品
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

// 获取产品数据
const fetchProductsData = async () => {
  loading.value = true
  
  try {
    // 确保已获取分类
    if (categories.value.length === 0) {
      await fetchCategories();
    }
    
    const res = await api.getProducts()
    if (res.code === 200) {
      // 产品已经包含category字段，直接使用
      productsData.value = res.data;
      
      // 如果后端没有提供category字段，则处理一下
      if (productsData.value.some(product => !product.category) && categories.value.length > 0) {
        productsData.value = res.data.map(item => {
          if (!item.category) {
            // 为没有分类的产品随机分配一个分类
            const categoryIndex = Math.floor(Math.random() * categories.value.length);
            return {
              ...item,
              category: categories.value[categoryIndex].id
            };
          }
          return item;
        });
      }
      
      contentStore.setProducts(productsData.value)
    }
  } catch (error) {
    console.error('获取产品数据失败', error)
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 显示产品详情
const showProductDetail = (product) => {
  // 跳转到产品详情页面
  router.push(`/product/${product.id}`)
}

// 生命周期钩子
onMounted(() => {
  fetchProductsData()
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.products-page {
  min-height: 100vh;
}

// 页面横幅
.page-banner {
  height: 300px;
  background-image: url('https://via.placeholder.com/1920x300');
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
    font-size: 3rem;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
}

// 产品部分
.products-section {
  padding: 60px 0;
}

// 分类过滤器
.category-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  .el-radio-group {
    margin-bottom: 10px;
  }
  
  .search-box {
    width: 300px;
    
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

// 产品容器
.products-container {
  margin-top: 30px;
}

// 产品卡片
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  margin-bottom: 30px;
  height: 100%;
  transition: transform 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    
    .product-overlay {
      opacity: 1;
    }
  }
}

.product-image {
  height: 200px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  .product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .hot-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
  }
}

.product-content {
    padding: 15px;
    
    .product-name {
      font-size: 1.2rem;
      margin-bottom: 10px;
      color: var(--text-color);
      transition: color 0.3s;
    }
    
    .product-description {
      color: #666;
      margin-bottom: 10px;
      font-size: 0.9rem;
      line-height: 1.5;
      height: 40px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .product-price {
      color: var(--primary-color);
      font-weight: 600;
      font-size: 1.2rem;
      margin-bottom: 15px;
    }
    
    .button-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    
    .product-btn {
      width: 100%;
    }
  }

// 分页容器
.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

// 加载和空状态
.loading-container, .empty-result {
  padding: 40px 0;
  text-align: center;
}

// 产品详情弹窗
.product-detail {
  .product-detail-image {
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }
  
  .product-detail-content {
    padding: 0 20px;
    
    @media (max-width: 768px) {
      padding: 20px 0 0;
    }
  }
  
  .product-detail-name {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: var(--text-color);
  }
  
  .product-detail-price {
    color: var(--primary-color);
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .product-detail-description, .product-detail-features {
    margin-bottom: 20px;
    
    h3 {
      font-size: 1.2rem;
      color: var(--text-color);
      margin-bottom: 10px;
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
    }
    
    ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 10px;
        position: relative;
        
        &::before {
          content: '✓';
          color: var(--primary-color);
          margin-right: 10px;
        }
      }
    }
  }
  
  .product-detail-actions {
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
</style> 