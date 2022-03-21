<template lang="pug">
.content
  editor(
      :configs="editorConfigs",
      ref="threadEditor",
      @ready="editorReady",
      @content-change="onContentChange",
      :plugs="editorPlugs",
    )
</template>

<script>
import Editor from "../../lib/vue/Editor";
import { getEditorConfigs } from "../../lib/js/editor";
export default {
  components: {
    editor: Editor
  },
  data: () => ({
    openOnEditNotes: localStorage.getItem("open-on-edit-notes") === "yes",
    editorPlugs: {
      resourceSelector: true,
      draftSelector: true,
      stickerSelector: true,
      xsfSelector: true,
      mathJaxSelector: true
    },
    // 是否允许触发contentChange
    contentChangeEventFlag: true,
    content: "",
    quoteHtml: "",
    contentLength: ''
  }),
  props: {
    c: {
      type: String
    },
  },
  created() {
    let reg = /<blockquote cite.+?blockquote>/;
    let quoteHtml = this.c?.match(reg);
    if (quoteHtml && quoteHtml[0]) {
      this.quoteHtml = quoteHtml[0];
    }
    this.content = this.c?.replace(reg, "") || "";
  },
  mounted() {},
  computed: {
    editorConfigs() {
      return getEditorConfigs();
    }
  },
  methods: {
    setContent() {
      // window.editorContainer.contentChangeEventFlag = false; ？？
      this.$refs.threadEditor.setContent(this.content);
    },
    resetBodyPaddingTop() {
      let tools = $(".editor .edui-editor-toolbarbox.edui-default");
      if (NKC.methods.getRunType() === "app") {
        tools.css("top", 0);
        $("body").css("padding-top", tools.height() + 40);
      } else {
        let header = $(".navbar.navbar-default.navbar-fixed-top.nkcshade");
        let height = header.height() + tools.height();
        $("body").css("padding-top", height + 40);
      }
    },
    getRef() {
      return this.$refs.threadEditor;
    },
    onContentChange() {
      // if (!this.contentChangeEventFlag) {
      //   this.contentChangeEventFlag = true;
      //   return;
      // }
      this.watchContentChange();
    },
    watchContentChange() {
      const content = this.$refs.threadEditor.getContentTxt();
      const _content = this.$refs.threadEditor.getContent();
      this.content = _content;
      this.contentLength = content.length;
      this.$emit("content-change", content.length);
    },
    getData() {
      return { c: this.content + (this.quoteHtml || ""), contentLength: this.contentLength};
    },
    editorReady() {
      //编辑器准备就绪
      this.setContent();
      this.resetBodyPaddingTop();
      // this.EditorReady = true;
      // initVueApp();
      // initPostButton();
    },
    removeEditor() {
      this.$refs.threadEditor.removeNoticeEvent();
    }
  },
  watch: {
    openOnEditNotes: function(val) {
      localStorage.setItem("open-on-edit-notes", val ? "yes" : "no");
    }
  }
};
</script>

<style scoped lang="less">

.content #edui1_toolbarbox{
  position: fixed;
  top: 43px;
  left: 0px;
  width: 100%;
}
</style>
