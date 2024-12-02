<template lang="pug">
div(:style="`position: relative;min-height:${minHeight}px;`")
  editor-html(
    v-if="language&&language==='html'"
    :configs="configs"
    ref="editor"
    @ready="ready"
    @content-change="contentChange"
    :plugs="plugs"
    )
  editor-json(
    v-else 
    ref="editor"
    :config="{minHeight: minHeight, maxWordCount: maxWordCount}"
    @ready="ready"
    @content-change="contentChange"
    @manual-save="manualSave"
    )
  .mask.m-b-1(v-show="!!loading")
    loading
</template>

<style lang="less" scoped>
.mask{
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(255,255,255,0.7);
    }
</style>

<script>
import EditorHtml from './Editor.html.vue';
import EditorJson from './Editor.json.vue';
import Loading from './Loading.vue';
export default {
  props: ['configs', 'plugs', 'loading', 'l'],
  components: {
    'editor-html': EditorHtml,
    'editor-json': EditorJson,
    loading: Loading,
  },
  data: () => ({
    language: 'json',
  }),
  watch: {
    l: {
      immediate: true,
      handler(value) {
        this.language = value || 'json';
      }
    },
  },
  computed: {
    minHeight() {
      return this.configs && this.configs.initialFrameHeight?this.configs.initialFrameHeight: 200;
    },
    maxWordCount() {
      return this.configs && this.configs.maximumWords?this.configs.maximumWords: 100000;
    },
  },
  mounted() {
    console.log(this.configs)
  },
  methods: {
    contentChange(data) {
      this.$emit("content-change",data);
    },
    ready() {
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
    },
    clearContent(){
      if(this.language!=='json') return;
      this.$refs.editor.clearContent();
    },
    manualSave() {
      this.$emit('manual-save');
    }
  },
}
</script>
