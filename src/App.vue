<template>
  <div class="app-container">
    <el-container v-if="authStore.isAuthenticated">
      <el-aside width="200px">
        <!-- 侧边栏 -->
        <Sidebar />
      </el-aside>
      <el-container>
        <el-header>
          <!-- 头部 -->
          <div class="header-content">
            <span>评论管理系统</span>
            <div class="user-info">
              <el-avatar :size="45" :src="avatarUrl"/>
              <span>{{ authStore.user?.username }}</span>
              <el-button class="logout-button" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
              </el-button>
            </div>
          </div>
        </el-header>
        <el-main>
          <!-- 主体，根据侧边栏选中渲染对应组件 -->
          <router-view />
        </el-main>
        <el-footer>
          <!-- 底部 -->
          @2025 个人博客评论管理系统
        </el-footer>
      </el-container>
    </el-container>
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { SwitchButton } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar.vue';
import avatarImage from './assets/imgs/app-avatar.png';

const router = useRouter()
const authStore = useAuthStore()

const avatarUrl = avatarImage;

onMounted(() => {
  authStore.initAuth()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

.el-header {
  background-color: #409eff;
  color: white;
  line-height: 60px;
  font-size: 18px;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-button:hover {
  background-color: #ff6666;
  color: white;
}

.el-aside {
  background-color: #f5f5f5;
  height: 100%;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 120px); /* 减去 header 和 footer 的高度 */
}

.el-footer {
  background-color: #f5f5f5;
  text-align: center;
  line-height: 60px;
  color: #666;
}
</style>