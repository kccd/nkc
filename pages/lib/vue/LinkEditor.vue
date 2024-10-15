<template lang="pug">
  draggable-dialog(ref='draggableDialog' width="30rem" height="25rem" heightXS="70%" title="编辑链接")
    .form.p-l-1.p-r-1.p-t-05
      .form-group.m-b-05
        span 文本内容
        input.form-control(type='text' v-model='text')
      .form-group.m-b-05
        span 链接地址
        input.form-control(type='text' v-model='href')
      .form-group.m-b-05
        span 标题
        input.form-control(type='text' v-model='rel')  
      .form-group.m-b-05.user-select-none
        .checkbox
          label
            input(type='checkbox' v-model='newWindow' value="true")  
            span 在新窗口打开
      .form-group.text-right
        button.btn.btn-default.btn-sm.m-r-1(@click='close') 取消
        button.btn.btn-primary.btn-sm(:disabled='!href' @click='submit') 确定       

</template>

<script>
import DraggableDialog from './DraggableDialog/DraggableDialog.vue';
export default {
  components: {
    'draggable-dialog': DraggableDialog,
  },
  data: () => ({
    newWindow: true, 
    text: '',
    href: '',
    rel: '',
    callback: null,
  }),
  methods: {
    open(callback, options) {
      this.callback = callback;
      this.$refs.draggableDialog.open();
      const {
        newWindow = true,
        text = '新链接',
        href = '',
        rel = '',
      } = options || {};
      this.newWindow = newWindow;
      this.text = text;
      this.href = href;
      this.rel = rel;
    },
    close(){
      this.$refs.draggableDialog.close();
    },
    submit() {
      if(!this.callback) return;
      this.callback({
        newWindow: this.newWindow,
        text: this.text,
        href: this.href,
        rel: this.rel,
      });
    }
  }
}
</script>