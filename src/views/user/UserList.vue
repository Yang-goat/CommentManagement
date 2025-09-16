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
    <el-table :data="displayUsers" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="githubId" label="GitHub ID" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="createdAt" label="注册时间" width="200" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="最近登录时间" width="200" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="权限状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.comPermissions ? 'success' : 'danger'">
            {{ scope.row.comPermissions ? '启用' : '禁用' }}
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
            v-model="permissionForm.comPermissions"
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
import { API_BASE } from '@/config'

const allUsers = ref([])       // 保存后端返回的全量用户
const displayUsers = ref([])   // 当前页显示的数据
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
  comPermissions: true
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 更新当前页数据
const updateDisplayUsers = () => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  displayUsers.value = allUsers.value.slice(start, end)
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await fetch(API_BASE + '/admin/api/users', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok || data.code !== 200) throw new Error(data.message || '获取用户失败')

    allUsers.value = data.data
    pagination.total = allUsers.value.length
    pagination.currentPage = 1
    updateDisplayUsers()
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}

// 搜索用户（保留后端请求）
const searchUsers = async () => {
  try {
    let url = ''
    if (searchForm.githubId) {
      url = `/admin/api/users/github/${searchForm.githubId}`
    } else if (searchForm.email) {
      url = `/admin/api/users/email/${searchForm.email}`
    } else if (searchForm.username) {
      url = `/admin/api/users/username/${searchForm.username}`
    } else {
      return fetchUsers()
    }

    const res = await fetch(API_BASE + url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok || data.code !== 200) throw new Error(data.message || '查询失败')

    // 搜索结果可能是单个或多个
    allUsers.value = Array.isArray(data.data) ? data.data : [data.data]
    pagination.total = allUsers.value.length
    pagination.currentPage = 1
    updateDisplayUsers()
  } catch (err) {
    ElMessage.error(err.message)
  }
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
  permissionForm.comPermissions = user.comPermissions
  permissionDialogVisible.value = true
}

// 保存权限
const savePermissions = async () => {
  try {
    const res = await fetch(API_BASE + `/admin/api/users/${permissionForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ comPermissions: permissionForm.comPermissions })
    })
    const data = await res.json()
    if (!res.ok || data.code !== 200) throw new Error(data.message || '保存失败')

    // 更新前端数据
    const index = allUsers.value.findIndex(u => u.id === permissionForm.id)
    if (index !== -1) {
      allUsers.value[index] = data.data
      updateDisplayUsers()
    }

    ElMessage.success('评论权限更新成功')
    permissionDialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.message)
  }
}

// 删除用户
const deleteUser = (id) => {
  ElMessageBox.confirm('确定要删除该用户吗？此操作不可撤销。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await fetch(API_BASE + `/admin/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok || data.code !== 200) throw new Error(data.message || '删除失败')

      allUsers.value = allUsers.value.filter(user => user.id !== id)
      pagination.total = allUsers.value.length
      updateDisplayUsers()
      ElMessage.success('用户删除成功')
    } catch (err) {
      ElMessage.error(err.message)
    }
  }).catch(() => {})
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  updateDisplayUsers()
}
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  updateDisplayUsers()
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
</style>
