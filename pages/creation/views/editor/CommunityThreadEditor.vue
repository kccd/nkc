<template lang="pug">
  .standard-max-container
    .community-thread-editor 社区创作
    editor
</template>

<script>
import Editor from "../../../editor/vueComponents/Editor";
export default {
  components: {
    editor: Editor
  }
};
</script>
<style>
.m-b-2{
  padding-left:0;
}

</style>
