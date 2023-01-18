<template lang="pug">
  .module-dialog-body
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") 屏蔽内容
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .form
        .form-group
          label 方式
          .moduleDisabledPostType
            .col-xs-6(@click="type = 'toDraft'" :class="{'active':type === 'toDraft'}") 退回修改
            .col-xs-6(@click="type = 'toRecycle'" :class="{'active':type === 'toRecycle'}") 删除
        .form-group
          label 原因
          textarea.form-control(rows=5 placeholder="请输入原因..." v-model="reason")
        .form-group.m-b-0
          .checkbox
            label
              input(type="checkbox" :value="true" v-model="remindUser" :disabled='type === "toDraft"')
              span 通知用户
          .checkbox.m-b-0
            label
              input(type="checkbox" :value="true" v-model="violation")
              span 标记为违规
      .modal-footer
        .display-i-b(v-if="submitting") 处理中，请稍候...
        button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
        button(v-if="submitting" type="button" class="btn btn-primary btn-sm" disabled) 确定
        button(v-else type="button" class="btn btn-primary btn-sm" @click="submit") 确定
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.module-dialog-body{
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
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;
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
  .module-dialog-content {
    padding: 0 1rem;
    .moduleDisabledPostType{
      margin-bottom: 0.3rem;
      overflow: hidden;
    }
    .moduleDisabledPostType>div:first-child{
      border-right: 1px solid #fff;
    }
    .moduleDisabledPostType>div{
      height: 3rem;
      cursor: pointer;
      line-height: 3rem;
      text-align: center;
      color: #aaa;
      background-color: #eee;
    }
    .moduleDisabledPostType>div.active, .moduleDisabledPostType>div:hover{
      background-color: #2b90d9;
      color: #fff;
    }
  }
}
</style>
<script>
import {DraggableElement} from "../../js/draggable";
export default {
  data: () => ({
    show: false,
    submitting: false,
    type: "toDraft", // toDraft, toRecycle
    reason: "",
    remindUser: true,
    violation: true
  }),
  watch: {
    type: function() {
      if(this.type === "toDraft") {
        this.remindUser = true;
      }
    }
  },
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
    },
    submit: function() {
      if(!this.reason) return screenTopWarning("请输入原因");
      this.callback({
        type: this.type,
        reason: this.reason,
        remindUser: this.remindUser,
        violation: this.violation
      });
    },
    open(callback) {
      this.callback = callback;
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      this.unlock();
    },
    lock() {
      this.submitting = true;
    },
    unlock() {
      this.submitting = false;
    }
  }
}
</script>
