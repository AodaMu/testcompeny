import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于我们' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: { title: '产品展示' }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue'),
    meta: { title: '联系我们' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '产品详情' }
  },
  {
    path: '/policy/:id',
    name: 'PolicyDetail',
    component: () => import('@/views/PolicyDetail.vue'),
    meta: { title: '优惠政策详情' }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, title: '管理后台' },
    children: [
      {
        path: '',
        redirect: '/admin/home'
      },
      {
        path: 'home',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '控制面板' }
      },
      {
        path: 'carousel',
        name: 'AdminCarousel',
        component: () => import('@/views/admin/Carousel.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: 'policy',
        name: 'AdminPolicy',
        component: () => import(/* webpackChunkName: "admin-policy" */ '@/views/admin/Policy.vue'),
        meta: { title: '优惠政策管理' }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import(/* webpackChunkName: "admin-products" */ '@/views/admin/Products.vue'),
        meta: { title: '热销产品管理' }
      },
      {
        path: 'about',
        name: 'AdminAbout',
        component: () => import('@/views/admin/About.vue'),
        meta: { title: '关于我们管理' }
      },
      {
        path: 'contact',
        name: 'AdminContact',
        component: () => import('@/views/admin/Contact.vue'),
        meta: { title: '联系我们管理' }
      },
      {
        path: 'password',
        name: 'AdminPassword',
        component: () => import('@/views/admin/Password.vue'),
        meta: { title: '密码修改' }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/CategoryManagement.vue'),
        meta: { title: '产品分类管理' }
      },
      // API测试页面
      {
        path: 'api-test',
        name: 'ApiTest',
        component: () => import('@/views/ApiTest.vue'),
        meta: { title: 'API接口测试' }
      }
    ]
  },
  // 保留一个不需要登录权限的API测试页面路由，方便直接测试
  {
    path: '/api-test',
    redirect: '/admin/api-test'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 公司门户网站` : '公司门户网站'
  
  // 检查是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('adminToken')
    if (!isLoggedIn) {
      // 未登录，重定向到登录页
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录，允许访问
      next()
    }
  } else if (to.path === '/admin/login') {
    // 如果已登录且访问登录页面，则重定向到管理后台首页
    const isLoggedIn = localStorage.getItem('adminToken')
    if (isLoggedIn) {
      next({ path: '/admin/home' })
    } else {
      next()
    }
  } else {
    // 不需要登录权限的页面，直接访问
    next()
  }
})

export default router 