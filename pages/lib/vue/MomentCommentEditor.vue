<template lang="pug">
  .moment-comment-editor
    emoji-selector(ref="emojiSelector")
    .moment-comment-editor-container
      .moment-comment-textaea-ditor-container
        textarea-editor(
          ref="textareaEditor"
          :placeholder="placeholder"
          height="4rem"
          @content-change="onTextareaEditorContentChange")
    .moment-comment-option-container
      .option-box(@click="selectEmoji")
        .fa.fa-smile-o
        span 表情
      .option-box
        .checkbox(v-if="postType === types.comment")
          label
            input(type="checkbox" :value="true" v-model="alsoPost")
            span 同时转发
        .checkbox(v-if="postType === types.repost")
          label
            input(type="checkbox" :value="true" v-model="alsoPost")
            span 同时评论
      .option-box-right
        span {{remainingWords}}
        button.btn.btn-default.btn-sm(@click="publish") 提交

</template>

<style lang="less" scoped>
  .moment-comment-editor{
    @buttonContainerWidth: 4rem;
    @buttonContainerHeight: 3rem;
    .moment-comment-editor-container{
      position: relative;
      min-height: @buttonContainerHeight;
    }
    .moment-comment-option-container{
      @height: 3rem;
      @paddingRight: 10rem;
      padding-right: @paddingRight;
      position: relative;
      .option-box{
        display: inline-block;
        margin-right: 1rem;
        cursor: pointer;
        .fa{
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }
      }
      .option-box-right{
        height: @height;
        text-align: right;
        top: 0;
        right: 0;
        line-height: @height;
        position: absolute;
        width: @paddingRight;
        button{

        }
        span{
          height: @height;
          line-height: @height;
          margin-right: 1rem;
          font-weight: 700;
          color: #787878;
          &.warning{
            color: red;
          }
        }
      }
    }
  }
</style>

<script>
  import TextareaEditor from './TextareaEditor';
  import {sweetError} from '../js/sweetAlert';
  import {debounce} from "../js/execution";
  import {getLength} from "../js/checkData";
  import EmojiSelector from '../vue/EmojiSelector';
  export default {
    props: ['mid', 'type'],
    components: {
      'textarea-editor': TextareaEditor,
      'emoji-selector': EmojiSelector
    },
    data: () => ({
      maxContentLength: 1000,
      content: '',
      alsoPost: false,
      momentCommentId: null,
      types: {
        repost: 'repost',
        comment: 'comment'
      }
    }),
    watch: {
      content: 'onContentChange'
    },
    mounted() {
      this.getMomentComment()
    },
    computed: {
      placeholder() {
        return {
          comment: '发表你的评论',
          repost: '发表你的想法'
        }[this.postType]
      },
      postType() {
        return this.type || this.types.comment; // repost(转发), comment(评论)
      },
      momentId() {
        return this.mid;
      },
      contentLength() {
        return getLength(this.content);
      },
      allowedToPublish() {
        const {contentLength, maxContentLength} = this;
        return contentLength <= maxContentLength;
      },
      remainingWords() {
        const {maxContentLength, contentLength} = this;
        return maxContentLength - contentLength;
      }
    },
    methods: {
      selectEmoji() {
        const self = this;
        this.$refs.emojiSelector.open(res => {
          const {code} = res;
          self.insertContent(`[${code}]`);
        });
      },
      insertContent(text) {
        this.$refs.textareaEditor.insertContent(text);
      },
      getMomentComment() {
        const {momentId} = this;
        const self = this;
        nkcAPI(`/creation/zone/moment?from=editor&mid=${momentId}`, 'GET')
          .then(res => {
            const {content, momentId} = res;
            if(!momentId) return;
            self.content = content;
            self.syncTextareaEditorContent();
          })
          .catch(sweetError)
      },
      syncTextareaEditorContent() {
        this.$refs.textareaEditor.setContent(this.content);
      },
      onTextareaEditorContentChange(content) {
        this.content = content;
      },
      onContentChange: debounce(function() {
        this.saveContent();
      }, 500),
      saveContent() {
        const {
          content,
          momentId,
        } = this;
        return nkcAPI(`/creation/zone/moment/${momentId}`, 'POST', {
          type: 'modify',
          content,
        })
        .then(res => {
          console.log(`动态已自动保存`);
        })
        .catch(err => {
          screenTopWarning(`动态保存失败：${err.error || err.message || err}`)
        });
      },
      publish() {
        const self = this;
        const {postType, alsoPost, content, momentId} = this;
        return nkcAPI(`/creation/zone/moment/${momentId}`, 'POST', {
          type: 'publish',
          content,
          postType,
          alsoPost,
        })
          .then(res => {
            self.$emit('published');
            console.log(`published`)
          })
          .catch(err => {
            sweetError(err)
          });
      }
    }
  }
</script>