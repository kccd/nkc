<template lang="pug">
  .standard-max-container
    .community-thread-editor 社区创作
    editor
</template>

<script>
import Editor from "../../../../editor/vueComponents/Editor";
export default {
  components: {
    editor: Editor
  }
};
</script>
<style lang="less">
.m-b-2{
  padding-left:0;
}
.community-thread-editor{
  padding-bottom: 10px;
}
// 编辑器的编辑工具栏不设置定位
#edui1_toolbarbox.edui-default {
  position: static;
  background-color: rgba(250, 250, 250, 0.95) !important;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
  border: none;
  border-bottom: 1px solid #dbdbdb;
  padding: 0.5rem 0;

}
#edui1 {
  border: none;
}
</style>
