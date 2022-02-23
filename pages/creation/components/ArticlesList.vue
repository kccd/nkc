<template lang="pug">
  .articles-list
    .article-item-container(v-for="article in articles")
      article-item(:article="article")
</template>

<style lang="less">
  .articles-list{
    .article-item-container{
      margin-bottom: 2rem;
    }
    & .article-item-container:last-child{
      margin-bottom: 0.5rem;
    }
  }

</style>

<script>
  import ArticleItem from './ArticleItem';
  export default {
    components: {
      'article-item': ArticleItem
    },
    props: ['articles'],
    data: () => ({

    })
}
</script>