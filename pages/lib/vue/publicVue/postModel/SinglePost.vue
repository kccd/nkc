<template lang="pug">
.single-post-info
  .post-checkbox.checkbox
    label
      input(type="checkbox" :data-pid="post.pid")
  .post-time
    span {{fromNow(post.time)}}
  .post-type(v-if="post.postType === 'postToForum'") {{post.anonymous?"匿名":""}}发表文章
  a(:href="`/t/${post.tid}`" v-if="post.postType === 'postToForum'").post-title {{post.title}}
  .post-type(v-else) 在文章
    
  a(:href="`/t/${post.tid}`" v-else).post-title {{post.title}}
  .post-type(v-else) 下{{post.anonymous?"匿名":""}}发表
    span(v-if="post.parentPostId") 评论
    span(v-else) 回复

  a(:href="post.link" v-if="post.postType === 'postToThread'").single-post-count {{post.abstract || post.content}}
  .post-content-body(v-else)
    .post-cover
      .post-cover-img(:style="`background-image: url(${getUrl('postCover', post.cover)})`")
    .post-content
      a(:href="post.link").single-post-content {{post.abstract || post.content}}
</template>
<style lang="less">
  @import "../../../../publicModules/base";
  .single-post-info>*{
    display: inline;
  }
  .post-time{
    color: #e85a71;
    font-size: 1.2rem;
    font-weight: 700;
  }
  .post-type{
    font-size: 1.2rem;
    color: #555;
  }
  .post-title{
    font-size: 1.2rem;
    font-weight: 700;
    padding-left: 0.5rem;
  }
  .single-post-item {
    display: inline;
  }
  .post-title:hover, .post-title:active, .post-title:link , .post-title:visited{
    text-decoration: none;
    color: #2b90d9;
  }
  .post-title:hover{
    color: #282c37;
  }
  .post-cover{
    width: 8rem;
  }
  .post-cover-img{
    background-size: cover;
    margin-top: 0.5rem;
    height: 5rem;
    border-radius: 3px;
    margin-right: 1rem;
    width: 7rem;
  }
  .post-content-body>*{
    display: table-cell;
  }
  .post-content .single-post-content{
    word-break: break-all;
  }
</style>
<script>
import {fromNow, getUrl} from "../../../js/tools";
export default {
  props: ['post'],
  data: () => ({
  }),
  mounted() {
  },
  methods: {
    getUrl: getUrl,
    fromNow: fromNow
  }
}
</script>
