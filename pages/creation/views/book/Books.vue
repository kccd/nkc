<template lang="pug">
  .creation-center-books
    .creation-center-books-header
      span.h2.m-r-1 我的文档
      button.btn.btn-default.btn-sm(@click="navToPage('bookCreator')") 新建文档
    .creation-center-books-list
      .creation-center-book-item(v-for="book in books" @click="navToPage('book', {bid: book._id})")
        .creation-center-book-cover(:style="`background-image:url(${book.coverUrl})`")
        .creation-center-book-info
          .creation-center-book-name {{book.name}}
          .creation-center-book-description {{book.description}}
          .creation-center-book-time {{book.time}}

</template>

<style lang="less" scoped>
  .creation-center-books{
    .creation-center-books-header{
      margin-bottom: 2rem;
    }
    .creation-center-books-list{
      .creation-center-book-item{
        @itemHeight: 5rem;
        @coverWidth: 8rem;
        cursor: pointer;
        margin-bottom: 1rem;
        position: relative;
        height: @itemHeight;
        overflow: hidden;
        padding-left: @coverWidth + 1rem;
        .creation-center-book-cover{
          height: @itemHeight;
          width: @coverWidth;
          position: absolute;
          top: 0;
          left: 0;
          background-size: cover;
          background-color: #aaa;
        }
        .creation-center-book-info{
          .creation-center-book-name{
            font-size: 1.3rem;
            font-weight: 700;
          }
          .creation-center-book-description{
            color: #555;
          }
          .creation-center-book-time{
            font-size: 1rem;
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
      books: []
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