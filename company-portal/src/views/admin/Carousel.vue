<template>
  <div class="carousel-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮播图管理</span>
          <el-button type="primary" @click="handleAdd">添加轮播图</el-button>
        </div>
      </template>
      
      <el-table :data="carouselList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column label="图片" width="180">
          <template #default="scope">
            <el-image 
              style="width: 150px; height: 80px" 
              :src="processImageUrl(scope.row.image)" 
              :preview-src-list="[processImageUrl(scope.row.image)]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="link" label="链接" min-width="150" />
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
      :title="dialogType === 'add' ? '添加轮播图' : '编辑轮播图'"
      width="500px"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <!-- 文件上传组件 -->
          <el-upload
            class="carousel-upload"
            action="#"
            :http-request="uploadImage"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            accept="image/*"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传jpg/png格式图片，大小不超过5MB
              </div>
            </template>
          </el-upload>
          <div class="image-preview" v-if="form.image">
            <el-image 
              style="width: 100%; max-height: 200px;" 
              :src="previewImage" 
              fit="contain"
            />
            <div class="image-actions">
              <el-button type="danger" size="small" @click="removeImage">移除图片</el-button>
            </div>
          </div>
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <el-progress :percentage="uploadProgress" />
          </div>
        </el-form-item>
        <el-form-item label="链接" prop="link">
          <el-input v-model="form.link" placeholder="请输入链接" />
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
      width="300px"
    >
      <p>确定要删除这个轮播图吗？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api, { processImageUrl } from '@/api'
import { useContentStore } from '@/store'

const contentStore = useContentStore()

// 数据列表
const carouselList = ref([])
const loading = ref(false)
const uploadProgress = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const form = reactive({
  id: null,
  title: '',
  image: '',
  link: '',
  imageFile: null
})

// 删除对话框
const deleteDialogVisible = ref(false)
const currentDeleteId = ref(null)

// 计算属性：处理图片预览URL
const previewImage = computed(() => {
  if (!form.image) return ''
  
  // 如果是新上传的文件，使用本地预览URL
  if (form.localPreview) {
    return form.localPreview
  }
  
  // 否则使用图片路径
  return processImageUrl(form.image)
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  image: [
    // 如果是编辑模式且没有选择新图片，则不需要验证图片
    { required: true, message: '请上传图片', trigger: 'change', validator: (rule, value, callback) => {
      if (dialogType.value === 'edit' && form.image) {
        callback();
      } else if (value) {
        callback();
      } else {
        callback(new Error('请上传图片'));
      }
    }}
  ],
  link: [
    { required: true, message: '请输入链接', trigger: 'blur' }
  ]
}

// 图片上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 处理图片上传 - 使用API上传图片
const uploadImage = async (options) => {
  const { file, onSuccess, onError, onProgress } = options
  form.imageFile = file
  
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
      form.localPreview = reader.result
    }
    
    // 上传图片
    const res = await api.uploadFile(file)
    clearInterval(progressInterval)
    
    if (res.code === 200) {
      form.image = res.data.url // 保存图片路径
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

// 处理上传成功
const handleUploadSuccess = (response) => {
  ElMessage.success('图片上传成功')
}

// 处理上传失败
const handleUploadError = () => {
  uploadProgress.value = 0
  ElMessage.error('图片上传失败')
}

// 移除已上传图片
const removeImage = () => {
  // 不需要单独删除服务器上的图片，后端会处理
  form.image = ''
  form.imageFile = null
  form.localPreview = null
}

// 获取轮播图列表
const getCarouselList = async () => {
  loading.value = true
  try {
    const res = await api.getAdminCarousel()
    if (res.code === 200) {
      carouselList.value = res.data
      contentStore.setCarousel(res.data)
    }
  } catch (error) {
    console.error('获取轮播图列表失败', error)
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

// 添加轮播图
const handleAdd = () => {
  dialogType.value = 'add'
  form.id = null
  form.title = ''
  form.image = ''
  form.link = ''
  form.imageFile = null
  form.localPreview = null
  dialogVisible.value = true
}

// 编辑轮播图
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.title = row.title
  form.image = row.image
  form.link = row.link
  form.imageFile = null
  form.localPreview = null
  
  // 重置表单验证状态
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
  dialogVisible.value = true
}

// 删除轮播图
const handleDelete = (row) => {
  currentDeleteId.value = row.id
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    const res = await api.deleteCarousel(currentDeleteId.value)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getCarouselList()
    }
  } catch (error) {
    console.error('删除轮播图失败', error)
    ElMessage.error('删除失败')
  } finally {
    deleteDialogVisible.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        // 构建包含图片文件的数据对象
        const submitData = {
          title: form.title,
          link: form.link
        }
        
        // 如果有图片文件，添加到数据中
        if (form.imageFile) {
          submitData.imageFile = form.imageFile
        } else if (form.image && dialogType.value === 'edit') {
          // 对于编辑模式，如果没有选择新图片，仍然保留原图
          submitData.image = form.image
        }
        
        if (dialogType.value === 'add') {
          res = await api.addCarousel(submitData)
          ElMessage.success('添加成功')
        } else {
          res = await api.updateCarousel(form.id, submitData)
          ElMessage.success('更新成功')
        }
        
        if (res.code === 200) {
          dialogVisible.value = false
          getCarouselList()
        }
      } catch (error) {
        console.error('保存轮播图失败', error)
        ElMessage.error('保存失败：' + (error.message || '未知错误'))
      }
    } else {
      return false
    }
  })
}

// 生命周期钩子
onMounted(() => {
  getCarouselList()
})
</script>

<style lang="scss" scoped>
.carousel-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-preview {
  margin-top: 10px;
  border: 1px solid #eee;
  padding: 5px;
  
  .image-actions {
    margin-top: 10px;
    text-align: center;
  }
}

.carousel-upload {
  margin-bottom: 10px;
}

.upload-progress {
  margin-top: 10px;
}
</style> 