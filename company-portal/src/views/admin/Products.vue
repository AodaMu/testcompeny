<template>
  <div class="products-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>热销产品管理</span>
          <div class="header-actions">
            <el-button type="success" @click="goToCategories">分类管理</el-button>
            <el-button type="primary" @click="handleAdd">添加产品</el-button>
          </div>
        </div>
      </template>
      
      <div class="filter-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="filters.keyword" placeholder="搜索产品名称" clearable @clear="handleFilter" @keyup.enter="handleFilter">
              <template #append>
                <el-button :icon="Search" @click="handleFilter"></el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.category" placeholder="产品分类" clearable @change="handleFilter">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.sort" placeholder="排序方式" @change="handleFilter">
              <el-option label="默认排序" value="" />
              <el-option label="价格从低到高" value="priceAsc" />
              <el-option label="价格从高到低" value="priceDesc" />
              <el-option label="名称升序" value="nameAsc" />
              <el-option label="名称降序" value="nameDesc" />
            </el-select>
          </el-col>
        </el-row>
      </div>
      
      <el-table :data="filteredProductsList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="产品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="price" label="价格" width="120" />
        <el-table-column label="热销" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isHot ? 'danger' : 'info'">
              {{ scope.row.isHot ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="180">
          <template #default="scope">
            <el-image 
              style="width: 150px; height: 80px" 
              :src="getImageUrl(scope.row.image)" 
              :preview-src-list="[getImageUrl(scope.row.image)]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加产品' : '编辑产品'"
      width="500px"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入产品描述" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="热销产品">
          <el-switch
            v-model="form.isHot"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        <el-form-item label="主图" prop="image">
          <!-- 主图上传组件 -->
          <el-upload
            class="product-upload"
            action="#"
            :http-request="uploadMainImage"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleMainUploadSuccess"
            :on-error="handleUploadError"
            accept="image/*"
          >
            <el-button type="primary">选择主图</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传jpg/png格式图片，大小不超过5MB
              </div>
            </template>
          </el-upload>
          <div class="image-preview" v-if="form.image">
            <el-image 
              style="width: 100%; max-height: 200px;" 
              :src="getPreviewUrl(form.image)" 
              fit="contain"
            />
            <div class="image-actions">
              <el-button type="danger" size="small" @click="removeMainImage">移除主图</el-button>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="产品图集">
          <!-- 多图上传组件 -->
          <div class="multi-upload-container">
            <el-upload
              class="product-multi-upload"
              action="#"
              :http-request="uploadAdditionalImage"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleAdditionalUploadSuccess"
              :on-error="handleUploadError"
              accept="image/*"
              :disabled="form.images.length >= 5"
            >
              <el-button type="primary" :disabled="form.images.length >= 5">
                添加图片 ({{ form.images.length }}/5)
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  最多可上传5张产品图片
                </div>
              </template>
            </el-upload>
          </div>
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <el-progress :percentage="uploadProgress" />
          </div>
          
          <!-- 图片预览区域 -->
          <div class="images-preview-container" v-if="form.images.length > 0">
            <div v-for="(img, index) in form.images" :key="index" class="image-item">
              <el-image 
                style="width: 100px; height: 100px;" 
                :src="getPreviewUrl(img)" 
                fit="cover"
              />
              <div class="image-item-actions">
                <el-button type="danger" size="small" circle @click="removeAdditionalImage(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除这个产品吗？此操作不可撤销！</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="loading">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import api, { processImageUrl } from '@/api'
import { useContentStore } from '@/store'

const contentStore = useContentStore()

// 数据列表
const productsList = ref([])
const loading = ref(false)
const router = useRouter()

// 过滤和排序
const filters = reactive({
  keyword: '',
  category: '',
  sort: ''
})

// 分类选项
const categoryOptions = ref([])
const loadingCategories = ref(false)

// 加载分类
const loadCategories = async () => {
  loadingCategories.value = true
  try {
    console.log('开始加载产品分类...');
    const res = await api.getAdminCategories()
    console.log('产品分类API响应:', res);
    
    if (res.code === 200) {
      categoryOptions.value = res.data.map(cat => ({
        label: cat.name,
        value: cat.name
      }))
      console.log('成功加载产品分类:', categoryOptions.value);
    } else {
      console.error('获取产品分类失败, API返回:', res);
      ElMessage.error(res.message || '获取产品分类失败')
      categoryOptions.value = []
    }
  } catch (error) {
    console.error('获取产品分类失败', error)
    ElMessage.error('获取产品分类失败')
    categoryOptions.value = []
  } finally {
    loadingCategories.value = false
  }
}

// 分类管理
const categories = ref([])
const categoryDialogVisible = ref(false)
const newCategory = ref('')
const loadingCategoryDialog = ref(false)

// 过滤后的产品列表
const filteredProductsList = computed(() => {
  let result = [...productsList.value]
  
  // 关键字过滤
  if (filters.keyword) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(filters.keyword.toLowerCase()) || 
      item.description.toLowerCase().includes(filters.keyword.toLowerCase())
    )
  }
  
  // 分类过滤
  if (filters.category) {
    result = result.filter(item => item.category === filters.category)
  }
  
  // 排序
  if (filters.sort) {
    switch (filters.sort) {
      case 'priceAsc':
        result.sort((a, b) => parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, '')))
        break
      case 'priceDesc':
        result.sort((a, b) => parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, '')))
        break
      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'nameDesc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
    }
  }
  
  return result
})

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const form = reactive({
  id: null,
  name: '',
  category: '',
  description: '',
  price: '',
  image: '', // 主图片字段 - 可能是名称或URL
  imageUrl: '', // 主图片URL
  imageName: '', // 主图片名称
  images: [], // 多图片数组 - 可能是名称或URL数组
  imageUrls: [], // 多图片URL数组
  imageNames: [], // 多图片名称数组
  mainFile: null, // 主图文件对象
  additionalFiles: [], // 附加图片文件对象
  isHot: false
})

// 删除对话框
const deleteDialogVisible = ref(false)
const currentDeleteId = ref(null)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择产品分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入产品描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传主图', trigger: 'change' }
  ]
}

// 获取图片URL - 用于表格显示
const getImageUrl = (image) => {
  if (!image) return ''
  if (image.startsWith('http')) return image
  return processImageUrl(image)
}

// 获取预览URL - 用于表单内预览
const getPreviewUrl = (image) => {
  if (!image) return ''
  // 如果是对象形式的临时预览
  if (typeof image === 'object' && image.url) return image.url
  // 如果是Data URL (本地预览)
  if (typeof image === 'string' && image.startsWith('data:')) return image
  // 如果是完整URL
  if (typeof image === 'string' && image.startsWith('http')) return image
  // 否则是图片名称，通过API获取
  return api.getImage(image)
}

// 处理过滤
const handleFilter = () => {
  // 已通过计算属性自动处理
}

// 获取产品列表
const getProductsList = async () => {
  loading.value = true
  try {
    const res = await api.getAdminProducts()
    if (res.code === 200) {
      productsList.value = res.data
      contentStore.setProducts(res.data)
    }
  } catch (error) {
    console.error('获取产品列表失败', error)
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 分类管理
const handleCategory = async () => {
  loadingCategoryDialog.value = true;
  console.log('打开分类管理对话框，正在获取分类数据...');
  
  try {
    // 获取分类数据
    const res = await api.getAdminCategories();
    console.log('分类管理对话框获取到的数据:', res);
    
    if (res.code === 200) {
      // 将API返回的数据转换为组件需要的格式
      categories.value = res.data.map(cat => ({
        label: cat.name,
        value: cat.name
      }));
      console.log('处理后的分类列表:', categories.value);
    } else if (res.code === 403) {
      // API未实现或权限不足，使用本地缓存的分类数据
      categories.value = [...categoryOptions.value];
      console.warn('分类API返回403错误，使用本地缓存的分类:', categories.value);
      ElMessage.warning('分类管理API未实现或权限不足，将使用已加载的分类');
    } else {
      categories.value = [...categoryOptions.value];
      console.warn('使用本地缓存的分类数据:', categories.value);
      ElMessage.warning('获取最新分类数据失败，显示已加载的分类');
    }
  } catch (error) {
    console.error('获取分类数据失败', error);
    categories.value = [...categoryOptions.value];
    ElMessage.error('获取分类数据失败');
  } finally {
    loadingCategoryDialog.value = false;
    // 无论成功与否，都显示对话框
    categoryDialogVisible.value = true;
  }
}

// 添加分类
const addCategory = () => {
  if (!newCategory.value) {
    ElMessage.warning('请输入分类名称')
    return
  }
  
  if (categories.value.some(item => item.label === newCategory.value)) {
    ElMessage.warning('该分类已存在')
    return
  }
  
  categories.value.push({
    label: newCategory.value,
    value: newCategory.value
  })
  
  newCategory.value = ''
}

// 删除分类
const deleteCategory = (index) => {
  categories.value.splice(index, 1)
}

// 保存分类
const saveCategories = async () => {
  try {
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '保存分类中...',
      background: 'rgba(255, 255, 255, 0.7)'
    });
    
    // 转换为API需要的格式
    const categoriesToSave = categories.value.map(cat => ({
      name: cat.label
    }));
    
    const res = await api.updateCategories(categoriesToSave);
    
    // 关闭加载状态
    loading.close();
    
    if (res.code === 200) {
      // 更新本地分类选项
      categoryOptions.value = [...categories.value];
      
      // 关闭对话框
      categoryDialogVisible.value = false;
      ElMessage.success('分类保存成功');
      
      // 重新加载分类 - 如果API实际可用
      try {
        await loadCategories();
      } catch (err) {
        console.warn('重新加载分类失败，但分类已本地更新', err);
      }
    } else if (res.code === 403) {
      // API未实现或权限不足，但仍然在前端更新
      categoryOptions.value = [...categories.value];
      categoryDialogVisible.value = false;
      ElMessage.warning('分类API未实现或权限不足，但分类已在前端更新');
    } else {
      ElMessage.error(res.message || '保存分类失败');
    }
  } catch (error) {
    console.error('保存分类失败', error);
    ElMessage.error('保存分类失败：' + (error.message || '未知错误'));
  }
}

// 添加产品
const handleAdd = () => {
  dialogType.value = 'add'
  form.id = null
  form.name = ''
  form.category = ''
  form.description = ''
  form.price = ''
  form.image = ''
  form.imageUrl = ''
  form.imageName = ''
  form.images = []
  form.imageUrls = []
  form.imageNames = []
  form.mainFile = null
  form.additionalFiles = []
  form.isHot = false
  dialogVisible.value = true
}

// 编辑产品
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.category = row.category || ''
  form.description = row.description
  form.price = row.price
  form.image = row.image
  form.images = row.images || []
  form.mainFile = null
  form.additionalFiles = []
  form.isHot = row.isHot || false
  dialogVisible.value = true
}

// 删除产品
const handleDelete = (row) => {
  currentDeleteId.value = row.id
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    const res = await api.deleteProduct(currentDeleteId.value)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getProductsList()
    }
  } catch (error) {
    console.error('删除产品失败', error)
    ElMessage.error('删除失败')
  } finally {
    deleteDialogVisible.value = false
  }
}

// 图片上传相关
const uploadProgress = ref(0)

// 图片上传前检查
const beforeUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isJPGOrPNG) {
    ElMessage.error('图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return isJPGOrPNG && isLt5M
}

// 上传主图
const uploadMainImage = async (options) => {
  const { file, onSuccess, onError, onProgress } = options
  
  // 保存文件对象
  form.mainFile = file
  
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
      onProgress({ percent: uploadProgress.value })
    }, 100)
    
    // 生成本地预览
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      form.image = reader.result // 设置临时预览URL
    }
    
    // 上传图片到服务器
    const res = await api.uploadImage(file)
    clearInterval(progressInterval)
    
    if (res.code === 200) {
      form.imageName = res.data.name // 保存图片名称
      form.imageUrl = res.data.url // 保存图片URL
      form.image = res.data.name // 保存图片名称到表单
      uploadProgress.value = 100
      onProgress({ percent: 100 })
      onSuccess(res)
    } else {
      onError(new Error('上传失败'))
    }
  } catch (error) {
    onError(error)
  } finally {
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
  }
}

// 上传附加图片
const uploadAdditionalImage = async (options) => {
  const { file, onSuccess, onError, onProgress } = options
  
  // 检查是否已达到最大图片数量限制
  if (form.images.length >= 5) {
    ElMessage.warning('最多只能上传5张产品图片')
    onError('已达到最大图片数量限制')
    return
  }
  
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
      onProgress({ percent: uploadProgress.value })
    }, 100)
    
    // 生成本地预览并添加临时索引标记
    const tempIndex = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // 添加临时预览图，并带上标记索引
      form.images.push({
        tempIndex: tempIndex,
        url: reader.result
      })
    }
    
    // 上传图片到服务器
    const res = await api.uploadImage(file)
    clearInterval(progressInterval)
    
    if (res.code === 200) {
      // 找到并替换临时预览图
      const index = form.images.findIndex(img => img.tempIndex === tempIndex)
      if (index !== -1) {
        // 替换为图片名称
        form.images[index] = res.data.name 
      } else {
        // 如果没找到对应的临时图，直接添加
        form.images.push(res.data.name)
      }
      
      // 保存图片文件
      form.additionalFiles.push(file)
      
      // 保存图片名称和URL
      if (!form.imageNames) form.imageNames = []
      form.imageNames.push(res.data.name)
      
      if (!form.imageUrls) form.imageUrls = []
      form.imageUrls.push(res.data.url)
      
      uploadProgress.value = 100
      onProgress({ percent: 100 })
      onSuccess(res)
    } else {
      onError(new Error('上传失败'))
    }
  } catch (error) {
    onError(error)
  } finally {
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
  }
}

// 处理主图上传成功
const handleMainUploadSuccess = (response) => {
  ElMessage.success('主图上传成功')
}

// 处理附加图片上传成功
const handleAdditionalUploadSuccess = (response) => {
  ElMessage.success('图片上传成功')
}

// 处理上传失败
const handleUploadError = () => {
  uploadProgress.value = 0
  ElMessage.error('图片上传失败')
}

// 移除主图
const removeMainImage = () => {
  form.image = ''
  form.imageUrl = ''
  form.imageName = ''
  form.mainFile = null
  ElMessage.success('主图已移除')
}

// 移除附加图片
const removeAdditionalImage = (index) => {
  // 如果是已上传的图片，尝试从服务器删除
  const removedImage = form.images[index]
  if (removedImage && !removedImage.startsWith('data:')) {
    // 是服务器上的图片，尝试删除
    api.deleteImage(removedImage).catch(error => {
      console.error('删除图片失败', error)
    })
  }
  
  // 从各个数组中移除
  form.images.splice(index, 1)
  if (form.imageNames && form.imageNames.length > index) {
    form.imageNames.splice(index, 1)
  }
  if (form.imageUrls && form.imageUrls.length > index) {
    form.imageUrls.splice(index, 1)
  }
  if (form.additionalFiles && form.additionalFiles.length > index) {
    form.additionalFiles.splice(index, 1)
  }
  
  ElMessage.success('图片已移除')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        const submitData = {
          name: form.name,
          category: form.category,
          description: form.description,
          price: form.price,
          isHot: form.isHot
        }
        
        // 添加图片相关数据
        if (form.mainFile) {
          // 如果有新上传的主图
          submitData.mainFile = form.mainFile
        } else if (form.image && !form.image.startsWith('data:')) {
          // 如果使用已有的图片名称
          submitData.image = form.image
        }
        
        // 处理附加图片
        if (form.additionalFiles && form.additionalFiles.length > 0) {
          submitData.additionalFiles = form.additionalFiles
        } else if (form.images && form.images.length > 0) {
          // 过滤出有效的图片名称
          submitData.images = form.images
            .filter(img => {
              // 过滤掉临时预览对象和Data URL
              if (typeof img === 'object' && img.url) return false;
              if (typeof img === 'string' && img.startsWith('data:')) return false;
              return true;
            });
        }
        
        if (dialogType.value === 'add') {
          res = await api.addProduct(submitData)
          ElMessage.success('添加成功')
        } else {
          res = await api.updateProduct(form.id, submitData)
          ElMessage.success('更新成功')
        }
        
        dialogVisible.value = false
        getProductsList()
      } catch (error) {
        console.error('保存产品失败', error)
        ElMessage.error('保存失败：' + (error.message || '未知错误'))
      }
    } else {
      return false
    }
  })
}

// 跳转到分类管理页面
const goToCategories = () => {
  ElMessageBox.confirm('您确定要跳转到分类管理页面吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    router.push('/admin/categories')
  }).catch(() => {
    // 用户取消
  })
}

// 生命周期钩子
onMounted(() => {
  loadCategories() // 加载分类
  getProductsList()
})
</script>

<style lang="scss" scoped>
.products-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.filter-container {
  margin-bottom: 20px;
}

.image-preview {
  margin-top: 10px;
  border: 1px solid #eee;
  padding: 5px;
  display: flex;
  align-items: center;
  gap: 10px;

  .image-actions {
    margin-left: auto;
  }
}

.product-upload {
  display: inline-block;
  margin-right: 10px;
}

.upload-progress {
  margin-top: 10px;
}

.multi-upload-container {
  margin-bottom: 15px;
}

.images-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  
  .image-item {
    position: relative;
    border: 1px solid #eee;
    padding: 5px;
    border-radius: 4px;
    
    .image-item-actions {
      position: absolute;
      top: -10px;
      right: -10px;
    }
  }
}

.category-list {
  margin-bottom: 20px;
}

.add-category-form {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  
  .el-input {
    width: 300px;
  }
}

.loading-container {
  padding: 20px;
}
</style> 