<template lang="pug">
  mixin bookList(bookListName)
    .creation-center-books-list
      .creation-center-book-item(v-for=("book in " + bookListName) @click="navToPage('book', {bid: book._id})")
        .creation-center-book-cover(:style="`background-image:url(${book.coverUrl})`")
        .creation-center-book-info
          .creation-center-book-name {{book.name}}
          .creation-center-book-description(:title="book.description") {{book.description}}
          .creation-center-book-time {{book.time}}
  .standard-not-centered.creation-center-books
    .creation-center-books-header
      span.m-r-1 我创建的专题
      button.btn.btn-default.btn-xs(@click="navToPage('bookEditor')") 创建新专题
    .m-b-1
      +bookList("books")
    .creation-center-books-header
      span.m-r-1 我参与创作的专题
    .m-b-1
      +bookList("otherBooks")
</template>

<style lang="less" scoped>
  @import "../../../../publicModules/base";
  .creation-center-books{
    .creation-center-books-header{
      margin-bottom: 1rem;
      span{
        font-size: 1.6rem;
      }
    }
    .creation-center-books-list{
      .creation-center-book-item{
        @coverHeight: 8rem;
        @itemWidth: 22rem;
        background-color: #fff;
        border: 1px solid #eee;
        margin: 0 1rem 1rem 0;
        text-align: center;
        border-radius: 3px;
        display: inline-block;
        cursor: pointer;
        position: relative;
        width: @itemWidth;
        overflow: hidden;
        .creation-center-book-cover{
          height: @coverHeight;
          width: 100%;
          background-size: cover;
          background-color: #aaa;
          margin-bottom: 1rem;
        }
        .creation-center-book-info{
          padding: 0 0.5rem;
          .creation-center-book-name{
            height: 2rem;
            margin-bottom: 1rem;
            //background-color: red;
            font-size: 1.5rem;
            //font-weight: 700;
            .hideText(@line: 1);
          }
          .creation-center-book-description{
            color: #555;
            height: 1.4rem;
            font-size: 1rem;
            .hideText(@line: 1);
            margin-bottom: 1rem;
          }
          .creation-center-book-time{
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }
        }
      }
    }
  }
</style>

<script>
  import {nkcAPI} from "../../../../lib/js/netAPI";

  export default {
    data: () => ({
      books: [],
      otherBooks: []
    }),
    mounted() {
      this.getBooks();
    },
    methods: {
      getBooks() {
        const self = this;
        nkcAPI(`/creation/books`, 'GET')
          .then(data => {
            self.books = data.books;
            self.otherBooks = data.otherBooks;
          })
          .catch(sweetError);
      },
      navToPage(name, params) {
        this.$router.push({
          name,
          params,
        });
      }
    }
  }
</script>
