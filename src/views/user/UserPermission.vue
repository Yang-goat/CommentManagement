<template>
  <div class="user-permission-container">
    <div class="header">
      <h2>评论权限控制</h2>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 权限表格 -->
    <el-table :data="users" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column label="评论权限" width="150">
        <template #default="scope">
          <el-switch
            v-model="scope.row.commentPermission"
            active-text="启用"
            inactive-text="禁用"
            @change="handlePermissionChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="用户状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟数据
const users = ref([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  username: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@blog.com',
        registerTime: '2023-01-15T10:30:00Z',
        status: 'active',
        commentPermission: true,
        isAdmin: true
      },
      {
        id: 2,
        username: 'user1',
        email: 'user1@blog.com',
        registerTime: '2023-02-20T14:20:00Z',
        status: 'active',
        commentPermission: true,
        isAdmin: false
      },
      {
        id: 3,
        username: 'user2',
        email: 'user2@blog.com',
        registerTime: '2023-03-10T09:15:00Z',
        status: 'inactive',
        commentPermission: false,
        isAdmin: false
      }
    ]
    
    users.value = mockUsers
    pagination.total = mockUsers.length
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索用户
const searchUsers = () => {
  fetchUsers()
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  fetchUsers()
}

// 处理权限变更
const handlePermissionChange = (user) => {
  // 模拟更新权限
  ElMessage.success(`用户 ${user.username} 的评论权限已更新`)
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-permission-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: auto;
}

.header {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式表格 */
@media (max-width: 768px) {
  .el-table-column {
    padding: 5px;
  }
}
</style>