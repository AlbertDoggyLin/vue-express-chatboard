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
export default {
    props:["isLogin"],
    data(){
        return {
            content:'',title:''
        }
    },
    watch:{
        isLogin:{
            handler:function(){
                setTimeout(() => {
                    if(!this.isLogin){
                        alert('isLogin==false')
                        this.$router.push('/')
                    }
                }, 100);
            },
            immediate:true
        }
    },
    methods:{
        submit:async function(){
            const postResult = await (await fetch('api/authenticated/post', {
                body: JSON.stringify({title:this.title, content:this.content}), // must match 'Content-Type' header
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
                this.$router.push('/')
            }
            else{
                console.log('success');
                this.$router.push('/')
            }
        }
    }
}
</script>
<style scoped>
.btn{
    margin-top:5px;
}

</style>