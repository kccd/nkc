<template lang="pug">
  .container-fluid.max-width.moment-rich-editor-container
    editor(ref="editor" @content-change="editorContentChange" :loading="loading")
    .m-t-1
      button.btn.btn-default.btn-sm(@click="publish" :disabled="loading || submitting") 发射
</template>

<script>
import {nkcAPI} from "../../../js/netAPI";
import Editor from '../../Editor.json.vue';
import {sweetError} from "../../../js/sweetAlert";
import { immediateDebounce } from "../../../js/execution";
import { visitUrl } from "../../../js/pageSwitch";
export default {
  components: {
    'editor': Editor,
  },
  data() {
    return {
      loading: true,
      submitting: false,
      content: '',
      momentI: ''
    }
  },
  mounted() {
    this.momentId = this.$route.query.id || '';
    this.initDraft();
  },
  computed: {
    isEditMoment() {
      return !!this.momentId
    }
  },
  methods: {
    // 获取富文本草稿
    initDraft() {
      const url = this.isEditMoment ? `/api/v1/zone/moment/${this.momentId}/editor/rich` : `/api/v1/zone/editor/rich`;
      nkcAPI(url, 'GET').then(res => {
        if(res.data.momentId) {
          this.content = res.data.content;
          this.$refs.editor.setContent(this.content);
        }
        this.loading = false;
      })
        .catch(sweetError)
    },
    editorContentChange(newContent) {
      this.content = newContent;
      this.autoSaveDraft();
    },
    saveDraft() {
      const url = this.isEditMoment ? `/api/v1/zone/moment/${this.momentId}/editor/rich` : `/api/v1/zone/editor/rich`;
      nkcAPI(url, 'PUT', {
        content: this.content,
      }).then(res => {
        console.log('保存成功')
      })
        .catch(sweetError)
    },
    autoSaveDraft: immediateDebounce(function() {
      this.saveDraft();
    }, 1000),
    publish() {
      this.submitting = true;
      const url = this.isEditMoment ? `/api/v1/zone/moment/${this.momentId}/editor/rich` : `/api/v1/zone/editor/rich`;
      nkcAPI(url, 'POST', {
        content: this.content,
      })
        .then(() => {
          this.$refs.editor.removeNoticeEvent();
          visitUrl(`/z`);
        })
        .catch(sweetError)
        .finally(() => {
          this.submitting = false;
        })
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