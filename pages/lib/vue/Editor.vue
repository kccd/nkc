<template lang="pug">
div
  editor-html(
    v-if="l&&l==='html'"
    :configs="configs"
    ref="editor"
    @ready="ready"
    @content-change="contentChange"
    :plugs="plugs"
    :loading="!!loading"
    )
  editor-json(
    v-else 
    ref="editor"
    :config="configs ? {minHeight:configs.initialFrameHeight,maxWordCount:configs.maximumWords} :{}"
    @ready="ready"
    @content-change="contentChange"
    :loading="!!loading"
    )
</template>

<style lang="less" scoped></style>

<script>
import EditorHtml from './Editor.html.vue';
import EditorJson from './Editor.json.vue';
export default {
  props: ['configs', 'plugs', 'loading', 'l'],
  components: {
    'editor-html': EditorHtml,
    'editor-json': EditorJson,
  },
  data: () => ({
  }),
  methods: {
    contentChange(data) {
      // console.log('cccc',data);

      this.$emit("content-change",data);
    },
    ready() {
      // console.log('rrrrrr');
      
      this.$emit('ready');
    },
    setContent(dataString){
      this.$refs.editor.setContent(dataString);
    },
    getContentTxt(){
      return this.$refs.editor.getContentTxt();
    },
    getContent(){
      return this.$refs.editor.getContent();
    },
    removeNoticeEvent(){
      return this.$refs.editor.removeNoticeEvent();
    }
  },
}
</script>
