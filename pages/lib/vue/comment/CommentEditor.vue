<template lang="pug">
  div
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
      editor(ref="editor" :configs="editorConfigs" @ready="editorReady" @content-change="editorContentChange" )
    .m-b-05
      column(
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
      button.m-r-05.btn.btn-primary.btn-sm(@click="publish" :disabled="!commentContent || lockPost" v-if="!publishing") 发布
      button.m-r-05.btn.btn-primary.btn-sm(@click="publish" :disabled="!commentContent || lockPost" v-if="publishing") 发布中...
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
  export default {
    props: ['source', 'sid', 'comment', 'column-info', 'to-column', 'added'],
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
    }),
    components: {
      'editor': Editor,
      'column': Column
    },
    computed: {
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
        } else {
          this.contentChangeEventFlag = true;
        }
      },
      //编辑器内容发生变化时
      editorContentChange: debounce(function() {
        if(!this.contentChangeEventFlag) {
          this.contentChangeEventFlag = true;
          return;
        }
        this.commentContent = this.$refs.editor.getContent();
        this.modifyComment();
      }, 1000),
      modifyComment() {
        const self = this;
        clearTimeout(self.setTimeout);
        self.setTimeout = setTimeout(function () {
          self.post(self.type);
        }, 2000);
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
        this.$refs.editor.changeSaveInfo(type);
      },
      //填入编辑器内容
      setContent(content) {
        this.$refs.editor.setContent(content);
      },
      //提交修改评论内容
      post(type) {
        if(type === 'publish') {
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
          content: self.commentContent,
          type,
          source: self.source,
          sid: self.comment?self.comment.sid:self.sid,
          commentType: self.comment?'comment':'article',
          quoteDid: self.quote?self.quote.docId:'',
          commentId: self.commentId,
          toColumn: null,
        };
        const toColumn = self.$refs.column.getStatus();
        if(toColumn.checkbox) {
          data.toColumn = toColumn;
        }
        return nkcAPI('/comment', 'POST', data)
        .then(res => {
          self.commentId = res.commentId;
          if(type !== 'publish') {
            if(type === 'save') {
              self.saving = false;
            }
            self.type = 'modify';
          } else {
            sweetSuccess('发布成功！');
            self.contentChangeEventFlag = false;
            //发布成功后通知上层将content清空
            self.clearContent();
            self.type = 'create';
            self.quote = null;
            self.publishing = false;
          }
          self.setSavedStatus('succeeded');
          self.lockPost = false;
        })
        .catch(err => {
          self.setSavedStatus('failed');
          self.lockPost = false;
          self.publishing = false;
          sweetError(err);
        })
      },
      //清空编辑器中的内容
      clearContent() {
        this.$refs.editor.setContent('');
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

