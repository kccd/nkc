<template lang="pug">
  .on-edit-notes
      .on-edit-label 您正在修改已经发表的内容，以下提示非常重要，请务必详读。
        a.detail(@click="openOnEditNotes = !openOnEditNotes") {{openOnEditNotes? "收起":"展开"}}
      .on-edit-note-content(v-if="openOnEditNotes") {{state.editorSettings.onEditNotes notice}}
</template>

<script>
export default {
  data:()=>({
    openOnEditNotes: localStorage.getItem("open-on-edit-notes") === "yes"
  }), 
  props: {
    notice: {
      tyoe: String
    }
  },
  watch: {
    openOnEditNotes: function(val) {
      localStorage.setItem("open-on-edit-notes", val? "yes" : "no");
    }
  }
}
</script>

<style>

</style>