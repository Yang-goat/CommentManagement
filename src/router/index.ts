import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/user/list'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true }
    },
    // 用户管理路由
    {
      path: '/user/list',
      name: 'UserList',
      component: () => import('../views/user/UserList.vue'),
      meta: { requiresAuth: true }
    },
    // 评论管理路由
    {
      path: '/comment/list',
      name: 'CommentList',
      component: () => import('../views/comment/CommentList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path:'/comment/likes',
      name:'CommentLikes',
      component: () => import('../views/comment/CommentLikes.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/comment/user-liked',
      name: 'UserLikedComments',
      component: () => import('../views/comment/UserLikedComments.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initAuth()

  document.title = typeof to.meta.title === 'string' ? to.meta.title : '评论管理系统@goatyang.com';

  if (to.matched.some(record => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    // 如果访问需要认证的页面但未登录，重定向到登录页
    next('/login')
  } else if (to.matched.some(record => record.meta.requiresGuest) && authStore.isAuthenticated) {
    // 如果已登录但访问了访客专用页面（如登录页），重定向到主页
    next('/')
  } else {
    // 其他情况正常放行
    next()
  }
})

export default router