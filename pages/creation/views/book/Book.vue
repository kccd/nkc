<template lang="pug">
  .container-fluid.creation-center-book
    .m-b-1
      bread-crumb(:list="navList")
    .creation-center-book-container.standard-container(v-if="book")
      .creation-center-book-cover
        img(:src="book.coverUrl")
      .creation-center-book-name {{book.name}}
      .creation-center-book-description {{book.description}}
      .creation-center-author
        user-group(:users="bookMembers")
      .creation-center-book-list
        .creation-center-book-list-item(v-for="l in bookList")
          .creation-center-book-list-item-name(@click="clickArticleTitle(l)")
            span(v-if="!l.published") [未发布]
            span(v-else-if="l.hasBeta") [编辑中]
            | {{l.title}}
          .creation-center-book-list-item-time {{l.time}}
      button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(@click="navToPage('articleEditor', {bid})") 撰写文章
      a.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(:href="getUrl('book', bid)" target="_blank") 阅读图书
      button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(@click="navToPage('bookEditor', {bid})") 设置
    .row.m-b-3(v-if="book")
      .col-xs-12.col-md-6.col-md-offset-3
        .creation-center-book-container
          .creation-center-book-cover
            img(:src="book.coverUrl")
          .creation-center-book-name {{book.name}}
          .creation-center-book-description {{book.description}}
          .creation-center-book-list
            .creation-center-book-list-item(v-for="l in bookList")
              .creation-center-book-list-item-name(@click="clickArticleTitle(l)")
                span(v-if="!l.published") [未发布]
                span(v-else-if="l.hasBeta") [编辑中]
                | {{l.title}}
              .creation-center-book-list-item-time {{l.time}}
          button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(@click="navToPage('articleEditor', {bid})") 撰写文章
          button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(@click="navToPage('bookEditor', {bid})") 设置

</template>

<style lang="less" scoped>
  @import '../../../publicModules/base';
  .creation-center-book{
    .creation-center-author{
      text-align: center;
      margin-bottom: 1rem;
    }
    .creation-center-book-cover{
      width: 100%;
      img{
        width: 100%;
      }
      margin-bottom: 2rem;
    }
    .creation-center-book-container{

      .creation-center-book-name{
        font-size: 2rem;
        text-align: center;
        margin-bottom: 1rem;
      }
      .creation-center-book-description{
        text-align: center;
        margin-bottom: 1rem;
      }
      .creation-center-book-list-selector{

      }
      .creation-center-book-list{
        margin-bottom: 2rem;
        .creation-center-book-list-item{
          @itemHeight: 3rem;
          @timeWidth: 11rem;
          padding-right: @timeWidth + 1rem;
          line-height: @itemHeight;
          height: @itemHeight;
          overflow: hidden;
          position: relative;
          background-color: #fff;
          cursor: pointer;
          transition: background-color 200ms;
          &:hover{
            background-color: #f4f4f4;
          }
          .creation-center-book-list-item-name{
            display: inline-block;
            height: 100%;
            .hideText(@line: 1);
            font-size: 1.3rem;
            span{
              font-size: 1rem;
              color: @primary;
              margin-right: 0.5rem;
            }
          }
          .creation-center-book-list-item-time{
            width: @timeWidth;
            position: absolute;
            top: 0;
            right: 0;
            height: @itemHeight;
          }
        }
      }
    }
  }
</style>

<script>
  import {nkcAPI} from "../../../lib/js/netAPI";
  import {getUrl} from "../../../lib/js/tools";
  import UserGroup from '../../../lib/vue/UserGroup';
  export default {
    components: {
      'user-group': UserGroup
    },
    data: () => ({
      bid: '',
      book: null,
      bookList: [],
      bookMembers: [],
    }),
    computed: {
      navList() {
        const {book, bid} = this;
        return [
          {
            name: '图书创作',
            page: 'books'
          },
          {
            name: book? book.name: `加载中...`
          }
        ]
      }
    },
    mounted() {
      this.bid = this.$route.params.bid;
      this.getBook();
    },
    methods: {
      getUrl: getUrl,
      navToPage(name, query = {}, params = {}) {
        this.$router.push({
          name,
          query,
          params,
        });
      },
      clickArticleTitle(l) {
        const {bid} = this;
        const aid = l._id;
        if(!l.published) {
          this.navToPage('articleEditor', {bid, aid})
        } else {
          this.navToPage('bookContent', {}, {bid, aid})
        }
      },
      switchContent(id) {
        this.$router.push({
          name: 'bookContent',
          params: {
            bid: this.bid,
            id,
          }
        })
      },
      getBook() {
        let url = `/creation/book/${this.bid}`;
        const self = this;
        nkcAPI(url, 'GET')
          .then(data => {
            self.book = data.bookData;
            self.bookList = data.bookList;
            self.bookMembers = data.bookMembers;
          })
          .catch(sweetError);
      }
    }
  }
</script>
