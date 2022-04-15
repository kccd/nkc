<template lang="pug">
  .user-column-thread
    .user-column-box
      .user-column-head
        .user-column-avatar
          img(:src="headerData && headerData.user.avatar" :style="`background-color: ${ headerData && headerData.user.color}`")
        .user-column-content
          a(:href="headerData && headerData.user.homeUrl" target="_blank").user-column-username {{headerData && headerData.user.name}}
          span.user-column-from {{headerData && headerData.from}}
          .user-column-time-sm
            span(
              data-type="nkcTimestamp"
              :data-time="(new Date('2022-03-30T03:24:56.568Z')).getTime()"
              data-time-type='fromNow'
              :title="timeFormat('2022-03-30T03:24:56.568Z')"
            ) {{this.fromNow("2022-03-30T03:24:56.568Z")}}
      .user-column-body
        .user-column-title
          .user-column-avatar
            img(:src="headerData && headerData.user.avatar" :style="`background-color: ${ headerData && headerData.user.color}`")
          .user-column-content
            a.user-column-username {{headerData && headerData.user.username}}
            span(
              data-type="nkcTimestamp"
              :data-time="(new Date('2022-03-30T03:24:56.568Z')).getTime()"
              data-time-type='fromNow'
              :title="timeFormat('2022-03-30T03:24:56.568Z')"
            ) {{this.fromNow("2022-03-30T03:24:56.568Z")}}
        .user-column-content
          a(target="_blank").user-column-content-title title
          .user-column-content-container
            a(target="_blank").user-column-content-abstract dsdvadvhvvuavavjavhvsjvasdvaduiolkjsjlaklkfjjfjeiskdkkajfaskfjak
            .user-column-content-cover
    .user-column-box
      .user-column-head
        .user-column-avatar
          img()
        .user-column-content
          a.user-column-username 专栏名称
          span.user-column-from 添加文章
          .user-column-time-sm
            span(
              data-type="nkcTimestamp"
              :data-time="(new Date('2022-03-30T03:24:56.568Z')).getTime()"
              data-time-type='fromNow'
              :title="timeFormat('2022-03-30T03:24:56.568Z')"
            ) {{this.fromNow("2022-03-30T03:24:56.568Z")}}
      .user-column-body
        .user-column-title
          .user-column-avatar
            img()
          .user-column-content
            a.user-column-username 专栏名称
            span(
              data-type="nkcTimestamp"
              :data-time="(new Date('2022-03-30T03:24:56.568Z')).getTime()"
              data-time-type='fromNow'
              :title="timeFormat('2022-03-30T03:24:56.568Z')"
            ) {{this.fromNow("2022-03-30T03:24:56.568Z")}}
        .user-column-content
          a(target="_blank").user-column-content-title title
          .user-column-content-container
            a(target="_blank").user-column-content-abstract dsdvadvhvvuavavjavhvsjvasdvaduiolkjsjlaklkfjjfjeiskdkkajfaskfjak
            .user-column-content-cover
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
.user-column-head{
  padding-left: 3.3rem;
  min-height: 2.8rem;
  position: relative;
  margin-bottom: 0.5rem;
  .user-column-avatar{
    background: #00a0e9;
    position: absolute;
    height: 2.8rem;
    width: 2.8rem;
    top: 2px;
    left: 0;
  }
  .user-column-username{
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.2rem;
    color: #2b90d9;
  }
  .user-column-from{
    color: #000;
    font-size: 1.2rem;
  }
  .user-column-time-sm{
    font-size: 1rem;
    color: #000;
  }
}
.user-column-body{
  padding: 0.7rem 1rem 0.4rem 1rem;
  border-radius: 5px;
  background-color: #f6f2ee;
  border: 2px solid #eae6e2;
  margin-bottom: 0.6rem;
  .user-column-title{
    padding-left: 2.1rem;
    position: relative;
    margin-bottom: 0.5rem;
    .user-column-avatar{
      background: #b5b5b5;
      position: absolute;
      height: 1.6rem;
      width: 1.6rem;
      top: 2px;
      left: 0;
    }
    .user-column-username{
      display: inline-block;
      margin-right: 0.5rem;
      font-size: 1.2rem;
      color: #2b90d9;
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
      font-weight: 700;
      color: #000;
      text-decoration: none;
      transition: border-bottom 200ms;
      border-bottom: 1px solid transparent;
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
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }
      .user-column-content-cover{
        background: #00a0e9;
        height: 5.2rem;
        width: 8rem;
        background-size: cover;
        position: absolute;
        top: 0;
        right: 0;
        border-radius: 3px;
      }
    }
  }
}
</style>
<script>
import {nkcAPI} from "../../../../../lib/js/netAPI";
import {timeFormat,fromNow} from "../../../../../lib/js/tools";
export default {
  data: () => ({
    uid: '',
    threads: '',
    loading: false,
    headerData:null,
  }),
  mounted() {
    this.initData();
    this.getColumnThreads();
  },
  methods: {
    timeFormat:timeFormat,
    fromNow:fromNow,
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
