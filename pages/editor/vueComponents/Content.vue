<template lang="pug">
#content
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
    editorPlugs: {
      resourceSelector: true,
      draftSelector: true,
      stickerSelector: true,
      xsfSelector: true,
      mathJaxSelector: true,
      content: "",
      EditorReady: false
    },
    // 是否允许触发contentChange
    contentChangeEventFlag: true,
    content: ""
  }),
  created() {
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
    },
    getContentObj(){
      return {
        content: this.content,
        contentLength: this.contentLength
      }
    },
    editorReady() {
      //编辑器准备就绪
      this.setContent();
      this.resetBodyPaddingTop();
      // this.EditorReady = true;
      // initVueApp();
      // initPostButton();
    }
  }
};
</script>

<style></style>
