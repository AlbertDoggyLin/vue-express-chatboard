<template>
<div>
  <card v-for="(block, index) in content" :key="block._id" :is-author="isAuthor(block.author)" v-bind="block" @deleted="content.splice(index, 1)"></card>
</div>
</template>

<script>
import card from './card.vue'
import {ref, watchEffect, inject} from 'vue'
import store from '../store'
const content=ref([]);
export default {
  name: 'home',
  props:['contentCode'],
  components:{
    card
  },
  setup(){
    const userName=inject(store.userName);
    const isLogin=inject(store.isLogin);
    const isAuthor=(author)=>{
      if(isLogin.value && userName.value===author)return true;
      return false
    }
    watchEffect(async()=>{
      const tempResult = await (await fetch('api/public')).json();
      if(tempResult.status === "fetch successful"){
        content.value = tempResult.data
      }
    })
    return {
      content,
      isAuthor
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card{
  margin:2rem;
  width: 20rem;
  display: inline-block;
}
</style>
