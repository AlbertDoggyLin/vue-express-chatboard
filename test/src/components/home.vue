<template>
<div>
  <card v-for="(block, index) in content" :key="block._id" :is-author="isAuthor(block.author)" v-bind="block" @deleted="content.splice(index, 1)"></card>
</div>
</template>

<script>
import card from './card.vue'
export default {
  name: 'home',
  props:['userName', 'isLogin'],
  components:{
    card
  },
  data(){
    return {content:[]}
  },
  methods:{
    isAuthor:function(author){
      if(this.isLogin && this.userName===author)return true;
      return false
    }
  },
  watch:{
    content:{
      handler:async function(){
        const tempResult = await (await fetch('api/public')).json();
        if(tempResult.status === "fetch successful"){
          this.content = tempResult.data
        }
      },
      immediate:true
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
