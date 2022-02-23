<template lang="pug">
  .article-item(:class="{'hasCover': !!article.coverUrl}")
    .article-cover(v-if="article.coverUrl" :style="'background-image: url('+article.coverUrl+')'")
    .article-body
      a.article-title(:href="article.articleUrl" target="_blank") {{article.title}}
      //.article-content {{article.content}}
      .article-info
        .article-time {{article.time}}
        .article-from 发表
        .article-count 点赞 {{article.voteUp}} 阅读 {{article.hits}} 评论 {{article.comment}}
      .article-options
        .article-option(@click="navToEditor(article)") 修改
        .article-option(@click="removeArticle(article)") 删除
</template>

<style lang="less">
  @import '../../publicModules/base';
  .article-item{
    @itemHeight: 7rem;
    @coverWidth: 10rem;
    position: relative;
    &.hasCover{
      padding-left: @coverWidth + 1rem;
    }
    .article-cover{
      height: @itemHeight;
      width: @coverWidth;
      top: 0;
      left: 0;
      position: absolute;
      background-size: cover;
      border-radius: 3px;
    }
    .article-body{
      .article-title{
        font-size: 1.6rem;
        font-weight: 700;
        color: #333;
        height: 2rem;
        line-height: 2rem;
        .hideText(@line: 1);
        margin-bottom: 0.8rem;
      }
      .article-info{
        margin-bottom: 0.8rem;
        &>div{
          display: inline-block;
          margin-right: 0.5rem;
        }
        .article-time{
          display: inline-block;
        }
        .article-count{
          display: inline-block;
        }
      }
      .article-options{
        .article-option{
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
  import {getUrl} from "../../lib/js/tools";

  import {sweetQuestion} from "../../lib/js/sweetAlert";

  export default {
    props: ['article'],
    data: () => ({

    }),
    methods: {
      navToEditor(article) {
        const url = getUrl('columnArticleEditor', article.column._id, article.articleId);
        visitUrl(url, true);
      },
      removeArticle() {
        sweetQuestion(`确定要删除文章？当前操作不可恢复。`)
          .then(() => {

          })
          .catch(sweetError);
      }
    }
  }
</script>