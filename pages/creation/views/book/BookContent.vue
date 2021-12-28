<template lang="pug">
  .book-content
    .row
      .col-xs-12.col-md-12
        bread-crumb(:list="navList")
      .col-xs-12.col-md-9(v-if="bookArticle")
        h2.content-title {{bookArticle.title}}
        .content-info
          span.m-r-05 {{contentInfo}}
          button.btn.btn-xs.btn-default(@click="navToPage('articleEditor', {bid: bookId, aid: articleId})") 编辑
        .content-content(v-html="bookArticle.content")
      .col-xs-12.col-md-3
        .creation-center-book-list
          .creation-center-book-list-item(v-for="l in bookList")
            .creation-center-book-list-item-name(@click="navToPage('bookContent', {}, {bookId, aid: l._id})")
              span(v-if="!l.did") [未发布]
              span(v-else-if="l.hasBeta") [编辑中]
              | {{l.title}}
</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
  .book-content{
    .content-title{
      //font-size: 2rem;
    }
    .content-info{
      font-size: 1rem;
      color:#555;
    }
    .creation-center-book-list{
    }
    .creation-center-book-list-item{
      padding: 0.3rem;
      cursor: pointer;
      &:hover{
        background-color: #f7f7f7;
      }
    }
    .creation-center-book-list-item-name{
      span{
        font-size: 1rem;
        color: @primary;
        margin-right: 0.5rem;
      }
    }
  }
</style>

<script>
  import {sweetError} from "../../../lib/js/sweetAlert";
  export default {
    data: () => ({
      bookId: '',
      articleId: '',
      book: null,
      bookList: [],
      bookArticle: null,
    }),
    watch: {
      $route() {
        this.init();
      }
    },
    computed: {
      contentInfo() {
        const {time, mTime} = this.bookArticle;
        let mInfo = '';
        if(mTime) {
          mInfo += `，修改于 ${mTime}`;
        }
        return `创建于 ${time}${mInfo}`;
      },
      navList() {
        const {bookArticle, book} = this;
        const list = [
          {
            name: '文档创作',
            page: 'books'
          }
        ];
        if(bookArticle && book) {
          list.push({
            name: book.name,
            page: 'book',
            params: {
              bid: book._id
            }
          }, {
            name: bookArticle.title
          });
        } else {
          list.push({
            name: '加载中...'
          });
        }
        return list;
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        this.initId();
        this.getBookContent();
      },
      initId() {
        const {bid, aid} = this.$route.params;
        this.bookId = bid;
        this.articleId = aid;
      },
      navToPage(name, query = {}, params = {}) {
        this.$router.push({
          name,
          query,
          params,
        });
      },
      getBookContent() {
        nkcAPI(`/creation/book/${this.bookId}/${this.articleId}`, 'GET')
          .then(data => {
            this.bookArticle = data.bookArticle;
            this.bookList = data.bookList;
            this.book = data.bookData;
          })
          .catch(sweetError);
      }
    }
  }
</script>