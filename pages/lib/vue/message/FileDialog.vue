<template>
  <div class="dialog" v-if="dialogVisible">
    <div class="dialog-mask" @click="handleMaskClick"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <span class="dialog-title">{{ title }}</span>
        <span class="dialog-close" @click="handleCloseClick">×</span>
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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(127, 127, 127, 0.5);
}

.dialog-content {
  display: flex;
  flex-direction: column;
  width: 30rem;
  max-width: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1200;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  font-size: 12px;
  font-weight: bold;
  border-bottom: 1px solid #e6e6e6;
}

.dialog-title {
  flex: 1;
}

.dialog-close:hover {
  cursor: pointer;
}

.dialog-body {
  flex: 1;
  padding: 16px;
  align-items: center;
  justify-content: center;
  display: flex;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e6e6e6;
}

.dialog-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

</style>
