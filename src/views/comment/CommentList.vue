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
        <el-form-item label="文章路径">
          <el-input v-model="searchForm.article" placeholder="请输入文章路径" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchComments">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 评论表格 -->
    <el-table :data="displayComments" style="width: 100%" v-loading="loading" @sort-change="handleSortChange">
      <el-table-column prop="commentId" label="评论ID" width="100" sortable="custom" />
      <el-table-column prop="userId" label="用户ID" width="120" sortable="custom" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="articlePath" label="文章路径" width="200" sortable="custom" />
      <el-table-column prop="content" label="评论内容">
        <template #default="scope">
          <div class="comment-content">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="评论时间" width="200" sortable="custom">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteComment(scope.row.commentId)"
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
import { API_BASE } from '@/config'

const allComments = ref([])       // 全量评论数据
const displayComments = ref([])   // 当前页展示数据
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

// 当前排序状态 - 默认按评论ID升序排序
const sortState = reactive({
  prop: 'commentId',
  order: 'ascending'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 扁平化函数
const flattenComments = (list) => {
  return list.map(c => ({
    commentId: c.commentId,
    userId: c.user?.id,
    username: c.user?.username,
    avatarUrl: c.user?.avatarUrl,
    articlePath: c.articlePath,
    content: c.content,
    createdAt: c.createdAt,
    likeCount: c.likeCount
  }))
}

// 排序处理
const handleSortChange = ({ prop, order }) => {
  sortState.prop = prop
  sortState.order = order
  
  if (!order) {
    // 如果没有排序，则恢复按评论ID排序
    allComments.value = [...allComments.value].sort((a, b) => a.commentId - b.commentId)
    sortState.prop = 'commentId'
    sortState.order = 'ascending'
  } else {
    // 根据属性和顺序进行排序
    allComments.value = [...allComments.value].sort((a, b) => {
      let valueA = a[prop]
      let valueB = b[prop]
      
      // 对于日期字段需要特殊处理
      if (prop === 'createdAt') {
        valueA = new Date(valueA).getTime()
        valueB = new Date(valueB).getTime()
      }
      
      if (order === 'ascending') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })
  }
  
  updateDisplayComments()
}

// 更新当前页数据
const updateDisplayComments = () => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  displayComments.value = allComments.value.slice(start, end)
}

// 获取所有评论
const fetchComments = async () => {
  loading.value = true
  try {
    const res = await fetch(API_BASE + '/admin/api/comments', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok || data.code !== 200) throw new Error(data.message || '获取评论失败')

    allComments.value = flattenComments(data.data)
    pagination.total = allComments.value.length
    pagination.currentPage = 1
    
    // 应用默认排序（按评论ID升序）
    handleSortChange(sortState)
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

// 搜索评论
const searchComments = async () => {
  try {
    let url = ''
    if (searchForm.user) {
      url = `/admin/api/comments/username/${searchForm.user}`
    } else if (searchForm.article) {
      url = `/admin/api/comments/article/${searchForm.article}`
    } else if (searchForm.dateRange.length === 2) {
      const [start, end] = searchForm.dateRange
      url = `/admin/api/comments/time?startTime=${start}&endTime=${end}`
    } else {
      return fetchComments()
    }

    const res = await fetch(API_BASE + url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    const data = await res.json()
    console.log(data);

    if (!res.ok || data.code !== 200) throw new Error(data.message || '搜索失败')

    allComments.value = flattenComments(Array.isArray(data.data) ? data.data : [data.data])
    pagination.total = allComments.value.length
    pagination.currentPage = 1
    
    // 应用当前排序状态
    handleSortChange(sortState)
  } catch (err) {
    ElMessage.error(err.message)
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.user = ''
  searchForm.article = ''
  searchForm.dateRange = []
  fetchComments()
}

// 删除评论
const deleteComment = (commentId) => {
  ElMessageBox.confirm('确定要删除该评论吗？此操作不可撤销。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await fetch(API_BASE + `/admin/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok || data.code !== 200) throw new Error(data.message || '删除失败')

      allComments.value = allComments.value.filter(comment => comment.commentId !== commentId)
      pagination.total = allComments.value.length
      updateDisplayComments()
      ElMessage.success('评论删除成功')
    } catch (err) {
      ElMessage.error(err.message)
    }
  }).catch(() => {})
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  updateDisplayComments()
}
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  updateDisplayComments()
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

@media (max-width: 768px) {
  .el-table-column {
    padding: 5px;
  }
}
</style>