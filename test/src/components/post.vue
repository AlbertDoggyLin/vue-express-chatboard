<template>
<form class="postform">
  <div class="form-group">
    <label for="exampleFormControlInput1">Article Title</label>
    <input type="text" class="form-control" v-model="title">
  </div>
  <div class="form-group">
    <label for="exampleFormControlTextarea1">Content</label>
    <textarea class="form-control" rows="15" v-model="content"></textarea>
  </div>
  <button @click.prevent="submit" class="btn btn-outline-primary">Submit</button>
</form>
</template>

<script>
import {inject, ref, watchEffect} from 'vue';
import store from '../store';
import { useRouter } from 'vue-router';
const content=ref('');
const title=ref('');
export default {
    setup(){
        const isLogin=inject(store.isLogin);
        const router=useRouter();
        watchEffect(()=>{
            setTimeout(() => {
                if(!isLogin.value){
                    alert('isLogin==false')
                    router.push('/')
                }
            }, 100);
        }) 
        const submit=async()=>{
            const postResult = await (await fetch('api/authenticated/post', {
                body: JSON.stringify({title:title.value, content:content.value}), // must match 'Content-Type' header
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, same-origin, *omit
                headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
                },
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // *client, no-referrer}) 
            })).json();
            if(postResult.status==="not login yet"){
                console.log('not login yet');
                router.push('/')
            }
            else{
                console.log('success');
                router.push('/')
            }
        }
        return {
            content, title, submit
        }
    }
}
</script>
<style scoped>
.btn{
    margin-top:5px;
}

</style>