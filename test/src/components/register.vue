<template>
<section class="vh-100" style="background-color: #eee;">
  <div class="container h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-lg-12 col-xl-11">
        <div class="card text-black" style="border-radius: 25px;">
          <div class="card-body p-md-5">
            <div class="row justify-content-center">
              <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>

                <form class="mx-1 mx-md-4">

                  <div class="d-flex flex-row align-items-center mb-4">
                    <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                    <div class="form-outline flex-fill mb-0">
                      <input type="text" id="form3Example1c" v-model="userName" class="form-control" />
                      <label class="form-label" for="form3Example1c">Your Name</label>
                    </div>
                  </div>

                  <div class="d-flex flex-row align-items-center mb-4">
                    <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                    <div class="form-outline flex-fill mb-0">
                      <input type="password" id="form3Example4c" v-model="password" class="form-control" />
                      <label class="form-label" for="form3Example4c">Password</label>
                    </div>
                  </div>

                  <div class="d-flex flex-row align-items-center mb-4">
                    <i class="fas fa-key fa-lg me-3 fa-fw"></i>
                    <div class="form-outline flex-fill mb-0">
                      <input type="password" id="form3Example4cd" v-model="repeatedPassword" class="form-control" />
                      <label class="form-label" for="form3Example4cd">Repeat your password</label>
                    </div>
                  </div>

                  <div class="form-check d-flex justify-content-center mb-5">
                    <input
                      class="form-check-input me-2"
                      type="checkbox"
                      v-model="remember"
                      id="form2Example3c"
                    />
                    <label class="form-check-label" for="form2Example3">
                      Remember the account
                    </label>
                  </div>

                  <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <button type="button" class="btn btn-primary btn-lg" @click="register">Register</button>
                  </div>

                </form>

              </div>
              <!-- <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">

                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp" class="img-fluid" alt="Sample image">

              </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script>
import store from '../store'
import {inject, watchEffect, ref} from 'vue'
import {useRouter} from 'vue-router'
const userName=ref('');
const password=ref('');
const remember=ref(false);
const repeatedPassword=ref('');
export default {
    setup(props, {emit}){
        const isLogin=inject(store.isLogin);
        const router=useRouter();
        const register=async()=>{
          if(password.value!==repeatedPassword.value)return;
          const postResult=await fetch('api/authenticated/register', {
              body: JSON.stringify({userName:userName.value, password:password.value, remember:remember}), // must match 'Content-Type' header
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
          });
          const status=(await postResult.json()).status;
          if(status==='login')emit('login');
        }
        watchEffect(()=>{
            if(isLogin.value){
                router.push('/');
            }
        })
        return {
            register,
            userName,
            password,
            remember,
            repeatedPassword
        }
    }
}
</script>

<style>

</style>