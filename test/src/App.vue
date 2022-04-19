<template>
  <navbar :isLogin='isLogin' @logout="logout"></navbar>
  <div class = "container">
    <router-view @login="checkLogin" :isLogin='isLogin' :userName="userName"></router-view>
  </div>
</template>

<script>
import Navbar from './components/NavBar.vue'
export default{
  name:"app",
  components:{
    Navbar
  },
  data(){
    return {isLogin:false,userName:''}
  },
  methods:{
    logout:async() => {
      try{
        const fetchResult=await fetch('api/authenticated/logout');
        if('logout sucess'===(await fetchResult.json()).status){
          this.isLogin=false;
        }
      }catch(e){
        console.log(e);
      }
    },
    checkLogin:async function(){
      try{
        const fetchResult=await fetch('api/authenticated');
        const fetchedJson=await fetchResult.json();
        this.isLogin='login by session'=== fetchedJson.status;
        this.userName=fetchedJson.userName;
      }catch(e){
        console.log(e);
      }
    }
  },
  mounted(){
    try{
      this.checkLogin();
    }catch(e){console.log(e)}
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
