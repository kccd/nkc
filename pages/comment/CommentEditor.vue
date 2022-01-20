<template lang="pug">
  div
    .m-b-05(v-if="quote")
      .quote
        .quote-cancel(@click="clearQuote") 取消引用
        .quote-info
          span 引用&nbsp;
          a(:href="quote.userHome" target="_blank") {{quote.username}}
          span &nbsp;发表于&nbsp;
          a(:href="quote.url") {{quote.order}} 楼
          span &nbsp;的回复
        .quote-content {{quote.content}}

    .m-b-05
      editor(ref="editor" :configs="editorConfigs" @ready="editorReady" @content-change="editorContentChange")
    .m-b-05
      .checkbox
        label
          input(type="checkbox")
          span 我已阅读并同意遵守与本次发表相关的全部协议。
          a(href="/protocol" target="_blank") 查看协议
    .m-b-05
      button.m-r-05.btn.btn-primary.btn-sm 发布
      button.m-r-05.btn.btn-default.btn-sm 暂存
      .pull-right
        a(href="") 历史版本
</template>

<style lang="less" scoped>
  @import "../publicModules/base";
  .quote{
    border: 1px solid #ded9d4;
    border-left-width: 5px;
    border-left-color: #cdc8c3;
    padding: 0.5rem;
    background-color: #f8f8ee;
    position: relative;
    .quote-cancel{
      cursor: pointer;
      font-size: 1.1rem;
      position: absolute;
      top: 0.3rem;
      right: 0.5rem;
      &:hover{
        color: #000;
      }
    }
    .quote-info{
      font-size: 1.1rem;
      font-style: oblique;
      margin-bottom: 0.5rem;
      padding-right: 5rem;
    }
    .quote-content{
      max-height: 3.3rem;
      .hideText(@line: 2)
    }
  }
</style>

<script>
  import Editor from '../lib/vue/Editor'
  import {getPostEditorConfigs} from '../lib/js/editor'
  const commentEditorConfigs = getPostEditorConfigs();
  export default {
    data: () => ({
      editorConfigs: commentEditorConfigs,
      quote: {
        cid: 123,
        order: 2,
        url: "https://12121",
        uid: "74185",
        username: "SPARK",
        userHome: 'https://192.168.11.250:9000/u/74185',
        content: "10 次内存泄露 9 次都是 goruntine 引起，端口 8908 后边是一个 NodeJS socket.io 服务端，现在我通过 NodeJS 向 10086 端口同时发起 1000 个 websocket 连接，这些链接均会被代理到 8908 端口服务，然后将所有连接断开，重复几轮后可见控制台报如下错误",
      }
    }),
    components: {
      'editor': Editor
    },
    methods: {
      editorReady() {
        console.log(`编辑器已就绪`)
      },
      editorContentChange() {
        console.log(`编辑器内容更新，新内容：`)
        const data = this.$refs.editor.getContent();
        console.log(data);
      },
      clearQuote() {
        this.quote = null;
      }
    }
  }
</script>

