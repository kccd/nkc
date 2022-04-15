<template lang="pug">
  .user-column-thread
    .user-column-box(v-for="item in threads" )
      .user-column-body
        .user-column-title
          .user-column-content
            a.user-column-name(:href="item.homeUrl" target="_blank") {{item.threadName}}
            span(
              data-type="nkcTimestamp"
              :data-time="(new Date(item.toc)).getTime()"
              data-time-type='fromNow'
              :title="timeFormat(item.toc)"
            ) {{fromNow(item.toc)}}
        .user-column-content
          a(:href="item.url" target="_blank").user-column-content-title {{item.document && item.document.title}}
          .user-column-content-container
            a(:href="item.url" target="_blank").user-column-content-abstract {{item.document && item.document.content}}
            .user-column-content-cover
              img(:src="getUrl('userAvatar', item.user && item.user.avatar)")
</template>
<style lang="less">
.user-column-thread{
  padding: 0 15px;
  a{
    cursor: pointer;
  }
  .user-column-box{
    margin-bottom: 2rem;
  }
}
.user-column-body{
  padding: 0.7rem 1rem 0.4rem 1rem;
  border-radius: 5px;
  background-color: #f6f2ee;
  border: 2px solid #eae6e2;
  margin-bottom: 0.6rem;
  .user-column-title{
    .user-column-name{
      color: #000;
      margin-right: 0.5rem;
    }
  }
    .user-column-time-sm{
      font-size: 1rem;
      color: #000;
    }
  }
  .user-column-content{
    margin-bottom: 0.6rem;
    .user-column-content-title{
      font-size: 1.5rem;
      color: #000;
      font-weight: 700;
      margin-right: 1rem;
      word-break: break-all;
      text-decoration: none;
      border-bottom: rgba(0, 0, 0, 0) solid 1px;
      &:hover{
        border-bottom: 1px solid #000;
      }
    }
    .user-column-content-container{
      position: relative;
      margin-top: 0.3rem;
      .user-column-content-abstract{
        height: 5.2rem;
        font-size: 1.25rem;
        text-decoration: none;
        color: #000;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        padding-right: 10rem;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }
      .user-column-content-cover{
        background: #00a0e9;
        position: absolute;
        top: -2.5rem;
        right: 0;
        border-radius: 3px;
        img{
          height: 7.5rem;
          width: 9.5rem;
          border-radius: 3px;
          background-size: cover;
        }
      }
    }
  }
</style>
<script>
import {nkcAPI} from "../../../../../lib/js/netAPI";
import {timeFormat, fromNow, getUrl} from "../../../../../lib/js/tools";
export default {
  data: () => ({
    uid: '',
    loading: false,
    threads:null,
  }),
  mounted() {
    this.initData();
    this.getColumnThreads();
  },
  methods: {
    timeFormat:timeFormat,
    fromNow:fromNow,
    getUrl: getUrl,
    //获取基本数据
    initData() {
     const {uid} = this.$route.params;
     this.uid = uid;
    },
    //获取用户在专栏下发表的文章
    getColumnThreads(page) {
     this.loading = true;
     const self = this;
     nkcAPI(`/u/${self.uid}/p/column`, "GET")
     .then(res => {
        self.threads = res.threads;
        self.paging = res.paging;
     })
     .catch(err => {
       sweetError(err);
     })
     this.loading = false;
    }
  }
}
</script>
