<template>
  <div class="user-liked-comments-container">
    <div class="header">
      <h2>用户点赞的评论</h2>
    </div>
    
    <!-- 用户搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户">
          <el-input v-model="searchForm.user" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchComments">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 点赞评论表格 -->
    <el-table :data="likedComments" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="articleTitle" label="文章标题" width="200" />
      <el-table-column prop="content" label="评论内容">
        <template #default="scope">
          <div class="comment-content">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="likes" label="点赞数" width="100">
        <template #default="scope">
          <el-tag type="primary">{{ scope.row.likes }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评论时间" width="200">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
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

// 用户点赞的评论数据
const likedComments = ref([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  user: ''
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

// 获取用户点赞的评论列表
const fetchLikedComments = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockLikedComments = [
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
        id: 5,
        username: 'user1',
        articleTitle: 'Node.js实战',
        content: '实践性很强，适合入门',
        createTime: '2023-05-20T13:40:00Z',
        likes: 27
      }
    ]
    
    // 根据搜索条件过滤数据
    let filteredComments = mockLikedComments
    if (searchForm.user) {
      filteredComments = filteredComments.filter(comment => 
        comment.username.includes(searchForm.user))
    }
    
    likedComments.value = filteredComments
    pagination.total = filteredComments.length
  } catch (error) {
    ElMessage.error('获取用户点赞评论列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索评论
const searchComments = () => {
  pagination.currentPage = 1
  fetchLikedComments()
}

// 重置搜索
const resetSearch = () => {
  searchForm.user = ''
  pagination.currentPage = 1
  fetchLikedComments()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchLikedComments()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchLikedComments()
}

onMounted(() => {
  fetchLikedComments()
})
</script>

<style scoped>
.user-liked-comments-container {
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

.comment-content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>