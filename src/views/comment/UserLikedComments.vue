<template>
  <div class="user-liked-comments-container">
    <div class="header">
      <h2>用户点赞记录查询</h2>
    </div>
    
    <!-- 用户搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.user" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchComments">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 点赞评论表格 -->
    <el-table 
      v-if="searchForm.user" 
      :data="pagedComments" 
      style="width: 100%" 
      v-loading="loading"
      empty-text="暂无数据"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="id" label="点赞ID" width="100" />
      <el-table-column prop="user.username" label="用户名" width="120" />
      <el-table-column prop="comment.articleTitle" label="文章标题" width="200" />
      <el-table-column prop="comment.content" label="评论内容">
        <template #default="scope">
          <div class="comment-content">{{ scope.row.comment?.content }}</div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="comment.likes" label="评论点赞数" width="120" sortable="custom">
        <template #default="scope">
          <el-tag type="primary">{{ scope.row.comment?.likes }}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column prop="createdAt" label="点赞时间" width="200" sortable="custom">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 未输入用户名时的提示 -->
    <div v-else class="empty-prompt">
      <el-empty description="请输入用户名查询用户点赞记录" />
    </div>
    
    <!-- 分页 -->
    <div v-if="searchForm.user" class="pagination-container">
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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { API_BASE } from '@/config'

// 用户点赞的评论数据
const allLikedComments = ref([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  user: ''
})

// 排序参数
const sortParams = reactive({
  prop: '',
  order: ''
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

// 处理排序变化
const handleSortChange = (sortInfo) => {
  sortParams.prop = sortInfo.prop
  sortParams.order = sortInfo.order
}

// 分页 + 排序后的数据
const pagedComments = computed(() => {
  let data = [...allLikedComments.value]

  // 排序
  if (sortParams.prop && sortParams.order) {
    data.sort((a, b) => {
      let aValue = a[sortParams.prop]
      let bValue = b[sortParams.prop]

      if (sortParams.prop === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortParams.order === 'ascending') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  // 分页
  pagination.total = data.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return data.slice(start, end)
})

// 获取用户点赞的评论列表
const fetchLikedComments = async (username) => {
  loading.value = true
  try {
    const resp = await fetch(`${API_BASE}/admin/api/comment-likes/username/${encodeURIComponent(username)}`)
    const res = await resp.json()
    console.log(res);
    if (res.code === 200) {
      allLikedComments.value = res.data
      console.log(allLikedComments);
    } else {
      ElMessage.error(res.message || '获取用户点赞评论列表失败')
    }
  } catch (error) {
    ElMessage.error('请求失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索评论
const searchComments = async () => {
  if (!searchForm.user) {
    ElMessage.warning('请输入用户名')
    return
  }
  pagination.currentPage = 1
  await fetchLikedComments(searchForm.user)
}

// 重置搜索
const resetSearch = () => {
  searchForm.user = ''
  allLikedComments.value = []
  pagination.total = 0
  sortParams.prop = ''
  sortParams.order = ''
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}
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

.empty-prompt {
  padding: 40px 0;
}
</style>
