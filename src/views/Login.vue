<template>
    <div class="login-container">
        <!-- 背景装饰元素 -->
        <div class="bg-decoration"></div>
        
        <el-card class="login-card">
            <!-- 品牌标识 -->
            <div class="brand-logo">
                <el-icon class="logo-icon"><Key /></el-icon>
                <h1>评论管理系统</h1>
            </div>
            
            <div class="card-title">
                <h2>欢迎登录</h2>
                <p class="title-desc">请输入账号信息以继续</p>
            </div>
            
            <el-form 
                :model="loginForm" 
                ref="loginRef" 
                :rules="rules" 
                hide-required-asterisk
                class="login-form"
            >
                <el-form-item label="用户名" prop="username" label-width="60">
                    <el-input 
                        v-model="loginForm.username" 
                        :prefix-icon="User"
                        placeholder="请输入用户名"
                        class="form-input"
                    ></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" label-width="60">
                    <el-input 
                        v-model="loginForm.password"  
                        type="password" 
                        :prefix-icon="Lock"
                        placeholder="请输入密码"
                        class="form-input"
                    ></el-input>
                </el-form-item>
                
                <el-form-item>
                    <el-button 
                        type="primary" 
                        @click="login(loginRef)" 
                        style="width: 100%;"
                        :loading="loginLoading"
                    >
                        <template #default>
                            <span v-if="!loginLoading">登录</span>
                            <span v-else>登录中...</span>
                        </template>
                    </el-button>
                </el-form-item>
            </el-form>
            
            <!-- 底部版权信息 -->
            <div class="footer-info">
                ©GoatYang
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 登录表单数据
const loginForm = reactive({
    username: '', // 用户名
    password: ''  // 密码
})

// 状态管理
const loginRef = ref(null)
const loginLoading = ref(false)

// 表单验证规则
const rules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
    ],
})

// 登录处理函数
const login = async (formEl) => {
    if (!formEl) return
    
    loginLoading.value = true // 显示加载状态
    
    try {
        await formEl.validate((valid) => {
            if (valid) {
                console.log('登录信息:', loginForm)
                // 检查用户名和密码是否为预设值
                if (loginForm.username === 'admin' && loginForm.password === '123456') {
                    // 模拟验证延迟
                    setTimeout(() => {
                        // 登录成功，设置用户信息
                        const userData = {
                            username: loginForm.username,
                            role: 'admin'
                        }
                        authStore.login(userData, 'fake_token')
                        ElMessage.success('登录成功')
                        router.push('/user/list')
                    }, 1000)
                } else {
                    setTimeout(() => {
                        ElMessage.error('用户名或密码错误')
                    }, 1000)
                }
            } else {
                console.log('表单验证失败')
                return false
            }
        })
    } catch (error) {
        console.error('登录出错:', error)
        ElMessage.error('登录失败，请重试')
    } finally {
        loginLoading.value = false // 关闭加载状态
    }
}
</script>

<style lang="less" scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url('@/assets/imgs/login-bg.jpg'); // 使用图片作为背景
    background-size: cover; // 背景图片覆盖整个容器
    background-position: center; // 背景图片居中
    background-repeat: no-repeat; // 背景图片不重复
    position: relative;
    overflow: hidden;

    // 背景装饰（半透明遮罩）
    .bg-decoration {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3); // 半透明黑色遮罩
    }
}

.login-card {
    width: 420px;
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.85); // 稍微降低背景透明度
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    position: relative;
    transition: transform 0.3s ease;
    backdrop-filter: blur(10px); // 背景模糊效果
    
    &:hover {
        transform: translateY(-5px);
    }
    
    .brand-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 25px;
        
        .logo-icon {
            font-size: 32px;
            color: alpha(#6200ee, 0.8);
            margin-right: 10px;
        }
        
        h1 {
            font-size: 24px;
            color: #333;
            margin: 0;
            font-weight: 600;
        }
    }
    
    .card-title {
        text-align: center;
        margin-bottom: 30px;
        
        h2 {
            margin: 0 0 8px 0;
            color: #2c3e50;
            font-weight: 500;
        }
        
        .title-desc {
            color: #7f8c8d;
            margin: 0;
            font-size: 14px;
        }
    }
    
    .login-form {
        margin-top: 15px;
    }
    
    .form-input {
        transition: all 0.3s ease;
        
        &:focus-within {
            border-color: #6200ee;
            box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.2);
        }
    }
    
    .el-button {
        height: 44px;
        font-size: 16px;
        background-color: #6200ee;
        border-color: #6200ee;
        transition: all 0.3s ease;
        
        &:hover, &:focus {
            background-color: #4a00b8;
            border-color: #4a00b8;
        }
    }
    
    .footer-info {
        text-align: center;
        margin-top: 25px;
        color: #999;
        font-size: 12px;
    }
}

// 输入框图标颜色
:deep(.el-input__prefix-icon) {
    color: #999;
}
</style>