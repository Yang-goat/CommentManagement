<template>
  <div class="comment-list-container">
    <div class="header">
      <h2>评论列表</h2>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户">
          <el-input v-model="searchForm.user" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="文章">
          <el-input v-model="searchForm.article" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchComments">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 评论表格 -->
    <el-table :data="comments" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="articleTitle" label="文章标题" width="200" />
      <el-table-column prop="content" label="评论内容">
        <template #default="scope">
          <div class="comment-content">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评论时间" width="200">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button 
            size="small" 
            @click="editComment(scope.row.id)"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteComment(scope.row.id)"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟数据
const comments = ref([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  user: '',
  article: '',
  dateRange: []
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

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockComments = [
      {
        id: 1,
        username: 'user1',
        articleTitle: 'Vue3入门教程',
        content: '这篇文章写得非常好，学到了很多新知识！',
        createTime: '2023-05-10T14:30:00Z'
      },
      {
        id: 2,
        username: 'user2',
        articleTitle: 'React Hooks详解',
        content: '感谢分享，对我帮助很大',
        createTime: '2023-05-12T09:15:00Z'
      },
      {
        id: 3,
        username: 'user3',
        articleTitle: 'JavaScript设计模式',
        content: '内容很详细，值得收藏',
        createTime: '2023-05-15T16:45:00Z'
      }
    ]
    
    comments.value = mockComments
    pagination.total = mockComments.length
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索评论
const searchComments = () => {
  fetchComments()
}

// 重置搜索
const resetSearch = () => {
  searchForm.user = ''
  searchForm.article = ''
  searchForm.dateRange = []
  fetchComments()
}

// 编辑评论
const editComment = (id) => {
  router.push(`/comment/edit/${id}`)
}

// 删除评论
const deleteComment = (id) => {
  ElMessageBox.confirm('确定要删除该评论吗？此操作不可撤销。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    comments.value = comments.value.filter(comment => comment.id !== id)
    ElMessage.success('评论删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchComments()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchComments()
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comment-list-container {
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

/* 响应式表格 */
@media (max-width: 768px) {
  .el-table-column {
    padding: 5px;
  }
}
</style>