<template>
  <div class="comment-edit-container">
    <div class="header">
      <h2>编辑评论</h2>
      <el-button @click="goBack">返回</el-button>
    </div>
    
    <el-card>
      <el-form 
        :model="commentForm" 
        :rules="rules" 
        ref="commentFormRef" 
        label-width="100px"
        v-loading="loading"
      >
        <el-form-item label="用户名">
          <el-input v-model="commentForm.username" disabled />
        </el-form-item>
        <el-form-item label="文章标题">
          <el-input v-model="commentForm.articleTitle" disabled />
        </el-form-item>
        <el-form-item label="评论时间">
          <el-input v-model="commentForm.createTime" disabled />
        </el-form-item>
        <el-form-item label="评论内容" prop="content">
          <el-input 
            v-model="commentForm.content" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入评论内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const commentForm = reactive({
  id: '',
  username: '',
  articleTitle: '',
  createTime: '',
  content: ''
})

const rules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' }
  ]
}

const commentFormRef = ref()

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取评论详情
const fetchCommentDetail = async (id) => {
  loading.value = true
  try {
    // 模拟API调用
    const mockComment = {
      id: id,
      username: 'user1',
      articleTitle: 'Vue3入门教程',
      createTime: '2023-05-10T14:30:00Z',
      content: '这篇文章写得非常好，学到了很多新知识！'
    }
    
    commentForm.id = mockComment.id
    commentForm.username = mockComment.username
    commentForm.articleTitle = mockComment.articleTitle
    commentForm.createTime = formatDate(mockComment.createTime)
    commentForm.content = mockComment.content
  } catch (error) {
    ElMessage.error('获取评论详情失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!commentFormRef.value) return
  
  await commentFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟更新评论
      ElMessage.success('评论更新成功')
      goBack()
    }
  })
}

// 返回上一页
const goBack = () => {
  router.push('/comment/list')
}

onMounted(() => {
  const commentId = route.params.id || 1 // 默认ID为1
  fetchCommentDetail(commentId)
})
</script>

<style scoped>
.comment-edit-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.el-card {
  border-radius: 8px;
}

/* 响应式表单 */
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