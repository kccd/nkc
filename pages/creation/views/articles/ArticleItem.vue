<template lang="pug">
  .article-item(:class="{'hasCover': !!article.coverUrl}")
    .article-cover(v-if="article.coverUrl" :style="'background-image: url('+article.coverUrl+')'")
    .article-body
      a.article-title(:href="article.articleUrl" target="_blank") {{article.title}}
      .article-content {{article.content}}
      .article-info
        .article-time
</template>

<style lang="less">
  @import '../../../publicModules/base';
  .article-item{
    @itemHeight: 10rem;
    @coverWidth: 14rem;
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
        font-size: 1.4rem;
        font-weight: 700;
        color: #111;
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