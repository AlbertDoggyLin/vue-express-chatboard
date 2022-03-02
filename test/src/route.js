import {createRouter, createWebHistory} from 'vue-router'
import home from './components/home.vue';
import NotFound from './components/NotFound.vue';
import login from './components/login.vue';
import register from './components/register.vue';
import content from './components/content.vue';
import game from './components/game.vue';
import post from './components/post.vue';
export const router=createRouter({
    history:createWebHistory(),
    routes:[
        {path:'/post', component:post},
        {path:'/game', component:game},
        {path:'/login', component:login},
        {path:'/register', component:register},
        {path:'/', component:home, alias:'/home/',props:true},
        {path:'/:contentCode([0-9, a-f]*)?', component:content, alias:'/home/:contentCode([0-9, a-f]*)?',props:true},
        {path:'/:pathMatch(.*)?', name:'NotFound', props:true, component:NotFound}
    ],
})