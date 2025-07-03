<template lang="pug">
  .module-dialog-body(@click.stop)
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") 屏蔽{{typeName}}
      .module-dialog-close(@click.stop.prevent="close")
        .fa.fa-remove
    .module-dialog-content
      .modal-body
        .form
          .form-group.m-t-1
            label 请输入屏蔽原因：
            textarea.form-control(rows=5 placeholder="请输入原因..." v-model="reason")
          .form-group.m-b-0
            .checkbox
              label
                input(type="checkbox" :value="true" v-model="remindUser")
                span 通知用户
      .m-t-1.m-b-1.text-right
        .display-i-b(v-if="submitting") 处理中，请稍候...
        button.m-r-05(type="button" class="btn btn-default btn-sm" @click.stop.prevent="close") 关闭
        button(v-if="submitting" type="button" class="btn btn-primary btn-sm" disabled) 确定
        button(v-else type="button" class="btn btn-primary btn-sm" @click.stop.prevent="submit") 确定
</template>

<style lang="less" scoped>
@import "../../publicModules/base";

.module-dialog-body {
  text-align: left;
  display: none;
  position: fixed;
  width: 30rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;

    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }

    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
      text-align: center;
    }
  }

  .module-dialog-content {
    padding: 0 1rem;
  }
}
</style>

<script>
import { DraggableElement } from "../js/draggable";
import { nkcAPI } from "../js/netAPI";
import { sweetError, sweetSuccess } from "../js/sweetAlert";
export default {
  data: () => ({
    submitting: false,
    show: false,
    reason: '',
    remindUser: true,
    momentId: '',
    callback: undefined,
    typeName: ''
  }),
  mounted() {
    this.initDraggableElement();
  },
  destroyed() {
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      this.draggableElement.setPositionCenter()

    },
    submit: function () {
      if (!this.momentId || this.submitting) return;
      if (!this.reason) {
        return screenTopWarning('请输入屏蔽原因');
      }
      const self = this;
      this.submitting = true;
      nkcAPI(`/moment/${self.momentId}/disable`, 'POST', { reason: self.reason, remindUser: self.remindUser })
        .then(() => {
          self.close();
          sweetSuccess('操作成功');
        })
        .catch((err) => {
          sweetError(err);
        }).finally(() => {
          self.submitting = false;
        });
    },
    open(callback, options) {
      const { momentId, typeName = '' } = options;
      this.momentId = momentId;
      this.typeName = typeName
      this.callback = callback;
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      this.submitting = false;
      this.reason = '';
      this.remindUser = true;
      this.momentId = '';
      this.callback = undefined
      this.typeName = '';
      setTimeout(function () {
      }, 500);
    },
  }
}
</script>
