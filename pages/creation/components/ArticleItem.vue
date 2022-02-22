<template lang="pug">
  .article-item(:class="{'hasCover': !!article.coverUrl}")
    .article-cover(v-if="article.coverUrl" :style="'background-image: url('+article.coverUrl+')'")
    .article-body
      a.article-title(:href="article.articleUrl" target="_blank") {{article.title}}
      //.article-content {{article.content}}
      .article-info
        .article-time {{article.time}}
        .article-from 引用自社区
        .article-count 点赞 {{article.voteUp}} 阅读 {{article.hits}} 评论 {{article.comment}}
      .article-options
        .article-option 修改
        .article-option 删除
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
        margin-bottom: 0.5rem;
      }
      .article-info{
        margin-bottom: 0.5rem;
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
          margin-right: 0.5rem;
          cursor: pointer;
        }
      }
    }
  }
</style>

<script>
  export default {
    props: ['article'],
    data: () => ({

    })
  }
</script>