<template lang="pug">
  div
    .permission-checker
      publish-permission-checker(:type="publishPermissionTypes.comment")
    .m-b-05(v-if="quote")
      .quote
        .quote-cancel(@click="clearQuote") 取消引用
        .quote-info
          span 引用&nbsp;
          a(:href="`/u/${quote.uid}`" target="_blank") {{quote.username}}
          span &nbsp;发表于&nbsp;
          //a(:href="quote.url") {{quote.order}} 楼
          span {{quote.order}} 楼
          span &nbsp;的回复
        .quote-content {{quote.content}}

    .m-b-05#container
      editor(ref="editor" :configs="editorConfigs" @ready="editorReady" @content-change="editorContentChange" :loading="loading" :l="l")
    .m-b-05
      //column(
        ref="column"
        :data="{addedToColumn: added}"
        :state="columnInfo"
        o="o"
        )
      .checkbox
        label
          input(type="checkbox" value="true" v-model="checkProtocol")
          span 我已阅读并同意遵守与本次发表相关的全部协议。
          a(href="/protocol" target="_blank") 查看协议
    .m-b-05
      button.m-r-05.btn.btn-primary.btn-sm(@click="publish" :disabled="disabledPublish" v-if="!publishing") 发布
      button.m-r-05.btn.btn-primary.btn-sm(@click="publish" :disabled="disabledPublish" v-if="publishing") 发布中...
        span.fa.fa-spinner.fa-spin
      button.m-r-05.btn.btn-default.btn-sm(@click="saveComment" :disabled="!commentContent || lockPost" v-if="!saving") 暂存
      button.m-r-05.btn.btn-default.btn-sm(@click="saveComment" :disabled="!commentContent || lockPost" v-if="saving") 暂存中...
        span.fa.fa-spinner.fa-spin
      //.pull-right
      //  a(:href="`/document/history?source=article&sid=${sid}`") 历史版本
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
  import Column from "../../../editor/vueComponents/Column";
  const commentEditorConfigs = getCommentEditorConfigs();
  import {getCommentEditorConfigs} from '../../js/editor';
  import {debounce} from "../../js/execution";
  import {nkcAPI} from "../../js/netAPI";
  import { publishPermissionTypes } from '../../js/publish';
import PublishPermissionChecker from '../PublishPermissionCheck.vue';
  export default {
    props: ['source', 'aid', 'comment', 'column-info', 'to-column', 'added'],
    data: () => ({
      editorConfigs: commentEditorConfigs,
      quote: '',
      commentContent: '',
      type: '',
      lockPost: false, //发布与编辑的禁用状态
      checkProtocol: true,
      // 是否允许触发contentChange
      contentChangeEventFlag: false,
      publishing: false,
      saving: false,
      setTimeout: null,
      commentId: null,
      l:'',
      loading: true,
      publishPermissionTypes,
    }),
    components: {
      'editor': Editor,
      'column': Column,
      'publish-permission-checker': PublishPermissionChecker,
    },
    computed: {
      disabledPublish(){
        let count = 0;
        if( this.$refs.editor){
          count = this.$refs.editor.getContentTxt().length;
        }
        return !this.commentId || this.lockPost || !this.checkProtocol || !this.commentContent || count>commentEditorConfigs.maximumWords;
      }
    },
    mounted() {
    },
    methods: {
      editorReady() {
        this.$refs.editor.removeNoticeEvent();
        this.type = this.comment?'modify':'create';
        if(this.comment) {
          this.commentContent = this.comment.content;
          this.commentId = this.comment._id;
          if(this.comment.quote) this.quote = this.comment.quote;
          this.setContent(this.comment.content);
          this.l = this.comment.l;
        } else {
          this.contentChangeEventFlag = true;
        }
        this.loading = false;
      },
      //编辑器内容发生变化时
      // editorContentChange: debounce(function() {
      //   console.log(2222)
      //   if(!this.contentChangeEventFlag) {
      //     this.contentChangeEventFlag = true;
      //     return;
      //   }
      //   console.log(5555)
      //   this.commentContent = this.$refs.editor.getContent();
      //   this.modifyComment();
      // }, 200),
      editorContentChange(){
        if(!this.contentChangeEventFlag) {
          this.contentChangeEventFlag = true;
          return;
        }
        this.commentContent = this.$refs.editor.getContent();
        this.modifyComment();
      },
      modifyComment() {
        const self = this;
        clearTimeout(self.setTimeout);
        // if(self.commentId) {
          // self.post(self.type);
        // } else {
          self.setTimeout = setTimeout(function () {
            self.post(self.type);
          }, 800);
        // }
      },
      //点击引用获取该楼层的引用信息
      changeQuote(docId, source) {
        if(!docId) return;
        const self = this;
        nkcAPI(`/comment/${docId}/quote?source=${source}`, 'GET', {})
        .then(res => {
          self.quote = res.quote
          self.post(self.type);
          window.location.href='#container';
        })
        .catch(err => {
          sweetError(err);
        })
      },
      //设置编辑器保存状态 succeeded failed saving
      setSavedStatus(type) {
        // this.$refs.editor.changeSaveInfo(type);
      },
      //填入编辑器内容
      setContent(content) {
        this.$refs.editor.setContent(content);
      },
      //提交修改评论内容
      post(type) {
        if(type === 'publish') {
          if(!this.commentId) return;
          this.publishing = true;
          clearTimeout(this.setTimeout);
        } else if(type === 'save') {
          this.saving = true;
        }
        if(!this.checkProtocol) sweetWarning('请勾选协议！');
        if(!type) return;
        if(this.lockPost) return;
        this.lockPost = true;
        const self = this;
        self.setSavedStatus('saving');
        const data = {
          // content: self.commentContent,
          content: self.$refs.editor.getContent(),
          type,
          source: self.source,
          aid: self.aid,
          quoteDid: self.quote?self.quote.docId:'',
          commentId: self.commentId,
          toColumn: null,
          l: self.l,
        };
        // const toColumn = self.$refs.column.getStatus();
        // if(toColumn.checkbox) {
        //   data.toColumn = toColumn;
        // }
        return nkcAPI('/comment', 'POST', data)
        .then(res => {
          self.commentId = res.commentId;
          if(type !== 'publish') {
            if(type === 'save') {
              self.saving = false;
            }
            self.type = 'modify';
          } else {
            screenTopAlert('发布成功');
            self.contentChangeEventFlag = false;
            // if(res.user) {
            //   window.insertRenderedComment(res.user);
            // }
            //发布成功后通知上层将content清空
            self.clearContent();
            self.type = 'create';
            self.quote = null;
            self.publishing = false;
            self.commentId = null;
            clearTimeout(this.setTimeout);
          }
          self.lockPost = false;
          self.setSavedStatus('succeeded');
        })
        .catch(err => {
          self.lockPost = false;
          self.setSavedStatus('failed');
          self.publishing = false;
          sweetError(err);
        })
      },
      //清空编辑器中的内容
      clearContent() {
        if(this.l==='html'){
          this.$refs.editor.setContent('');
        }else{
          this.$refs.editor.clearContent();
        }
        this.commentContent = '';
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
        this.post(this.type);
      }
    }
  }
</script>

