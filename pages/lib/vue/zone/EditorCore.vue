<template lang="pug">
  .moment-editor-core
    div(v-show="loading")
      loading-icon
    editor-content.tiptap-editor-content(:editor='editor' ref="editorContent")
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import nkcEmoji from '../tiptap/node/nkcEmoji/nkcEmoji.js';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder'
import Loading from '../Loading.vue';


export default {
  components: {
    'editor': Editor,
    'editor-content': EditorContent,
    'loading-icon': Loading,
  },
  data: () => ({
    editor: null,
    loading: true,
  }),
  mounted() {
    this.initEditor();
    this.$refs.editorContent.$el.addEventListener('keydown', (e) => {
      if (this.editor.isFocused && event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        this.$emit('click-ctrl-enter');
      }
    });
  },
  methods: {
    initEditor() {
      this.editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          History,
          nkcEmoji,
          Placeholder.configure({
            placeholder: '想分享什么新鲜事？',
          }),
        ],
        onUpdate: () => {
          this.$emit('content-change', this.getContent());
        },
      })
    },
    setContent(jsonString) {
      this.editor.commands.setContent(JSON.parse(jsonString));
    },
    getContent() {
      return JSON.stringify(this.editor.getJSON());
    },
    insertContent(nodeString) {
      this.editor.chain().focus().insertContent(JSON.parse(nodeString)).run();
    },
    hideLoading() {
      this.loading = false;
    },
  }
}
</script>

<style scoped lang="less">
.moment-editor-core{
  position: relative;
  &>div:first-child{
    z-index: 100;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
  }
}
.tiptap-editor-content{
  padding: 0.3rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #fff;
  ::v-deep{
    .tiptap.ProseMirror {
      outline: none;
      min-height: 5rem;
    }
    p {
      font-size: 15px;
    }
    p.is-editor-empty:first-child::before {
      color: #777;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
}
</style>