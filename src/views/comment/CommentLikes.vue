<template>
  <div class="comment-likes-container">
    <div class="header">
      <h2>评论点赞统计</h2>
      <el-button @click="refreshData">刷新</el-button>
    </div>
    
    <!-- 点赞统计表格 -->
    <el-table :data="pagedComments" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="评论ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="articleTitle" label="文章路径" width="200" />
      <el-table-column prop="content" label="评论内容">
        <template #default="scope">
          <div class="comment-content">{{ truncateContent(scope.row.content) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞数" width="100" sortable>
        <template #default="scope">
          <el-tag type="primary">{{ scope.row.likeCount }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="评论时间" width="200" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button 
            size="small" 
            @click="viewLikedUsers(scope.row)"
          >
            查看点赞用户
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
    
    <!-- 点赞用户列表对话框 -->
    <el-dialog v-model="likedUsersDialogVisible" :title="`给评论 ${currentComment?.id} 点赞的用户`" width="800px">
      <el-table :data="pagedLikedUsers" style="width: 100%" v-loading="usersLoading" height="400px">
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="likeTime" label="点赞时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.likeTime) }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 点赞用户分页 -->
      <div class="pagination-container" style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="usersPagination.currentPage"
          v-model:page-size="usersPagination.pageSize"
          :page-sizes="[5, 10, 20]"
          :total="usersPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleUsersSizeChange"
          @current-change="handleUsersCurrentChange"
        />
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="likedUsersDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { API_BASE } from '@/config'

const allComments = ref([])
const loading = ref(false)

const likedUsersDialogVisible = ref(false)
const likedUsers = ref([])
const usersLoading = ref(false)
const currentComment = ref(null)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const usersPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// ---------- 分页计算 ----------
const pagedComments = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return allComments.value.slice(start, end)
})

const pagedLikedUsers = computed(() => {
  const start = (usersPagination.currentPage - 1) * usersPagination.pageSize
  const end = start + usersPagination.pageSize
  return likedUsers.value.slice(start, end)
})

// ---------- 监听 total 变化，防止 currentPage 溢出 ----------
watch(() => pagination.total, (newTotal) => {
  const maxPage = Math.max(1, Math.ceil(newTotal / pagination.pageSize))
  if (pagination.currentPage > maxPage) {
    pagination.currentPage = maxPage
  }
})

watch(() => usersPagination.total, (newTotal) => {
  const maxPage = Math.max(1, Math.ceil(newTotal / usersPagination.pageSize))
  if (usersPagination.currentPage > maxPage) {
    usersPagination.currentPage = maxPage
  }
})

// ---------- 工具函数 ----------
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const truncateContent = (content) => {
  if (!content) return ''
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

// ---------- API ----------
const fetchCommentLikes = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/admin/api/comments`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    const data = await res.json()

    if (!res.ok || data.code !== 200) {
      throw new Error(data.message || '获取评论点赞数据失败')
    }

    allComments.value = data.data.map(c => ({
      id: c.commentId,
      username: c.user?.username,
      articleTitle: c.articlePath,
      content: c.content,
      likeCount: c.likeCount,
      createdAt: c.createdAt
    }))

    pagination.total = allComments.value.length
    pagination.currentPage = 1
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const fetchLikedUsers = async (comment) => {
  usersLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/admin/api/comment-likes/comment/${comment.id}/all`, {
      credentials: 'include'
    })
    const data = await res.json()

    if (!res.ok || data.code !== 200) {
      throw new Error(data.message || '获取点赞用户列表失败')
    }

    likedUsers.value = data.data.map(u => ({
      id: u.user?.id || u.id,
      username: u.user?.username || u.username,
      email: u.user?.email || u.email,
      likeTime: u.createdAt || u.likeTime
    }))

    usersPagination.total = likedUsers.value.length
    usersPagination.currentPage = 1
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    usersLoading.value = false
  }
}

const viewLikedUsers = async (comment) => {
  currentComment.value = comment
  likedUsersDialogVisible.value = true
  await fetchLikedUsers(comment)
}

const refreshData = () => {
  fetchCommentLikes()
}

// ---------- 分页事件 ----------
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

const handleUsersSizeChange = (val) => {
  usersPagination.pageSize = val
  usersPagination.currentPage = 1
}

const handleUsersCurrentChange = (val) => {
  usersPagination.currentPage = val
}

onMounted(() => {
  fetchCommentLikes()
})
</script>

<style scoped>
.comment-likes-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.comment-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
