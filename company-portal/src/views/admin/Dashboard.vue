<template>
  <div class="dashboard-page">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :lg="6" :md="12" :sm="24" v-for="(item, index) in statisticsData" :key="index">
        <el-card class="statistics-card" :body-style="{ padding: '20px' }">
          <div class="statistics-content" :class="`statistics-${item.type}`">
            <div class="statistics-icon">
              <el-icon :size="40"><component :is="item.icon" /></el-icon>
            </div>
            <div class="statistics-info">
              <div class="statistics-value">{{ item.value }}</div>
              <div class="statistics-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="dashboard-row">
      <!-- 系统信息 -->
      <el-col :lg="12" :md="12" :sm="24">
        <el-card class="system-info-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <div class="system-info-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="系统名称">公司门户网站管理系统</el-descriptions-item>
              <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
              <el-descriptions-item label="技术框架">Vue 3 + Element Plus</el-descriptions-item>
              <el-descriptions-item label="服务器环境">Node.js</el-descriptions-item>
              <el-descriptions-item label="当前用户">{{ adminInfo?.username || '管理员' }}</el-descriptions-item>
              <el-descriptions-item label="登录时间">{{ formatDate(loginTime) }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      
      <!-- 最近活动 -->
      <el-col :lg="12" :md="24" :sm="24">
        <el-card class="recent-activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <div class="recent-activity-content">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :timestamp="activity.time"
                :type="activity.type"
                :color="activity.color"
                :hollow="activity.hollow"
                :size="activity.size"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="dashboard-row">
      <!-- 待办事项 -->
      <el-col :span="24">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button type="primary" size="small" @click="addTodo">添加待办</el-button>
            </div>
          </template>
          <div class="todo-content">
            <el-table :data="todoList" style="width: 100%">
              <el-table-column prop="content" label="内容" min-width="300">
                <template #default="scope">
                  <el-checkbox v-model="scope.row.completed" @change="toggleTodoStatus(scope.row)">
                    <span :class="{ 'todo-completed': scope.row.completed }">{{ scope.row.content }}</span>
                  </el-checkbox>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100">
                <template #default="scope">
                  <el-tag :type="getPriorityType(scope.row.priority)">{{ scope.row.priority }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="deadline" label="截止日期" width="180" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="editTodo(scope.row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteTodo(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 添加/编辑待办对话框 -->
    <el-dialog
      v-model="todoDialogVisible"
      :title="todoDialogType === 'add' ? '添加待办' : '编辑待办'"
      width="500px"
    >
      <el-form :model="todoForm" label-width="80px">
        <el-form-item label="内容">
          <el-input v-model="todoForm.content" placeholder="请输入待办内容" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="todoForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="todoForm.deadline"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="todoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTodo">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'
import {
  User,
  View,
  Tickets,
  DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 管理员信息
const adminInfo = computed(() => {
  return userStore.getAdminInfo
})

// 登录时间
const loginTime = ref(new Date())

// 统计数据
const statisticsData = reactive([
  {
    title: '轮播图数量',
    value: 3,
    icon: 'Picture',
    type: 'primary'
  },
  {
    title: '优惠政策数量',
    value: 3,
    icon: 'Document',
    type: 'success'
  },
  {
    title: '产品数量',
    value: 4,
    icon: 'Goods',
    type: 'warning'
  },
  {
    title: '访问量',
    value: 1024,
    icon: 'View',
    type: 'danger'
  }
])

// 最近活动
const recentActivities = reactive([
  {
    content: '更新了首页轮播图',
    time: '2023-07-05 10:00:00',
    type: 'primary',
    color: '#409EFF',
    size: 'normal'
  },
  {
    content: '添加了新产品',
    time: '2023-07-04 15:30:00',
    type: 'success',
    color: '#67C23A',
    size: 'normal'
  },
  {
    content: '修改了联系方式',
    time: '2023-07-03 09:15:00',
    type: 'warning',
    color: '#E6A23C',
    size: 'normal'
  },
  {
    content: '更新了关于我们页面',
    time: '2023-07-02 14:20:00',
    type: 'info',
    color: '#909399',
    size: 'normal'
  }
])

// 待办事项
const todoList = ref([
  {
    content: '更新首页轮播图',
    priority: '高',
    deadline: '2023-07-10',
    completed: false
  },
  {
    content: '添加新产品',
    priority: '中',
    deadline: '2023-07-15',
    completed: false
  },
  {
    content: '修改联系方式',
    priority: '低',
    deadline: '2023-07-20',
    completed: true
  }
])

// 待办对话框
const todoDialogVisible = ref(false)
const todoDialogType = ref('add') // 'add' 或 'edit'
const todoForm = ref({
  content: '',
  priority: '中',
  deadline: '',
  completed: false
})
const editingTodoIndex = ref(-1)

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取优先级类型
const getPriorityType = (priority) => {
  switch (priority) {
    case '高':
      return 'danger'
    case '中':
      return 'warning'
    case '低':
      return 'info'
    default:
      return ''
  }
}

// 切换待办状态
const toggleTodoStatus = (todo) => {
  // 在实际应用中，这里应该调用API更新待办状态
  console.log('切换待办状态:', todo)
}

// 添加待办
const addTodo = () => {
  todoDialogType.value = 'add'
  todoForm.value = {
    content: '',
    priority: '中',
    deadline: '',
    completed: false
  }
  todoDialogVisible.value = true
}

// 编辑待办
const editTodo = (todo) => {
  todoDialogType.value = 'edit'
  todoForm.value = { ...todo }
  editingTodoIndex.value = todoList.value.findIndex(item => item === todo)
  todoDialogVisible.value = true
}

// 删除待办
const deleteTodo = (index) => {
  todoList.value.splice(index, 1)
  ElMessage.success('删除成功')
}

// 保存待办
const saveTodo = () => {
  if (!todoForm.value.content) {
    ElMessage.warning('请输入待办内容')
    return
  }
  
  if (todoDialogType.value === 'add') {
    todoList.value.push({ ...todoForm.value })
    ElMessage.success('添加成功')
  } else {
    todoList.value[editingTodoIndex.value] = { ...todoForm.value }
    ElMessage.success('更新成功')
  }
  
  todoDialogVisible.value = false
}

// 生命周期钩子
onMounted(() => {
  // 在实际应用中，这里应该调用API获取数据
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 10px;
}

.dashboard-row {
  margin-top: 20px;
}

// 统计卡片
.statistics-card {
  margin-bottom: 20px;
  
  .statistics-content {
    display: flex;
    align-items: center;
    
    &.statistics-primary .statistics-icon {
      background-color: rgba(64, 158, 255, 0.1);
      color: #409EFF;
    }
    
    &.statistics-success .statistics-icon {
      background-color: rgba(103, 194, 58, 0.1);
      color: #67C23A;
    }
    
    &.statistics-warning .statistics-icon {
      background-color: rgba(230, 162, 60, 0.1);
      color: #E6A23C;
    }
    
    &.statistics-danger .statistics-icon {
      background-color: rgba(245, 108, 108, 0.1);
      color: #F56C6C;
    }
  }
  
  .statistics-icon {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
  }
  
  .statistics-info {
    flex: 1;
  }
  
  .statistics-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .statistics-title {
    font-size: 14px;
    color: #999;
  }
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

// 系统信息
.system-info-card {
  height: calc(100% - 20px);
}

// 最近活动
.recent-activity-card {
  height: calc(100% - 20px);
  
  .recent-activity-content {
    padding: 0 10px;
    max-height: 300px;
    overflow-y: auto;
  }
}

// 待办事项
.todo-card {
  .todo-content {
    .todo-completed {
      text-decoration: line-through;
      color: #999;
    }
  }
}
</style> 