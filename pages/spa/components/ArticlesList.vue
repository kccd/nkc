<template lang="pug">
  .articles-list
    .article-item-container(v-for="(article, index) in articles")
      .row
        .article-item-status.col-md-6(:class="articleStatus(article.status)")
          .article-status-content(v-if="articleStatusContent(article.status)" ) {{articleStatusContent(article.status)}}
      article-item(:article="article" @delete="deleteItem(index)" @refresh="initData")
</template>

<style lang="less">
  .articles-list{
    .article-item-container{
      margin-bottom: 2rem;
      .article-status-content{
        padding: 0.3rem 0 0.3rem 0;
        color: #fff;
        font-size: 1.2rem;
        text-align: center;
      }
      .article-unknown{
        background-color: #e85a71;
      }
      .article-faulty{
        background-color: #ff5a0b;
      }
      .article-disabled{
        background-color: #8f8f8f;
      }
      .article-cancelled{
        background-color: #8f8f8f;
      }
      .article-default{
        background-color: #8f8f8f;
      }
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

    }),
    methods: {
      deleteItem(index) {
        this.$emit('delete', index);
      },
      initData(){
        this.$emit('refresh');
      },
      articleStatusContent(status){
        let showContent='';
        // normal: 'normal',// 正常
        //   'default': 'default',// 默认状态 创建了article但未进行任何操作
        //   disabled: 'disabled', //禁用
        //   faulty: 'faulty', //退修
        //   unknown: 'unknown',// 未审核
        //   deleted: 'deleted',//article被删除
        //   cancelled: 'cancelled'// 取消发布
        switch (status){
          case 'faulty':
            // 退修
            showContent='本文已被退回修改,点击文章查看详情';
            break;
          case 'unknown':
            // 未审核
            showContent='内容未审核,点击文章查看详情';
            break;
          case 'disabled':
            // 封禁
            showContent='内容已封禁,点击文章查看详情';
            break;
          case 'cancelled':
            showContent='取消发布';
            break;
          case 'default':
            showContent='未进行任何操作';
            break;
          default:
            showContent='';
        }
        return showContent
      },
      articleStatus(status){
        let showClass='';
        switch (status){
          case 'faulty':
            // 退修
            showClass='article-faulty';
            break;
          case 'unknown':
            // 未审核
            showClass='article-unknown';
            break;
          case 'disabled':
            // 删除封禁
            showClass='article-disabled';
            break;
          case 'cancelled':
            showClass='article-cancelled';
            break;
          case 'default':
            showClass='article-default';
            break;
          default:
            showClass='';
        }
        return showClass
      }
    }
}
</script>
