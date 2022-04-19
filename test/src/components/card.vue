<template>
<div class="card">
  <div class="card-body">
    <h5 class="card-title">{{title}}</h5>
    <p class="card-text">{{filter(content)}}</p>
    <button @click="$router.push('./content/'+_id)" class="btn btn-outline-primary" :class={left:isAuthor}>Check details</button>
    <button v-if="isAuthor" type="button" class="btn btn-outline-success" :class={right:isAuthor} @click="deleteArticle">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"></path>
      </svg>
    </button>
  </div>
</div>
</template>

<script>
export default {
    props:['isAuthor', 'title', 'content', '_id'],
    methods:{
      filter:(origin)=>{
        if(origin.length>=20)return origin.slice(0,17)+"..."
        else return origin
      },
      deleteArticle:async function(){
        const result = await (await fetch('/api/authenticated/article', {
              body: JSON.stringify({_id:this._id}), // must match 'Content-Type' header
              cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
              credentials: 'same-origin', // include, same-origin, *omit
              headers: {
              'user-agent': 'Mozilla/4.0 MDN Example',
              'content-type': 'application/json'
              },
              method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
              mode: 'cors', // no-cors, cors, *same-origin
              redirect: 'follow', // manual, *follow, error
              referrer: 'no-referrer', // *client, no-referrer
        })).json()
        if(result.status==="successcully delete article")this.$emit('deleted');
      }
    }
}
</script>

<style scoped>
.left{margin-right: 2px;}
.right{margin-left:2px;}
</style>