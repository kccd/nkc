import Editor from "../../lib/vue/Editor";
import {getColumnPageConfigs} from "../../lib/js/editor";
window.app = new Vue({
  el: '#app',
  data: {
    title: '',
    data: NKC.methods.getDataById("data") || undefined,
    editorPlugs: {
      resourceSelector: true,
      draftSelector: true,
      stickerSelector: true,
      xsfSelector: true,
      mathJaxSelector: true,
    }
  },
  components: {
    'editor': Editor,
  },
  computed: {
    editorConfigs() {
      return getColumnPageConfigs();
    },
  },
  mounted() {
    if(this.data.page) {
      this.title = this.data.page.t;
    }
  },
  methods: {
    setEditorContent() {
      if(this.data.page) {
        this.$refs.editorPageEditor.setContent(this.data.page.c);
      }
    },
    save(){
      const self = this;
      var content = this.$refs.editorPageEditor.getContent();
      if(!content) return sweetError("请输入页面内容");
      var method, url;
      var body = {
        title: this.title,
        content: content
      };
      if(this.data.page) {
        method = "PUT";
        url = "/m/" + this.data.column._id + "/page/" + this.data.page._id;
        body.type = "modifyContent";
      } else {
        method = "POST";
        url = "/m/" + this.data.column._id + "/page";
      }
      nkcAPI(url, method, body)
        .then(function(data) {
          self.$refs.editorPageEditor.removeNoticeEvent();
          openToNewLocation("/m/" + data.column._id + "/settings/page");
        })
        .catch(function(data) {
          sweetError(data);
        });
    }
  }
})
