<template>
  <el-menu
    :default-active="currentRoute"
    class="el-menu-vertical"
    router
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </template>
      <el-menu-item index="/user/list">用户列表</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="2">
      <template #title>
        <el-icon><Comment /></el-icon>
        <span>评论管理</span>
      </template>
      <el-menu-item index="/comment/list">评论列表</el-menu-item>
      <el-menu-item index="/comment/likes">点赞统计</el-menu-item>
      <el-menu-item index="/comment/user-liked">用户点赞记录</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { User, Comment } from '@element-plus/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style scoped>
.el-menu-vertical {
  border-right: none;
  height: 100%;
  overflow-y: auto;
}

/* 响应式侧边栏 */
@media (max-width: 768px) {
  .el-menu-vertical:not(.el-menu--collapse) {
    width: 100%;
    max-height: 80vh;
  }
}
</style>