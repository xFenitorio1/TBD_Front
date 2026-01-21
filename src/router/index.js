
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProductsView from '../views/ProductsView.vue'
import InventoryView from '../views/InventoryView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import ReportsView from '../views/ReportsView.vue'
import UsersView from '../views/UsersView.vue'
import RegisterView from '../views/RegisterView.vue'
import { ROLES } from '../composables/useRoleUtils'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, meta: { requiresAuth: false } },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/products', component: ProductsView, meta: { requiresAuth: true } },
  { path: '/inventory', component: InventoryView, meta: { requiresAuth: true } },
  { path: '/transactions', component: TransactionsView, meta: { requiresAuth: true } },
  { path: '/reports', component: ReportsView, meta: { requiresAuth: true } },
  { path: '/users', component: UsersView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/register', component: RegisterView, meta: { requiresAuth: false } },
  { path: '/logistics', component: () => import('../views/LogisticsView.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user')
  const user = isAuthenticated ? JSON.parse(isAuthenticated) : null

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  }
  else if (to.meta.requiresAdmin) {
    const role = user?.role
    const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    if (!allowedRoles.includes(role)) {
      next('/dashboard')
    } else {
      next()
    }
  }
  else {
    next()
  }
})

export default router
