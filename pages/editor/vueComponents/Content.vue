<template lang="pug">
editor(
  :configs="editorConfigs",
  ref="threadEditor",
  @ready="editorReady",
  @content-change="onContentChange",
  :plugs="editorPlugs"
  :l="l"
)
</template>

<script>
import Editor from "../../lib/vue/Editor";
import { getEditorConfigs } from "../../lib/js/editor";
export default {
  components: {
    editor: Editor,
  },
  data: () => ({
    openOnEditNotes: localStorage.getItem("open-on-edit-notes") === "yes",
    editorPlugs: {
      resourceSelector: true,
      draftSelector: true,
      stickerSelector: true,
      xsfSelector: true,
      mathJaxSelector: true,
    },
    // 是否允许触发contentChange
    // contentChangeEventFlag: true,
    content: "",
    // quoteHtml: "",
    contentLength: "",
    editorStatus: false,
  }),
  props: {
    c: {
      type: String,
    },
    l: {
      type: String,
    },
    type: {
      type: String
    }
  },
  watch: {
    c: {
      deep: true,
      immediate: true,
      handler(n) {
        // let reg = /<blockquote cite.+?blockquote>/;
        // let quoteHtml = n?.match(reg);
        // if (quoteHtml && quoteHtml[0]) {
        //   this.quoteHtml = quoteHtml[0];
        // }
        this.content = n;
        this.editorStatus && this.setContent(this.content)
      },
    },
    openOnEditNotes: function (val) {
      localStorage.setItem("open-on-edit-notes", val ? "yes" : "no");
    },
  },
  computed: {
    editorConfigs() {
      return { ...getEditorConfigs(this.type === 'modifyComment'? 500: 100000), autoFloatEnabled: true };
    },
  },
  methods: {
    setContent(v) {
      if (v === undefined || v === null) v = '';
      this.$refs.threadEditor.setContent(v);
    },
    getRef() {
      return this.$refs.threadEditor;
    },
    onContentChange() {
      this.watchContentChange();
    },
    watchContentChange() {
      const content = this.$refs.threadEditor.getContentTxt();
      const _content = this.$refs.threadEditor.getContent();
      this.content = _content;
      this.contentLength = this.content.length;
      this.$emit("content-change", content.length);
    },
    getData() {
      return {
        c: this.$refs.threadEditor?.getContent && this.$refs.threadEditor.getContent() || '',
        contentLength: this.contentLength,
      };
    },
    editorReady() {
      //编辑器准备就绪
      this.editorStatus = true;
      this.setContent(this.content);
      // this.resetBodyPaddingTop();
    },
    removeEditor() {
      this.$refs.threadEditor.removeNoticeEvent();
    },
  },
};
</script>

