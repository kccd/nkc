<template>
  <div class="dialog" v-if="dialogVisible">
    <div class="dialog-mask" @click="handleMaskClick"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <span class="dialog-title">{{ title }}</span>
        <span class="dialog-close fa fa-remove" @click="handleCloseClick"></span>
      </div>
      <div class="dialog-body">
        <slot></slot>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-default btn-sm m-r-05" @click="handleCloseClick">
          取消
        </button>
        <button class="btn btn-primary btn-sm" @click="handleConfirmClick">
          确定
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  data: () => ({}),
  props: {
    //是否展示dialog
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    //dialog的标题
    title: {
      type: String,
      default: 'Dialog',
    },
    //是否启用遮阴层点击就关闭
    cancelable: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {},
  methods: {
    //取消
    handleCloseClick() {
      this.$emit('updateDialogVisible', false);
    },
    //确认
    handleConfirmClick() {
      this.$emit('confirm');
      this.handleCloseClick();
    },
    //外部遮阴层点击就会关闭dialog
    handleMaskClick() {
      if (this.cancelable) {
        this.handleCloseClick();
      }
    },
  },
};
</script>
<style lang="less" scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(127, 127, 127, 0.5);
  z-index: 1001;
}

.dialog-content {
  width: 30rem;
  height: 25rem;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  max-width: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1200;

}

.dialog-header {
  @headerHeight: 3rem;
  height: @headerHeight;
  line-height: @headerHeight;
  border-bottom: 1px solid #e6e6e6;
  padding-left: 1rem;
  position: relative;
  .dialog-close{
    position: absolute;
    height: @headerHeight;
    width: @headerHeight;
    line-height: @headerHeight;
    text-align: center;
    top: 0;
    right: 0;
    cursor: pointer;
    &:hover{
      background-color: #f0f0f0;
    }
  }
}


.dialog-body {
  padding: 1rem;
  height: 18rem;
  overflow: auto;
}

.dialog-footer {
  padding: 1rem;
  text-align: right;
  border-top: 1px solid #e6e6e6;
}

</style>
