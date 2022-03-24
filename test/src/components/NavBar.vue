<template>
<!--<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Alberto</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link class="nav-link active" aria-current="page" to="/home">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :class={disabled:!disabled} to="/post" tabindex="-1" :aria-disabled="!disabled">Post</router-link>
        </li>
      </ul>
      <form class="d-flex">
        <template v-if="!disabled">
          <button class="btn btn-outline-info" @click="$router.push('/login')">Login</button>
          <button class="btn btn-outline-success" @click="$router.push('/register')">Register</button>
        </template>
        <button v-else class="btn btn-outline-success" @click="$emit('logout')">Logout</button>
      </form>
    </div>
  </div>
</nav>-->
  <nav class="bg-gray-800">
  <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
    <div class="relative flex items-center justify-between h-16">
      <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
        <div class="hidden sm:block sm:ml-6">
          <div class="flex space-x-4">
            <router-link class="bg-gray-900 text-white px-3 py-2 rounded-md font-medium" aria-current="page" to="/home">Home</router-link>
            <router-link v-if="disabled" class="bg-gray-900 text-white px-3 py-2 rounded-md  font-medium" to="/post" tabindex="-1">Post</router-link>
          </div>
        </div>
      </div>
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        <template v-if="!disabled">
          <button class="bg-gray-900 text-white block px-3 py-2 rounded-md font-medium" @click="$router.push('/login')">Login</button>
          <button class="bg-gray-900 text-white block px-3 py-2 rounded-md font-medium" @click="$router.push('/register')">Register</button>
        </template>
        <button v-else class="bg-gray-900 text-white block px-3 py-2 rounded-md font-medium" @click="$emit('logout')">Logout</button>

      </div>
    </div>
  </div>\
</nav>
</template>

<script>
import {inject} from 'vue';
import store from '../store'
export default {
  setup(){
    const disabled=inject(store.isLogin);
    return{
      disabled
    }
  }
}
</script>

<style scoped>
.btn-outline-info{
  margin-right: 4px;
}
</style>