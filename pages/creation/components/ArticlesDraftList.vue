<template lang="pug">
  .articles-draft-list
    .article-draft-item-container(v-for="(draft, index) in drafts")
      article-draft-item(:draft="draft" @delete="deleteItem(index)")
</template>

<style lang="less">
.articles-draft-list{
  .article-draft-item-container{
    margin-bottom: 2rem;
  }
  & .article-draft-item-container:last-child{
    margin-bottom: 0.5rem;
  }
}

</style>

<script>
import ArticleDraftItem from './ArticleDraftItem';
export default {
  components: {
    'article-draft-item': ArticleDraftItem
  },
  props: ['drafts'],
  data: () => ({

  }),
  methods: {
    deleteItem(index) {
      this.$emit('delete', index);
    }
  }
}
</script>