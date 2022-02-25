<template>
<main class="form-signin">
<img class="mb-4" src="../assets/logo.png" alt="" width="72" height="72">
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
import{inject, ref, watchEffect} from 'vue';
import { useRouter } from "vue-router";
import store from '../store'
const userName=ref('')
const password=ref('')
const remember=ref(false)
export default {
    setup(porps, {emit}){
        const router=useRouter();
        const isLogin=inject(store.isLogin);
        watchEffect(()=>{
            if(isLogin.value)router.push('/');
        })
        const loginClicked=async ()=>{
            try{
                const fetchResult=await fetch('api/authenticated/login', {
                        body: JSON.stringify({userName:userName.value, password:password.value, remember:remember.value}), // must match 'Content-Type' header
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
                    router.push('/');
                    emit('login')
                }
            }catch(e){
                console.log(e);
            }
        }
        return {
            loginClicked,
            password,
            remember,
            userName
        }
    }
}
</script>

<style>

</style>