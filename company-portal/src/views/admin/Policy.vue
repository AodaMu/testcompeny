<template>
  <div class="policy-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>优惠政策管理</span>
        </div>
      </template>
      
      <el-table :data="policyList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="图片" width="180">
          <template #default="scope">
            <el-image 
              style="width: 150px; height: 80px" 
              :src="scope.row.image" 
              :preview-src-list="[scope.row.image]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑对话框 -->
    <el-dialog title="编辑优惠政策" v-model="dialogVisible" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="简介内容">
          <el-input v-model="editForm.content" type="textarea" :rows="3" placeholder="请输入简介内容"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <!-- 文件上传组件 -->
          <el-upload
            class="policy-upload"
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
          <div class="image-preview" v-if="editForm.image">
            <el-image 
              style="width: 100%; max-height: 200px;" 
              :src="editForm.image" 
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
        <el-form-item label="详细内容">
          <el-input v-model="editForm.detailContent" type="textarea" :rows="6" placeholder="请输入详细内容（支持HTML）"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

// 数据列表
const policyList = ref([]);
const loading = ref(true);
const uploadProgress = ref(0);

// 获取优惠政策列表
const getPolicyList = async () => {
  loading.value = true;
  try {
    const res = await api.getAdminPolicies();
    if (res.code === 200) {
      policyList.value = res.data;
    }
  } catch (error) {
    console.error('获取优惠政策列表失败', error);
    ElMessage.error('获取优惠政策列表失败');
  } finally {
    loading.value = false;
  }
};

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
  editForm.value.imageFile = file
  
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
        editForm.value.image = reader.result
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
  editForm.value.image = ''
  editForm.value.imageFile = null
}

// 编辑优惠政策
const dialogVisible = ref(false);
const editForm = ref({
  id: '',
  title: '',
  content: '',
  image: '',
  imageFile: null,
  detailContent: ''
});
const isEdit = ref(false);

const handleEdit = (row) => {
  editForm.value = { ...row, imageFile: null };
  isEdit.value = true;
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!editForm.value.title || !editForm.value.content || !editForm.value.image) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  
  loading.value = true;
  try {
    const res = await api.updatePolicy(editForm.value.id, editForm.value);
    if (res.code === 200) {
      ElMessage.success('更新成功');
      dialogVisible.value = false;
      getPolicyList();
    } else {
      ElMessage.error(res.message || '更新失败');
    }
  } catch (error) {
    console.error('更新优惠政策失败', error);
    ElMessage.error('更新失败');
  } finally {
    loading.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  getPolicyList();
});
</script>

<style lang="scss" scoped>
.policy-manage-page {
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

.policy-upload {
  margin-bottom: 10px;
}

.upload-progress {
  margin-top: 10px;
}
</style> 