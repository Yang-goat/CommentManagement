<template>
  <div class="comment-likes-container">
    <div class="header">
      <h2>评论点赞统计</h2>
      <el-button @click="refreshData">刷新</el-button>
    </div>
    
    <!-- 点赞统计表格 -->
    <el-table :data="sortedComments" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="articleTitle" label="文章标题" width="200" />
      <el-table-column prop="content" label="评论内容">
        <template #default="scope">
          <div class="comment-content">{{ truncateContent(scope.row.content) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="likes" label="点赞数" width="100" sortable>
        <template #default="scope">
          <el-tag type="primary">{{ scope.row.likes }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评论时间" width="200" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 评论数据
const comments = ref([])
const loading = ref(false)

// 点赞用户相关
const likedUsersDialogVisible = ref(false)
const likedUsers = ref([])
const usersLoading = ref(false)
const currentComment = ref(null)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 点赞用户分页
const usersPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 排序后的评论
const sortedComments = computed(() => {
  // 返回排序后的评论数据，默认按评论时间降序排列（最新评论在前）
  const sorted = [...comments.value]
  return sorted.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

// 分页后的点赞用户
const pagedLikedUsers = computed(() => {
  const start = (usersPagination.currentPage - 1) * usersPagination.pageSize
  const end = start + usersPagination.pageSize
  return likedUsers.value.slice(start, end)
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 截断评论内容
const truncateContent = (content) => {
  if (!content) return ''
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

// 获取评论点赞数据
const fetchCommentLikes = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockComments = [
      {
        id: 1,
        username: 'user1',
        articleTitle: 'Vue3入门教程',
        content: '这篇文章写得非常好，学到了很多新知识！',
        createTime: '2023-05-10T14:30:00Z',
        likes: 24
      },
      {
        id: 2,
        username: 'user2',
        articleTitle: 'React Hooks详解',
        content: '感谢分享，对我帮助很大',
        createTime: '2023-05-12T09:15:00Z',
        likes: 18
      },
      {
        id: 3,
        username: 'user3',
        articleTitle: 'JavaScript设计模式',
        content: '内容很详细，值得收藏',
        createTime: '2023-05-15T16:45:00Z',
        likes: 32
      },
      {
        id: 4,
        username: 'user4',
        articleTitle: 'CSS进阶技巧',
        content: '学到了很多实用的技巧，非常感谢！',
        createTime: '2023-05-18T11:20:00Z',
        likes: 15
      },
      {
        id: 5,
        username: 'user5',
        articleTitle: 'Node.js实战',
        content: '实践性很强，适合入门',
        createTime: '2023-05-20T13:40:00Z',
        likes: 27
      }
    ]
    
    comments.value = mockComments
    pagination.total = mockComments.length
  } catch (error) {
    ElMessage.error('获取评论点赞数据失败')
  } finally {
    loading.value = false
  }
}

// 获取点赞用户列表
const fetchLikedUsers = async (comment) => {
  usersLoading.value = true
  try {
    // 模拟API调用获取点赞用户列表
    // 生成更多模拟数据以展示分页效果
    const mockLikedUsers = []
    for (let i = 1; i <= 35; i++) {
      mockLikedUsers.push({
        id: 100 + i,
        username: `user${i}`,
        email: `user${i}@example.com`,
        likeTime: `2023-05-11T${(i % 24).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}:00Z`
      })
    }
    
    likedUsers.value = mockLikedUsers
    usersPagination.total = mockLikedUsers.length
    usersPagination.currentPage = 1
  } catch (error) {
    ElMessage.error('获取点赞用户列表失败')
  } finally {
    usersLoading.value = false
  }
}

// 查看点赞用户
const viewLikedUsers = async (comment) => {
  currentComment.value = comment
  likedUsersDialogVisible.value = true
  await fetchLikedUsers(comment)
}

// 刷新数据
const refreshData = () => {
  fetchCommentLikes()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchCommentLikes()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchCommentLikes()
}

// 点赞用户分页处理
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .el-button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>