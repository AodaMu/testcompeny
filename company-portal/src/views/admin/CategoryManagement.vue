<template>
  <div class="category-management-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品分类管理</span>
          <el-button type="primary" @click="openAddDialog">添加分类</el-button>
        </div>
      </template>
      
      <div v-loading="loading">
        <el-table :data="categories" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分类名称" min-width="200" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="empty-data" v-if="categories.length === 0 && !loading">
          <el-empty description="暂无分类数据" />
        </div>
      </div>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog v-model="dialogVisible" title="添加分类" width="30%">
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

// 数据状态
const categories = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const form = ref({
  name: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await api.getAdminCategories()
    if (res.code === 200) {
      categories.value = res.data
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 打开添加分类对话框
const openAddDialog = () => {
  form.value.name = ''
  dialogVisible.value = true
}

// 提交添加分类表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await api.addCategory({ name: form.value.name })
        if (res.code === 200) {
          ElMessage.success('添加分类成功')
          dialogVisible.value = false
          // 重新获取分类列表
          fetchCategories()
        } else {
          // 处理特定错误码
          if (res.code === 400) {
            ElMessage.error(res.message || '分类名称不能为空')
          } else if (res.code === 500) {
            ElMessage.error(res.message || '分类名称已存在')
          } else {
            ElMessage.error(res.message || '添加分类失败')
          }
        }
      } catch (error) {
        console.error('添加分类失败', error)
        let errorMessage = '添加分类失败'
        
        // 处理HTTP错误
        if (error.response) {
          const { status } = error.response
          if (status === 401) {
            errorMessage = '未授权，请重新登录'
            // 可以在这里处理重定向到登录页面
          } else if (status === 403) {
            errorMessage = '权限不足，无法添加分类'
          }
        }
        
        ElMessage.error(errorMessage)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除分类"${row.name}"吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await api.deleteCategory(row.id)
      if (res.code === 200) {
        ElMessage.success(res.message || '分类删除成功')
        // 重新获取分类列表
        fetchCategories()
      } else {
        // 处理特定错误码
        if (res.code === 400) {
          if (res.message && res.message.includes('正在使用')) {
            ElMessage.error(res.message || '无法删除此分类，因为有产品正在使用它')
          } else {
            ElMessage.error(res.message || '分类不存在')
          }
        } else {
          ElMessage.error(res.message || '删除分类失败')
        }
      }
    } catch (error) {
      console.error('删除分类失败', error)
      let errorMessage = '删除分类失败'
      
      // 处理HTTP错误
      if (error.response) {
        const { status, data } = error.response
        if (status === 401) {
          errorMessage = '未授权，请重新登录'
          // 可以在这里处理重定向到登录页面
        } else if (status === 403) {
          errorMessage = '权限不足，无法删除分类'
        } else if (data && data.message) {
          errorMessage = data.message
        }
      }
      
      ElMessage.error(errorMessage)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 生命周期钩子
onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.category-management-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-data {
  margin: 20px 0;
  text-align: center;
}
</style> 