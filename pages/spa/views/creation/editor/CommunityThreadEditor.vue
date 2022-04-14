<template lang="pug">
  div
    .community-thread-editor
    editor
</template>

<script>
import Editor from "../../../../editor/vueComponents/Editor";
export default {
  components: {
    editor: Editor
  },
};
</script>
<style lang="less" scoped>
.community-thread-editor{
  padding-bottom: 10px;
}
</style>
