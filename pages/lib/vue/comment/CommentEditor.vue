<template lang="pug">
  div
    .m-b-05(v-if="quote")
      .quote
        .quote-cancel(@click="clearQuote") 取消引用
        .quote-info
          span 引用&nbsp;
          a(:href="`/u/${quote.user.uid}`" target="_blank") {{quote.user.username}}
          span &nbsp;发表于&nbsp;
          //a(:href="quote.url") {{quote.order}} 楼
          span {{quote.order}} 楼
          span &nbsp;的回复
        .quote-content {{quote.content}}

    .m-b-05#container
      editor(ref="editor" :configs="editorConfigs" @ready="editorReady" @content-change="editorContentChange" )
    .m-b-05
      .checkbox
        label
          input(type="checkbox" value="true" v-model="checkProtocol")
          span 我已阅读并同意遵守与本次发表相关的全部协议。
          a(href="/protocol" target="_blank") 查看协议
    .m-b-05
      button.m-r-05.btn.btn-primary.btn-sm(@click="publish") 发布
      button.m-r-05.btn.btn-default.btn-sm(@click="saveComment") 暂存
      .pull-right
        a(href="") 历史版本
</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
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
  import Editor from '../Editor';
  import {getPostEditorConfigs} from '../../js/editor';
  const commentEditorConfigs = getPostEditorConfigs();
  import {nkcAPI} from "../../js/netAPI";
  export default {
    props: ['source', 'sid', 'comment'],
    data: () => ({
      editorConfigs: commentEditorConfigs,
      quote: '',
      commentContent: '',
      type: '',
      lockPost: false, //发布与编辑的禁用状态
      checkProtocol: true,
      // 是否允许触发contentChange
      contentChangeEventFlag: false,
    }),
    components: {
      'editor': Editor
    },
    mounted() {
    },
    methods: {
      editorReady() {
        this.$refs.editor.removeNoticeEvent();
        this.type = this.comment?'modify':'create';
        if(this.comment) {
          this.commentId = this.comment._id;
          this.setContent(this.comment.content);
        } else {
          this.contentChangeEventFlag = true;
        }
      },
      //编辑器内容发生变化时
      editorContentChange() {
        if(!this.contentChangeEventFlag) {
          this.contentChangeEventFlag = true;
          return;
        }
        const data = this.$refs.editor.getContent();
        this.commentContent = data;
        this.post(this.type);
      },
      //点击引用获取该楼层的引用信息
      changeQuote(item) {
        if(!item) return;
        const self = this;
        nkcAPI(`/comment/${item._id}/quote`, 'GET', {})
        .then(res => {
          self.quote = res.quote
          window.location.href='#container';
        })
        .catch(err => {
          sweetError(err);
        })
      },
      //设置编辑器保存状态 succeeded failed saving
      setSavedStatus(type) {
        this.$refs.editor.changeSaveInfo(type);
      },
      //填入编辑器内容
      setContent(content) {
        this.$refs.editor.setContent(content);
      },
      //提交修改评论内容
      post(type) {
        if(!this.checkProtocol) sweetWarning('请勾选协议！');
        if(!type) return;
        if(this.lockPost) return;
        this.lockPost = true;
        const self = this;
        self.setSavedStatus('saving');
        return nkcAPI('/comment', 'POST', {
          content: self.commentContent,
          type,
          source: self.source,
          sid: self.sid,
          quoteCid: self.quote?self.quote._id:'',
          commentId: self.commentId,
        })
        .then(res => {
          self.commentId = res.commentId;
          if(type !== 'publish') {
            self.lockPost = false;
            self.type = 'modify';
          } else {
            sweetSuccess('发布成功！');
            self.contentChangeEventFlag = false;
            //发布成功后通知上层将content清空
            self.clearContent();
            self.lockPost = false;
            self.type = 'create';
            self.clearQuote();
          }
          self.setSavedStatus('succeeded');
        })
        .catch(err => {
          self.setSavedStatus('failed');
          self.lockPost = false;
          sweetError(err);
        })
      },
      //清空编辑器中的内容
      clearContent() {
        this.$refs.editor.setContent('');
      },
      //发布评论
      publish() {
        const self = this;
        self.post('publish')
      },
      //暂存评论内容
      saveComment() {
        this.post('save')
        .then(() => {
          sweetSuccess('保存成功');
        })
      },
      clearQuote() {
        this.quote = null;
      }
    }
  }
</script>

