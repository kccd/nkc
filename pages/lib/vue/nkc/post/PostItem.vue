<template>
  <div class="panel panel-default" :style="`border-right: 10px solid ${post.borderColor};`">
    <div class="panel-heading flex flex-wrap items-center gap-x-4">
      <div>
        {{ detailedTime(post.toc) }} 
      </div>
      <div>
        回复
        <span class="text-danger" v-if="post.status === 'disabled'">（已屏蔽）</span>
        <span class="text-warning" v-else-if="post.status === 'toDraft'">（已退修）</span>
      </div>
      <div class="flex items-center">
        <img :src="getUrl('userAvatar', post.user.avatar)" :alt="post.user.username" class="h-8 w-8 rounded-full inline-block mr-2 align-middle">
        <a :href="getUrl('userHome', post.user.uid)" target="_blank">
          {{ post.user.username }}  
        </a>
      </div>
      <div>
        <div v-for="forum in post.forums" :key="forum.fid">
          <a :href="getUrl('forumHome', forum.fid)" target="_blank">{{ forum.displayName }}</a>
        </div>
      </div>
      
      <div>
        <a :href="post.url" target="_blank">查看原文</a>
      </div>
      <div>
        <button class="btn btn-xs btn-danger" @click="deletePost(post.pid)">退修/删除</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="panel-body flex flex-col gap-y-4">
        <div>
          所属文章：
          <a :href="getUrl('thread', post.thread.tid)">《{{ post.thread.t }}》</a>
        </div>
        <div class="flex justify-center font-bold text-2xl" v-if="post.t">{{ post.t }}</div>
        <div v-html="post.c" />
      </div>
    </div>
  </div>
</template>

<script>
import { detailedTime } from '../../../js/time';
import { getUrl } from '../../../js/tools';
export default {
  props: ['post'],
  data() {
    return {}
  },
  mounted() {
    //
  },
  methods: {
    detailedTime,
    getUrl,
    deletePost() {
      this.$emit('delete-post', this.post.pid);
    },
  },
}
</script>