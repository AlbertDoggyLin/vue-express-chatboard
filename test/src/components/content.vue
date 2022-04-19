<template>
<div v-if="ready" class="container mt-5">
<div class="row">
    <div class="col-lg-8">
        <!-- Post content-->
        <article>
            <!-- Post header-->
            <header class="mb-4">
                <!-- Post title-->
                <h1 class="fw-bolder mb-1">{{fetchedData.title}}</h1>
                <div class="text-muted fst-italic mb-2">Posted on January 1, 2021 by {{fetchedData.author}}</div>
            </header>
            <!-- Post content-->
            <section class="mb-5">
                <p class="fs-5 mb-4">{{fetchedData.content}}</p>
            </section>
        </article>
        <!-- Comments section-->
        <section v-if="isLogin" class="mb-5">
            <div class="card bg-light">
                <div class="card-body">
                    <!-- Comment form-->
                    <form class="mb-4">
                        <textarea class="form-control" v-model="comment" rows="3" placeholder="Join the discussion and leave a comment!"></textarea>
                        <button class="btn btn-outline-primary" @click.prevent="submitComment">Submit</button>
                    </form>
                    <!-- Single comment-->
                    <div class="d-flex" v-for="comment in fetchedData.discussion" :key="comment._id">
                        <div class="flex-shrink-0"><img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..."></div>
                        <div class="ms-3">
                            <div>
                                <div class="fw-bold inline-block">{{comment.userName}}</div>
                                <button v-if="isAuthor(comment.userName)" type="button" style="line-height:0;padding: 3px 3px;font-size: 20px;" class="btn btn-outline-success inline-block" :class={right:isAuthor} @click="deleteComment(comment._id)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"></path>
                                    </svg>
                                </button>
                            </div>
                            {{comment.content}}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section v-else class="mb-5">
            <div class="card bg-light">
                <div class="card-body">
                    <!-- Comment form-->
                    <form class="mb-4">
                        <button class="btn btn-outline-primary" @click.prevent="$router.push('/login')">Login to leave comment</button>
                    </form>
                    <!-- Single comment-->
                    <div class="d-flex" v-for="comment in fetchedData.discussion" :key="comment._id">
                        <div class="flex-shrink-0"><img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..."></div>
                        <div class="ms-3">
                            <div class="fw-bold">{{comment.userName}}</div>
                            {{comment.content}}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>
</div>
</template>

<script>
export default {
    props:['contentCode','userName', 'isLogin'],
    data(){
        return {
            ready:false,
            comment:'',
            fetchedData:{}
        }
    },
    methods:{
        isAuthor(name){return this.isLogin&&name===this.userName},
        deleteComment:async(index)=>{
            const deleteResponse = await (await fetch('api/authenticated/comment', {
                body: JSON.stringify({_id:this.contentCode, index}), // must match 'Content-Type' header
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
            })).json();
            if(deleteResponse.status==="successcully delete comment"){
                const discussion = this.fetchedData.discussion;
                discussion.splice(discussion.indexOf(discussion.find(e=>e._id===index)), 1);
            }
        },
        submitComment:async  function(){
            const commentResponseJson = await (await fetch('api/authenticated/comment', {
                body: JSON.stringify({_id:this.contentCode, content:this.comment}), // must match 'Content-Type' header
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
            })).json()
            if(commentResponseJson.status==="comment successful"){
                this.fetchedData.discussion.push({userName:this.userName, content:this.comment, _id:commentResponseJson._id})
                this.comment='';
            }
        }
    },
    watch:{
        fetchedData:{
            handler:async function(){
                this.fetchedData = await (await fetch('api/public/', {
                    body: JSON.stringify({_id:this.contentCode}), // must match 'Content-Type' header
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
                })).json()
                if(this.fetchedData.status === "fetch successful"){
                    this.fetchedData=this.fetchedData.article;
                    this.ready=true;
                }
            },
            immediate:true
        }
    }
}
</script>

<style scoped>
.btn{
    margin:5px;
}
.ms-3{
    text-align: left;
}
.inline-block{
    display: inline-block;
}
</style>