<template lang="pug">
  mixin bookList(bookListName)
    .creation-center-books-list
      .creation-center-book-item(v-for=("book in " + bookListName) @click="navToPage('book', {bid: book._id})")
        .creation-center-book-cover(:style="`background-image:url(${book.coverUrl})`")
        .creation-center-book-info
          .creation-center-book-name {{book.name}}
          .creation-center-book-description {{book.description}}
          .creation-center-book-time {{book.time}}
  .creation-center-books
    .creation-center-books-header
      span.h2.m-r-1 图书创作
    .m-b-1
      span.h4.m-r-1 我创建的图书
      button.btn.btn-default.btn-xs(@click="navToPage('bookEditor')") 创建新图书
    +bookList("books")
    .m-b-1
      span.h4.m-r-1 我参与创作的图书
    +bookList("otherBooks")
</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
  .creation-center-books{
    .creation-center-books-header{
      margin-bottom: 2rem;
    }
    .creation-center-books-list{
      .creation-center-book-item{
        @coverHeight: 6rem;
        @itemWidth: 16rem;
        border: 1px solid #f4f4f4;
        margin: 0 1rem 1rem 0;
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
            font-size: 1.25rem;
            font-weight: 700;
            .hideText(@line: 2);
          }
          .creation-center-book-description{
            color: #555;
            height: 3rem;
            font-size: 1rem;
            .hideText(@line: 2);
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
  import {nkcAPI} from "../../../lib/js/netAPI";

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