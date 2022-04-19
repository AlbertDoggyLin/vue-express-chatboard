<template>
<main class="form-signin">
<h1 class="h3 mb-3 fw-normal">Please sign in</h1>

<div class="form-floating">
    <input type="text" class="form-control" id="floatingInput" v-model="userName" placeholder="name@example.com">
    <label for="floatingInput">User Name</label>
</div>
<div class="form-floating">
    <input type="password" class="form-control" id="floatingPassword" v-model="password" placeholder="Password">
    <label for="floatingPassword">Password</label>
</div>

<div class="checkbox mb-3">
    <label>
    <input type="checkbox" v-model="remember" value="remember-me"> Remember me
    </label>
</div>
<button class="w-100 btn btn-lg btn-primary" @click.prevent="loginClicked">Sign in</button>
</main>
</template>

<script>
export default {
    props:["isLogin"],
    data(){
        return {
            userName:'',password:'',remember:false
        }
    },
    watch:{
        isLogin:{
            handler:function(){
                if(this.isLogin)this.$router.push('/');
            },
            immediate:true
        }
    },
    methods:{
        loginClicked:async function(){
            try{
                const fetchResult=await fetch('api/authenticated/login', {
                        body: JSON.stringify({userName:this.userName, password:this.password, remember:this.remember}), // must match 'Content-Type' header
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, same-origin, *omit
                        headers: {
                        'user-agent': 'Mozilla/4.0 MDN Example',
                        'content-type': 'application/json'
                        },
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        mode: 'cors', // no-cors, cors, *same-origin
                        redirect: 'follow', // manual, *follow, error
                        referrer: 'no-referrer', // *client, no-referrer
                    }
                );
                const status=(await fetchResult.json()).status
                if('login'===status){
                    this.$router.push('/');
                    this.$emit('login')
                }
            }catch(e){
                console.log(e);
            }
        }
    }
}
</script>

<style>

</style>