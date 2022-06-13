<template lang="pug">
  .title
    .input-title(v-if="o !== 'copy'")
      mixin threadLink
        a(:href="data.thread.url" target="_blank") {{data.thread.title}}
      .editor-type-info(v-if="data.type === 'newPost'")
        div(v-if="data.thread.comment")
          .fa.fa-lightbulb-o
          span 正在评论文章《
          +threadLink
          span 》下的回复
        div(v-else)
          .fa.fa-lightbulb-o
          span 正在回复文章《
          +threadLink
          span 》
      .editor-type-info(v-else-if="data.type === 'modifyThread'")
        .fa.fa-lightbulb-o
        span 正在编辑文章《
        +threadLink
        span 》
        .on-edit-notes
          .on-edit-label 您正在修改已经发表的内容，以下提示非常重要，请务必详读123。
            a.detail(@click="openOnEditNotes = !openOnEditNotes") {{openOnEditNotes ? "收起":"展开"}}
          .on-edit-note-content(v-if="openOnEditNotes" ) {{notice}}
        //- .on-edit-note-content(v-if="openOnEditNotes")!=nkcRender.plainEscape(state.editorSettings.onEditNotes)
      .editor-type-info(v-else-if="data.type === 'modifyPost'")
        .fa.fa-lightbulb-o
        span 正在编辑文章《
        +threadLink
        span(v-if="data.thread.comment") 》下的评论
        span(v-else) 》下的回复
        .on-edit-notes
          .on-edit-label 您正在修改已经发表的内容，以下提示非常重要，请务必详读。
            a.detail(@click="openOnEditNotes = !openOnEditNotes") {{openOnEditNotes ?  "收起":"展开"}}
          .on-edit-note-content(v-if="openOnEditNotes") {{notice}}
        //- .on-edit-note-content(v-if="openOnEditNotes")!=nkcRender.plainEscape(state.editorSettings.onEditNotes)
    input.editor-title(placeholder="请输入标题..." v-model="titleValue" )
</template>
<script>
import { debounce } from '../../lib/js/execution';

export default {
  props: {
    data: {
      required: true,
      type: Object
    },
    notice: {
      required: true,
      type: String
    },
    o: {
      type: String,
    }
  },
  data: () => ({
    titleValue: "",
    openOnEditNotes: localStorage.getItem("open-on-edit-notes") === "yes",
    titleChangeDebounce: ''
  }),
  created() {
    // this.debounce = debounce

  },
  mounted() {
    this.titleChangeDebounce = debounce(this.titleChange, 2000);

  },
  watch: {
    openOnEditNotes(boolean) {
      localStorage.setItem("open-on-edit-notes", boolean ? "yes" : "no");
    },
    data: {
      immediate: true,
      handler(n) {
        this.titleValue = n?.post?.t || "";
      }
    },
    titleValue(n) {
      if (n.trim()) {
        this.titleChangeDebounce()
      }
    }
  },
  methods: {
    getData() {
      return { t: this.titleValue };
    },
    titleChange(){
      console.log('emit')
    }
  }
};
</script>
<style scoped lang="less">
.on-edit-notes .on-edit-label {
  padding: 6px 0;
  cursor: pointer;
  font-weight: bold;
}
.editor-title {
  margin-bottom: 15px;
  width: 100%;
  display: block;
  height: 5rem;
  padding: 0;
  font-size: 2rem;
  box-shadow: none;
  border: none;
  border-bottom: 1px solid #f4f4f4;
}
.editor-title:focus {
  outline: none;
}
.editor-type-info {
  font-size: 1.2rem;
  color: #888;
  margin-bottom: 1rem;
}
.editor-type-info .fa {
  margin-right: 0.3rem;
}
.on-edit-notes {
  margin-top: 1rem;
  color: #333;
  .on-edit-label {
    padding: 6px 0;
    cursor: pointer;
    font-weight: bold;
    .detail {
      text-decoration: underline;
    }
  }
  .on-edit-note-content {
    color: #414141;
  }
}
</style>
