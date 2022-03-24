<template>
  <navbar @logout="logout"></navbar>
  <div class = "container">
    <router-view @login="checkLogin"></router-view>
  </div>
</template>

<script>
import Navbar from './components/NavBar.vue'
import {ref, provide, computed, onMounted} from 'vue';
import store from "./store"
const isLogin=ref(false);
const userName=ref('');
const isLoginComputed=computed(()=>isLogin);
const userNameComputed=computed(()=>userName);
const checkLogin=async()=>{
  try{
    const fetchResult=await fetch('api/authenticated');
    const fetchedJson=await fetchResult.json();
    isLogin.value='login by session'=== fetchedJson.status;
    userName.value=fetchedJson.userName;
  }catch(e){
    console.log(e);
  }
}
//import axios from 'axios';
const logout = async() => {
  try{
    const fetchResult=await fetch('api/authenticated/logout');
    if('logout sucess'===(await fetchResult.json()).status){
      isLogin.value=false;
    }
  }catch(e){
    console.log(e);
  }
}
export default{
  name:"app",
  components:{
    Navbar
  },
  setup(){
    provide(store.isLogin, isLoginComputed.value);
    provide(store.userName, userNameComputed.value);
    onMounted(checkLogin);
    return {
      logout,
      checkLogin
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
