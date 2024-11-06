<template lang="pug">
  .container-fluid.max-width.moment-rich-editor-container
    editor(
      ref="editor"
      @content-change="editorContentChange"
      @manual-save="saveDraftManual"
      :loading="loading"
      )
    .m-t-1
      button.btn.btn-primary.m-r-05(:class="{'disabled': disablePublish}" v-if="submitting" title="提交中，请稍候")
        .fa.fa-spinner.fa-spin
      button.btn.btn-primary.m-r-05(:class="{'disabled': disablePublish}" v-else-if="disablePublish") 提交
      button.btn.btn-primary.m-r-05(@click="publish" v-else) 提交
      button.btn.btn-default(@click="visitHistory" :disabled="loading || submitting") 历史版本
</template>

<script>
import {nkcAPI} from "../../../js/netAPI";
import Editor from '../../Editor.json.vue';
import {sweetError} from "../../../js/sweetAlert";
import {screenTopAlert} from "../../../js/topAlert";
import { immediateDebounce } from "../../../js/execution";
import { visitUrl } from "../../../js/pageSwitch";
import {getRichJsonContentLength} from '../../../js/checkData'
export default {
  components: {
    'editor': Editor,
  },
  data() {
    return {
      loading: true,
      submitting: false,
      content: '',
      momentId: '',
      isEditMoment: false,
    }
  },
  mounted() {
    const queryMomentId = this.$route.query.id || '';
    this.isEditMoment = !!queryMomentId;
    this.momentId = queryMomentId;
    this.initDraft();
  },
  computed: {
    disablePublish() {
      return this.loading || this.submitting || this.wordCount === 0;
    },
    wordCount() {
      return getRichJsonContentLength(this.content)
    }
  },
  methods: {
    // 获取富文本草稿
    initDraft() {
      const url = this.isEditMoment ? `/api/v1/zone/moment/${this.momentId}/editor/rich` : `/api/v1/zone/editor/rich`;
      nkcAPI(url, 'GET').then(res => {
        if(res.data.momentId) {
          this.momentId = res.data.momentId;
          this.content = res.data.content;
          this.$refs.editor.setContent(this.content);
        }
        this.loading = false;
      })
        .catch(sweetError)
    },
    editorContentChange(newContent) {
      this.content = newContent;
      this.saveDraftDebounce();
    },
    saveDraft() {
      const url = this.isEditMoment ? `/api/v1/zone/moment/${this.momentId}/editor/rich` : `/api/v1/zone/editor/rich`;
      return nkcAPI(url, 'PUT', {
        content: this.content,
      }).then(res => {
        this.momentId = res.data.momentId;
        console.log('保存成功')
      })
    },
    saveDraftManual() {
      this.saveDraft().then(() => {
        screenTopAlert('保存成功');
      }).catch(sweetError);
    },
    saveDraftDebounce: immediateDebounce(function() {
      this.saveDraft().catch(sweetError);
    }, 1000),
    publish() {
      this.submitting = true;
      const url = this.isEditMoment ? `/api/v1/zone/moment/${this.momentId}/editor/rich` : `/api/v1/zone/editor/rich`;
      nkcAPI(url, 'POST', {
        content: this.content,
      })
        .then((res) => {
          this.momentId = res.data.momentId;
          this.$refs.editor.removeNoticeEvent();
          visitUrl(`/z/m/${res.data.momentId}`);
        })
        .catch(sweetError)
        .finally(() => {
          this.submitting = false;
        })
    },
    visitHistory() {
      this.$refs.editor.removeNoticeEvent();
      this.saveDraft()
        .then(() => {
          this.$router.push(`/z/editor/rich/history?id=${this.momentId}`);
        })
        .catch(sweetError);
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../../../publicModules/base';
.moment-rich-editor-container{
  width: 70rem;
  max-width: 100%;
  padding: 2rem;
  background-color: #fff;
}
</style>