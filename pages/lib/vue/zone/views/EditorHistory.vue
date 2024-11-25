<template lang="pug">
  .container-fluid.max-width.moment-rich-editor-container
    .row
      .col-xs-12.m-b-1
        router-link(:to="{path: editorUrl}")
          button.btn.btn-default 返回编辑器
    .row(v-if="documentInfo")
      .col-xs-12.col-md-3
        .box-shadow
          .moment-rich-editor-time-list-item.pointer(
            v-for="time in timeList"
            :key="time.documentId"
            @click="visitHistory(time.documentId)"
            :class="{'active': time.active}"
            )
            div {{detailedTime(time.toc)}}
            div {{time.wordCount}}字节
      .col-xs-12.col-md-9.box-shadow
        div
          strong.m-r-1() {{detailedTime(documentInfo.toc)}}
          button.btn.btn-primary.btn-xs(@click="rollback") 基于当前版本编辑
        div(v-html="documentInfo.html")
    .row(v-else)
      .col-xs-12.text-center 不存在历史版本
</template>

<script>
import {nkcAPI} from "../../../js/netAPI";
import {detailedTime} from "../../../js/time";
import FromNow from "../../FromNow.vue";
import {sweetError, sweetQuestion} from "../../../js/sweetAlert";

export default {
  components: {
    'from-now': FromNow,
  },
  data: () => ({
    momentId: '',
    timeList: [],
    editorUrl: '',
    documentInfo: null,
  }),
  mounted() {
    this.momentId = this.$route.query.id || '';
    this.documentId = this.$route.query.docId || "";
    this.getHistory();
  },
  watch: {
    '$route'(to, form) {
      this.momentId = to.query.id || '';
      this.documentId = to.query.docId || "";
      this.getHistory();
    }
  },
  methods: {
    detailedTime,
    visitHistory(documentId) {
      this.$router.push(`/z/editor/rich/history?id=${this.momentId}&docId=${documentId}`);
    },
    getHistory() {
      nkcAPI(`/api/v1/zone/editor/rich/history?momentId=${this.momentId}&documentId=${this.documentId}`, 'GET').then(res => {
        this.timeList = res.data.timeList;
        this.editorUrl = res.data.editorUrl;
        this.documentInfo = res.data.documentInfo;
      })
        .catch(sweetError);
    },
    rollback() {
      sweetQuestion(`当前操作将会覆盖正在编辑的草稿内容，且不可撤销，确定要执行吗？`)
        .then(() => {
          return nkcAPI(`/api/v1/zone/editor/rich/history/rollback`, 'POST', {
            momentId: this.momentId,
            documentId: this.documentInfo.documentId,
          })
        })
        .then(() => {
          this.$router.replace(this.editorUrl);
        })
        .catch(sweetError)
    }
  }
}
</script>

<style scoped lang="less">
@import "../../../../publicModules/base.less";
.moment-rich-editor-time-list-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  user-select: none;
  &.active{
    color: @primary;
  }
  &>div:nth-child(2){
    color: #777;
  }
}
</style>