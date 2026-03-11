import Home from '@/views/Home.vue'
import Profile from '@/views/Profile.vue'
import Game from '@/views/Game.vue'
import Join from '@/views/Join.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/home', name:'home', component: Home},
    {path:'/', name:'root', redirect: "/home"},
    {path:'/profile', name:'profile', component: Profile},
    {path:'/join', name:'join', component: Join},
    {path:'/games/:id', name:'game', component: Game},
  ],
})

export default router