<template lang="pug">
.single-post
  .single-post-info
    .post-time
      span {{fromNow(post.time)}}
    .single-post-item(v-if="post.postType === 'postToForum'")
      .post-type {{post.anonymous?"匿名":""}}发表文章
      a(:href="`/t/${post.tid}`").post-title {{post.title}}
    .single-post-item(v-else)
      .post-type 在文章
      a(:href="`/t/${post.tid}`").post-title {{post.title}}
      .post-type 下{{post.anonymous?"匿名":""}}发表
        span(v-if="post.parentPostId") 评论
        span(v-else) 回复

  a.single-post-content(:href="post.link" v-if="post.postType === 'postToThread'") {{post.abstract || post.content}}
  .post-content-body(v-else)
    .post-cover
      .post-cover-img(:style="`background-image: url('${getUrl('postCover', post.cover)}')`")
    .post-content
      a(:href="post.link").single-post-content {{post.abstract || post.content}}
  .operations(v-if="type === 'creation'" )
    .single-post-bottom-item(
      data-global-click='showSharePanel'
      :data-global-data="objToStr({type: post.editType, id: getShareId})"
      title='分享'
    )
      .fa.fa-share-square-o.share-icon &nbsp;分享
    .option(v-if='post.edit !== null' @click='visitUrl(`/editor?ver=ue&type=${getEditType}&id=` + post.pid, true)')
      .fa.fa-edit
      span &nbsp;编辑
</template>
<style lang="less" scoped>
  @import "../../../../publicModules/base";
  .operations{
    color: #404040;
  }
  .single-post {
    display: inline-block;
    .single-post-info > * {
      display: inline;
    }

    .post-time {
      color: #e85a71;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .post-type {
      font-size: 1.2rem;
      color: #555;
    }

    .post-title {
      font-size: 1.2rem;
      font-weight: 700;
      padding-left: 0.5rem;
    }

    .single-post-item > * {
      display: inline;
    }

    .post-title:hover, .post-title:active, .post-title:link, .post-title:visited {
      text-decoration: none;
      color: #2b90d9;
    }

    .post-title:hover {
      color: #282c37;
    }

    .post-cover {
      width: 8rem;
    }

    .post-cover-img {
      background-size: cover;
      margin-top: 0.5rem;
      height: 5rem;
      border-radius: 3px;
      margin-right: 1rem;
      width: 7rem;
    }

    .post-content-body > * {
      display: table-cell;
    }

    .post-content {
      vertical-align: top;
    }

    .post-content .single-post-content {
      word-break: break-all;
    }

    .single-post-content {
      margin: 0.5rem 0;
      border-radius: 3px;
      max-height: 5rem;
      font-size: 1.2rem;
      font-weight: 700;
      /*background-color: #d9e1e8;*/
      display: inline-block;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      word-break: break-word;
    }
    .single-post-content:hover, .single-post-content:link, .single-post-content:active, .single-post-content:visited {
      text-decoration: none;
      color: #282c37;
    }
  }
</style>
<script>
import {fromNow, getUrl, objToStr} from "../../../js/tools";
export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    }
  },
  data: () => ({
  }),
  mounted() {
  },
  computed: {
    getShareId() {
      const { editType, tid, pid } = this.post;
      const typeMapId= {
        "post": pid,
        "thread": tid,
      }
      return typeMapId[editType]
    },
    getEditType() {
      const { editType, isComment } = this.post;
          if (editType === 'thread') {
           return  'modifyThread'
          } else if (editType === 'post' && isComment) {
            return  'modifyComment'
          } else if (editType === 'post' && !isComment) {
            return  'modifyPost'
          }
          return undefined
        }
    },
  methods: {
    objToStr: objToStr,
    visitUrl: NKC.methods.visitUrl,
    getUrl: getUrl,
    fromNow: fromNow,
  }
}
</script>
<style scoped>
.operations > div {
  margin-right: 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  display: inline-block;
}
</style>
