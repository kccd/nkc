<template lang="pug">
  .article-item(:class="{'hasCover': !!article.coverUrl}")
    .article-cover(v-if="article.coverUrl" :style="'background-image: url('+article.coverUrl+')'")
    .article-body
      .article-title
        a(:href="article.articleUrl" target="_blank") {{article.title}}
      .article-info
        .article-time {{article.time}}
        .article-from 发表
        .article-count 点赞 {{article.voteUp}} 阅读 {{article.hits}} 评论 {{article.comment}}
      .article-options(v-if=" article.articleSource === 'column' ")
        .article-option(v-if=" article.status==='normal' " @click="contribute") 投稿
        .article-option(v-if="article.articleSourceId" @click="disContribute") 撤稿
        .article-option(v-if="!article.articleSourceId" @click="navToEditor(article)") 修改
        .article-option(v-if="!article.articleSourceId&&article.status!=='disabled' " @click="deleteArticle(article)") 删除
        .article-option(v-if=" article.status==='normal' " @click="navToContribute(article)") 投撤记录
      .article-options(v-else)
        .article-option(@click="navToEditor(article)") 修改
        .article-option(@click="deleteArticle(article)") 删除
      submit-column(ref="submitColumn" @change-column="changeColumn")
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
  import SubmitColumn from "../../editor/vueComponents/SubmitColumn";
  import { nkcAPI } from "../../lib/js/netAPI";
  import {visitUrl} from "../../lib/js/pageSwitch";
  import {sweetQuestion} from "../../lib/js/sweetAlert";

  export default {
    props: ['article'],
    data: () => ({

    }),
    components:{
    'submit-column': SubmitColumn,
    },
    methods: {
      navToEditor(article) {
        visitUrl(article.articleEditorUrl, false);
      },
      navToContribute(article){
        visitUrl(`/account/contribute?articleId=${article.articleId}`, true);
      },
      deleteArticle(article) {
        const self = this;
        sweetQuestion(`确定要删除文章？当前操作不可恢复。`)
          .then(() => {
            return nkcAPI(`/article/${article.articleId}`, 'DELETE')
          })
          .then(() => {
            self.$emit('delete');
            sweetSuccess('操作成功');
          })
          .catch(sweetError);
      },
      contribute(){
      //console.log(this.article);
      const self =this;
      this.$refs.submitColumn.close();
      this.$refs.submitColumn.open(
        function(data) {
          // self.columnId = data.columns[0]._id;
          // self.column = data.columns[0];
          // self.categoryChange();
          // self.submit(data.mainCategoriesId,data.minorCategoriesId,data.columns[0]);
          const mainCategoriesId = data.mainCategoriesId;
          const minorCategoriesId = data.minorCategoriesId;
          const column = data.columns[0];
          if(!mainCategoriesId || mainCategoriesId.length === 0){
            return sweetError("未选择分类");
          } 
          nkcAPI("/m/" + column._id + "/contribute", "POST", {
            articlesId: [self.article.articleId],
            mainCategoriesId: [...mainCategoriesId],
            minorCategoriesId: [...minorCategoriesId],
            threadsId:[],
            description:''
          })
            .then(function() {
              sweetSuccess('发送投稿申请成功');
            })
            .catch(err=>{
              sweetError(err);
            });
        },
        {
          retreatArticle:self.article,
          articleId:self.article.articleId,
          currentTab:{name:'contribute',title:'投稿'},
        }
      );
      },
      disContribute(){
      // console.log(this.article);
      const self = this;
      this.$refs.submitColumn.close();
      this.$refs.submitColumn.open(
        function(data) {
        },
        {
          retreatArticle:self.article,
          articleId:self.article.articleId,
          currentTab:{name:'contributed',title:'已投稿'},
        }
      );
      },
      changeColumn(data){
        const { column, contributeColumns} = data;
        let tempArticle = this.article;
        // if(column.length>0){
          if(column){
            tempArticle.column = [...column];
          }
          if(contributeColumns){
            tempArticle.contributeColumns = [...contributeColumns];
          }
          if(tempArticle.column.length===0){
            tempArticle.articleSourceId='';
          }
          this.article = tempArticle;
        // }
      },
    }
  }
</script>
