// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义用户信息类型
interface UserInfo {
  [key: string]: any
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  function login(userData: UserInfo, userToken: string) {
    user.value = userData
    token.value = userToken
    // 保存到localStorage以便页面刷新后保持登录状态
    localStorage.setItem('user_token', userToken)
    localStorage.setItem('user_info', JSON.stringify(userData))
  }
  
  function logout() {
    user.value = null
    token.value = null
    // 清除localStorage中的用户信息
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
  }
  
  function initAuth() {
    // 从localStorage初始化认证信息
    const savedToken = localStorage.getItem('user_token')
    const savedUser = localStorage.getItem('user_info')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initAuth
  }
})