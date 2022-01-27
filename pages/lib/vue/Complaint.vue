<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title 投诉或举报
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .draggable-panel-loading(v-if='loading').m-b-3 加载中...
      .draggable-panel-content(v-else)
        .complaint-body(v-if="!submitted")
          .p-a-1.m-b-1.bg-warning.text-warning.pre-wrap(v-if='tip') {{tip}}
          h5 请选择违规类型：
          div
            span.complaint-reason(
              :title="reason.description"
              v-for="reason in reasons"
              :class="{'active': reasonTypeId===reason._id}"
              @click="selectReason(reason)"
            ) {{reason.type}}
            div(v-if="!reasons.length")
              .p-t-3.p-b-3.text-center
                h4
                  b 空空如也
          textarea.form-control.complaint-input(placeholder="请清晰描述投诉或举报的理由" v-model='reasonDescription')
          .complaint-button
            button.btn.btn-block.btn-primary(v-if="reasonTypeId" @click="submit") 提交
            button.btn.btn-block.btn-primary(v-else disabled) 提交
        .complaint-body(v-else)
          .complaint-submitted.p-t-5.p-b-5
            .complaint-title
              .fa.fa-check
              span 提交成功！
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
  display: none;
  position: fixed;
  width: 50rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-dialog-close{
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover{
        background-color: rgba(0,0,0,0.08);
        color: #777;
      }
    }
    .module-dialog-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-dialog-content{
    padding: 0 1rem;
    .complaint-body{
      padding: 1rem;
    }
    .complaint-body h5{
      margin-top: 0;
    }
    .complaint-reason{
      height: 3rem;
      border-radius: 3px;
      margin: 0.5rem 0.5rem;
      display: inline-block;
      cursor: pointer;
      color: #282c37;
      font-weight: 700;
      line-height: 3rem;
      padding: 0 1rem;
      border: 1px solid #2b90d9;
      transition: background-color 100ms, color 100ms;
    }
    .complaint-reason.active{
      border: 1px solid #2b90d9;
      color: #fff;
      background-color: #2b90d9;
    }
    .complaint-input{
      margin-top: 1rem;
      height: 10rem!important;
    }
    .complaint-button{
      margin: 1rem 0;
    }
    .complaint-button button{
      background-color: #2b90d9;
      border-color: #2b90d9;
    }
    .complaint-title{
      font-size: 1.7rem;
      font-weight: 700;
      text-align: center;
      height: 3rem;
      line-height: 3rem;
    }
    .complaint-title .fa{
      margin-right: 0.5rem;
      vertical-align: middle;
      height: 2.5rem;
      width: 2.5rem;
      text-align: center;
      line-height: 2.5rem;
      background-color: #33c333;
      color: #fff;
      font-size: 1.6rem;
      border-radius: 50%;
    }
    .complaint-description{
      color: #282c37;
      font-size: 1.3rem;
      line-height: 2rem;
      margin-top: 4rem;
    }
  }
}
</style>

<script>
import {DraggableElement} from "../js/draggable";
import {nkcAPI} from "../js/netAPI";
export default {
  data: () => ({
    show: false,
    loading: true,
    reasonTypeId: "",
    reasonDescription: "",
    submitted: false,
    reasonType: "",
    type: "",
    id: "",
    reasons: [],
    tip: ''
  }),
  mounted() {
    this.initDraggableElement();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
    },
    getComplaintList() {
      this.loading = true;
      const self = this;
      nkcAPI('/complaint/type', 'GET', {})
      .then(res => {
        self.reasons = res.complaintTypes;
        self.loading = false;
        self.tip = res.complaintTip;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    submit: function() {
      const self = this;
      nkcAPI("/complaint", "POST", {
        type: self.type,
        id: self.commentId,
        reasonTypeId: self.reasonTypeId,
        reasonType: self.reasonType,
        reasonDescription: self.reasonDescription
      })
      .then(res => {
        self.close();
        sweetSuccess('提交成功！');
      })
      .catch(err => {
        sweetError(err);
      })
    },
    open(type, id) {
      if(!id || !type) return;
      this.type = type;
      this.getComplaintList();
      this.submitted = false;
      this.reasonTypeId = "";
      this.reasonDescription = "";
      this.commentId = id;
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      setTimeout(function() {
      }, 500);
    },
    //选择投诉类型
    selectReason(r) {
      this.reasonTypeId = r._id;
      this.reasonType = r.type;
    }
  }
}
</script>
