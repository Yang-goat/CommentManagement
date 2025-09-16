<template>
  <div class="user-list-container">
    <div class="header">
      <h2>用户列表</h2>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="GitHub ID">
          <el-input v-model="searchForm.githubId" placeholder="请输入GitHub ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户表格 -->
    <el-table :data="users" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="githubId" label="GitHub ID" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="registerTime" label="注册时间" width="200" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.registerTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最近登录时间" width="200" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.lastLoginTime) }}
        </template>
      </el-table-column>
      <el-table-column label="权限状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.commentPermission ? 'success' : 'danger'">
            {{ scope.row.commentPermission ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="editPermissions(scope.row)"
          >
            编辑权限
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteUser(scope.row.id)"
            :disabled="scope.row.isAdmin"
          >
            删除
          </el-button>
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
    
    <!-- 编辑权限对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="编辑评论权限" width="500px">
      <el-form :model="permissionForm" ref="permissionFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="permissionForm.username" disabled />
        </el-form-item>
        <el-form-item label="GitHub ID">
          <el-input v-model="permissionForm.githubId" disabled />
        </el-form-item>
        <el-form-item label="评论权限">
          <el-switch
            v-model="permissionForm.commentPermission"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const users = ref([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  githubId: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 权限表单
const permissionDialogVisible = ref(false)
const permissionForm = reactive({
  id: '',
  username: '',
  githubId: '',
  commentPermission: true
})

const permissionFormRef = ref()

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
        githubId: 'gh-admin',
        email: 'admin@blog.com',
        registerTime: '2023-01-15T10:30:00Z',
        lastLoginTime: '2023-06-15T10:30:00Z',
        commentPermission: true,
        isAdmin: true
      },
      {
        id: 2,
        username: 'user1',
        githubId: 'gh-user1',
        email: 'user1@blog.com',
        registerTime: '2023-02-20T14:20:00Z',
        lastLoginTime: '2023-06-10T14:20:00Z',
        commentPermission: true,
        isAdmin: false
      },
      {
        id: 3,
        username: 'user2',
        githubId: 'gh-user2',
        email: 'user2@blog.com',
        registerTime: '2023-03-10T09:15:00Z',
        lastLoginTime: '2023-05-10T09:15:00Z',
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
  searchForm.email = ''
  searchForm.githubId = ''
  fetchUsers()
}

// 编辑权限
const editPermissions = (user) => {
  permissionForm.id = user.id
  permissionForm.username = user.username
  permissionForm.githubId = user.githubId
  permissionForm.commentPermission = user.commentPermission
  permissionDialogVisible.value = true
}

// 保存权限
const savePermissions = () => {
  // 模拟更新权限
  const index = users.value.findIndex(u => u.id === permissionForm.id)
  if (index !== -1) {
    users.value[index].commentPermission = permissionForm.commentPermission
    ElMessage.success('评论权限更新成功')
    permissionDialogVisible.value = false
  }
}

// 删除用户
const deleteUser = (id) => {
  ElMessageBox.confirm('确定要删除该用户吗？此操作不可撤销。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    users.value = users.value.filter(user => user.id !== id)
    ElMessage.success('用户删除成功')
  }).catch(() => {
    // 用户取消删除
  })
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
.user-list-container {
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