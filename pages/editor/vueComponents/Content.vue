<template lang="pug">
.content
  editor(
    :configs="editorConfigs",
    ref="threadEditor",
    @ready="editorReady",
    @content-change="onContentChange",
    :plugs="editorPlugs"
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
    contentLength: ""
  }),
  props: {
    c: {
      type: String
    }
  },
  watch: {
    c: {
      immediate: true,
      handler(n) {
        let reg = /<blockquote cite.+?blockquote>/;
        let quoteHtml = n?.match(reg);
        if (quoteHtml && quoteHtml[0]) {
          this.quoteHtml = quoteHtml[0];
        }
        this.content = n?.replace(reg, "") || "";
        // 真奇怪 
      }
    },
    openOnEditNotes: function(val) {
      localStorage.setItem("open-on-edit-notes", val ? "yes" : "no");
    }
  },
  computed: {
    editorConfigs() {
      return getEditorConfigs();
    }
  },
  methods: {
    setContent() {
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
        c: this.content + (this.quoteHtml || ""),
        contentLength: this.contentLength
      };
    },
    editorReady() {
      //编辑器准备就绪
      this.setContent();
      this.resetBodyPaddingTop();
    },
    removeEditor() {
      this.$refs.threadEditor.removeNoticeEvent();
    }
  },
};
</script>

<style lang="less">
.content #edui1_toolbarbox.edui-default {
  position: fixed;
  padding-left: 15px;
  top: 43px;
  left: 0px;
  width: 100%;
  z-index: 1030;
  left: 0;
  top: 45px;
  background-color: rgba(250, 250, 250, 0.95) !important;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
  border: none;
  border-bottom: 1px solid #dbdbdb;
  padding: 0.5rem 0;
  #edui1_toolbarboxouter {
    max-width: 1300px !important;
    margin-right: auto;
    margin-left: auto;
  }
}
#edui1 {
  border: none;
}
</style>
