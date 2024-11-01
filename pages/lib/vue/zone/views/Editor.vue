<template lang="pug">
  .container-fluid.max-width.moment-rich-editor-container
    .moment-rich-editor-toolbar
      .moment-rich-editor-toolbar-left
    editor(ref="editor" @content-change="editorContentChange")
</template>

<script>
import Editor from '../../Editor.v2.vue';
export default {
  components: {
    'editor': Editor,
  },
  data() {
    return {
      content: '',
    }
  },
  mounted() {
  },
  methods: {
    // 获取富文本草稿
    getDraft() {

    },
    editorContentChange(newContent) {
      this.content = newContent;
    },
    saveDraft() {

    },
    publish() {

    },
  }
}
</script>

<style lang="less" scoped>
.moment-rich-editor-container{
  width: 70rem;
  max-width: 100%;
}
</style>