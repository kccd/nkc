<template lang="pug">
  .community-a
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
.community-a{
  padding-left: 30px;
}

</style>
