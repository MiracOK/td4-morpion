import Home from '@/views/Home.vue'
import Profile from '@/views/Profile.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/home', name:'home', component: Home},
    {path:'/', name:'root', redirect: "/home"},
    {path:'/profile', name:'profile', component: Profile},
  ],
})

export default router