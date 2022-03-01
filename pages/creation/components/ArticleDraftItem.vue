<template lang="pug">
  .article-draft-item(:class="{'hasCover': !!draft.coverUrl}")
    .article-draft-cover(v-if="draft.coverUrl" :style="'background-image: url('+draft.coverUrl+')'")
    .article-draft-body
      .article-draft-title
        a(:href="draft.articleEditorUrl" target="_blank") {{draft.title}}
      //.article-draft-content {{draft.content}}
      .article-draft-info
        .article-draft-time {{draft.time}}
        .article-draft-from {{draft.type === 'create'? '新写文章': '修改文章'}}
      .article-draft-options
        .article-draft-option(@click="navToEditor(draft)") 继续创作
        .article-draft-option(@click="removeDraft(draft)") 删除
</template>

<style lang="less">
@import '../../publicModules/base';
.article-draft-item{
  @itemHeight: 7rem;
  @coverWidth: 10rem;
  position: relative;
  &.hasCover{
    padding-left: @coverWidth + 1rem;
  }
  .article-draft-cover{
    height: @itemHeight;
    width: @coverWidth;
    top: 0;
    left: 0;
    position: absolute;
    background-size: cover;
    border-radius: 3px;
  }
  .article-draft-body{
    .article-draft-title{
      height: 2rem;
      line-height: 2rem;
      .hideText(@line: 1);
      margin-bottom: 0.8rem;
      a{
        font-size: 1.6rem;
        font-weight: 700;
        color: #333;
      }
    }
    .article-draft-info{
      margin-bottom: 0.8rem;
      &>div{
        display: inline-block;
        margin-right: 0.5rem;
      }
      .article-draft-time{
        display: inline-block;
      }
      .article-draft-count{
        display: inline-block;
      }
    }
    .article-draft-options{
      .article-draft-option{
        display: inline-block;
        margin-right: 1rem;
        cursor: pointer;
        &:active{
          color: @primary;
        }
      }
    }
  }
}
</style>

<script>
import {visitUrl} from "../../lib/js/pageSwitch";
import {sweetQuestion} from "../../lib/js/sweetAlert";

export default {
  props: ['draft'],
  data: () => ({

  }),
  methods: {
    navToEditor(draft) {
      visitUrl(draft.articleEditorUrl, true);
    },
    removeDraft(draft) {
      const self = this;
      sweetQuestion(`草稿被删除后无法恢复，确定要删除吗？`)
        .then(() => {
          const url = `/creation/article/${draft.articleId}/draft`;
          return nkcAPI(url, 'DELETE')
        })
        .then(() => {
          self.sendMessageToRemoveItem();
          sweetSuccess('操作成功');
        })
        .catch(sweetError);
    },
    sendMessageToRemoveItem() {
      this.$emit("delete");
    }
  }
}
</script>
