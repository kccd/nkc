<template lang="pug">
  .title
    .editor-type-info(v-if="data.type === 'newPost'")
      .fa.fa-lightbulb-o {{data.thread.comment ? "|正在回复文章《" : "|正在评论文章《"}}
      a(:href="data.thread.url" target="_blank") {{data.thread.title}} {{!data.thread.comment ? "|》" : "|》下的回复"}}
    .editor-type-info(v-else-if="data.type === 'modifyThread'")
      .fa.fa-lightbulb-o
      |正在编辑文章《
      a(:href="data.thread.url" target="_blank") {{data.thread.title}}
      |》
      .on-edit-notes
      .on-edit-label 您正在修改已经发表的内容，以下提示非常重要，请务必详读。
        a.detail(@click="openOnEditNotes = !openOnEditNotes") {{openOnEditNotes ? "收起":"展开"}}
      .on-edit-note-content(v-if="openOnEditNotes" ) {{state.editorSettings.onEditNotes}}
      //- .on-edit-note-content(v-if="openOnEditNotes")!=nkcRender.plainEscape(state.editorSettings.onEditNotes)
    .editor-type-info(v-else-if="data.type === 'modifyPost'")
      .fa.fa-lightbulb-o
      |正在编辑文章《
      a(:href="data.thread.url" target="_blank") {{data.thread.title}} | 》下的{{data.thread.comment ? "| 评论" : "| 回复"}}
      .on-edit-notes
      .on-edit-label 您正在修改已经发表的内容，以下提示非常重要，请务必详读。
        a.detail(@click="openOnEditNotes = !openOnEditNotes") {{openOnEditNotes ?  "收起":"展开"}}
      .on-edit-note-content(v-if="openOnEditNotes") {{state.editorSettings.onEditNotes}}
      //- .on-edit-note-content(v-if="openOnEditNotes")!=nkcRender.plainEscape(state.editorSettings.onEditNotes)
    .editor-type-info(v-else-if='data.type === "modifyForumDeclare"')
      .fa.fa-lightbulb-o
      | 正在编辑&nbsp;
      a(:href="data.forum.url" target="_blank") {{data.forum.title}}
      | &nbsp;的专业说明
    .editor-type-info(v-else-if='data.type === "modifyForumLatestNotice"')
      .fa.fa-lightbulb-o
      | 正在编辑&nbsp;
      a(:href="data.forum.url" target="_blank") {{data.forum.title}}
      | &nbsp;的最新页板块公告
    input.editor-title(placeholder="请输入标题..." id="title" v-model="titleValue" @change="getTitleValue()" )  
    hr
</template>
<script>
export default {
  props: {
    data: {
      required: true,
      type: Object,
    },
    state:{
      required: true,
      type: Object,
    }
  },
  data: () => ({
    titleValue: "",
    openOnEditNotes: localStorage.getItem("open-on-edit-notes") === "yes",
  }),
  watch: {
    openOnEditNotes(boolean) {
      localStorage.setItem("open-on-edit-notes", boolean ? "yes" : "no");
    },
  },
  methods: {
    getData() {
      return {t: this.titleValue};
    },
  },
};
</script>
<style scoped>
</style>