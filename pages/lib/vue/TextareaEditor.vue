<template lang="pug">
  .textarea-editor
    .textarea-editor-container.ghost
      div
        textarea(
          ref="ghostTextarea"
          v-model="content"
          :style="ghostTextareaStyle"
          )
    .textarea-editor-container
      div
        textarea(
          ref="textarea"
          @input="setTextareaSize"
          :style="textareaStyle"
          v-model="content"
          :placeholder="placeholder || defaultPlaceholder"
          @keyup.ctrl.enter="keyUpEnter"
        )

</template>


<style lang="less" scoped>
  .textarea-editor{
    position: relative;
    .textarea-editor-container{
      background-color: #fff;
      &.ghost{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: -1;
      }
      &>div{
        margin-bottom: 0.5rem;
        padding: 0.5rem 0.8rem;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        font-size: 0;
        textarea{
          //min-height: 5rem;
          resize: none;
          overflow: hidden;
          width: 100%;
          border: none;
          font-size: 1.2rem;
          line-height: 2rem;
          border-radius: 0;
          outline: none;
          padding: 0;
        }
      }
    }
  }
</style>

<script>
  import {debounce} from '../js/execution';
  export default {
    props: ['placeholder', 'height', 'max-height'],
    data: () => ({
      defaultPlaceholder: "想分享什么新鲜事？",
      defaultHeight: "5rem",
      defaultMaxHeight: "100rem",
      content: '',
      textareaHeight: '0',
    }),
    computed: {
      minHeight() {
        return this.height || this.defaultHeight;
      },
      editorMaxHeight() {
        return this.maxHeight || this.defaultMaxHeight;
      },
      ghostTextareaStyle() {
        return `height: 0;min-height: ${this.minHeight}; max-height: ${this.editorMaxHeight};`
      },
      textareaStyle() {
        return `height: ${this.textareaHeight}; min-height: ${this.minHeight}; max-height: ${this.editorMaxHeight};`;
      }
    },
    watch: {
      'content': 'onContentChange',
    },
    methods: {
      setTextareaSize() {
        const self = this;
        setTimeout(() => {
          const ghostElement = self.$refs.ghostTextarea;
          const scrollHeight = ghostElement.scrollHeight;
          self.textareaHeight = scrollHeight + 'px';
        });
      },
      getContent() {
        return this.content;
      },
      setContent(content) {
        this.content = content;
        this.setTextareaSize();
      },
      resetFocus(newPosition) {
        const element = this.$refs.textarea;
        if(element.setSelectionRange) {
          element.focus();
          element.setSelectionRange(newPosition, newPosition);
        } else if(element.createTextRange) {
          const range = element.createTextRange();
          range.collapse(true);
          range.moveEnd("character", newPosition);
          range.moveStart("character", newPosition);
          range.select();
        }
      },
      insertContent(text) {
        const {content} = this;
        const element = this.$refs.textarea;
        const insert = element.selectionStart;
        const startContent = content.slice(0, insert);
        const endContent = content.slice(insert, content.length);
        this.content = startContent + text + endContent;
        const newPosition = insert + text.length;
        const self = this;
        setTimeout(() => {
          self.resetFocus(newPosition);
        });
      },
      keyUpEnter() {
        this.$emit('click-ctrl-enter');
      },
      onContentChange: function() {
        this.$emit('content-change', this.content);
      }
    }
  }
</script>
