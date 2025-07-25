<template>
  <div class="about-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>关于我们管理</span>
          <el-button type="primary" @click="submitForm">保存更改</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef" v-loading="loading">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="15"
            placeholder="请输入关于我们的内容，支持HTML标签"
          />
        </el-form-item>
        
        <el-form-item label="图片" prop="image">
          <!-- 文件上传组件 -->
          <el-upload
            class="about-upload"
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
              style="width: 100%; max-height: 300px;" 
              :src="form.image" 
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
      </el-form>
      
      <div class="preview-container">
        <h3>内容预览</h3>
        <div class="content-preview" v-html="form.content"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { useContentStore } from '@/store'

const contentStore = useContentStore()

// 表单数据
const formRef = ref(null)
const form = reactive({
  title: '',
  content: '',
  image: '',
  imageFile: null
})

// 加载状态
const loading = ref(false)
const uploadProgress = ref(0)

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传图片', trigger: 'change' }
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

// 处理图片上传
const uploadImage = (options) => {
  const { file, onSuccess, onError, onProgress } = options
  form.imageFile = file
  
  // 模拟上传进度
  let progress = 0
  const timer = setInterval(() => {
    progress += 10
    uploadProgress.value = progress
    onProgress({ percent: progress })
    
    if (progress >= 100) {
      clearInterval(timer)
      
      // 使用FileReader生成本地预览URL
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        form.image = reader.result
        onSuccess(reader.result)
      }
      reader.onerror = (error) => {
        onError(error)
      }
    }
  }, 200)
}

// 处理上传成功
const handleUploadSuccess = (response) => {
  uploadProgress.value = 0
  ElMessage.success('图片上传成功')
}

// 处理上传失败
const handleUploadError = () => {
  uploadProgress.value = 0
  ElMessage.error('图片上传失败')
}

// 移除已上传图片
const removeImage = () => {
  form.image = ''
  form.imageFile = null
}

// 获取关于我们数据
const getAboutData = async () => {
  loading.value = true
  try {
    const res = await api.getAbout()
    if (res.code === 200) {
      form.title = res.data.title || ''
      form.content = res.data.content || ''
      form.image = res.data.image || ''
    }
  } catch (error) {
    console.error('获取关于我们数据失败', error)
    ElMessage.error('获取关于我们数据失败')
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
        // 构建数据对象
        const submitData = {
          title: form.title,
          content: form.content,
          image: form.image
        }
        
        // 如果有图片文件，添加到数据中
        if (form.imageFile) {
          submitData.imageFile = form.imageFile
        }
        
        const res = await api.updateAbout(submitData)
        
        if (res.code === 200) {
          ElMessage.success('保存成功')
          contentStore.setAboutContent(form.content)
        }
      } catch (error) {
        console.error('保存关于我们数据失败', error)
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
  getAboutData()
})
</script>

<style lang="scss" scoped>
.about-manage-page {
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

.about-upload {
  margin-bottom: 10px;
}

.upload-progress {
  margin-top: 10px;
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

.content-preview {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
  
  :deep(h3) {
    margin-top: 20px;
    margin-bottom: 10px;
    color: var(--primary-color);
  }
  
  :deep(p) {
    margin-bottom: 10px;
    line-height: 1.6;
  }
}
</style> 