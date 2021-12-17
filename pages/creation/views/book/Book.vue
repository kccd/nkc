<template lang="pug">
  .row.creation-center-book
    .col-xs-12.col-md-12.m-b-2
      bread-crumb(:list="navList")
    .col-xs-12.col-md-6.col-md-offset-3(v-if="book")
      .creation-center-book-container
        .creation-center-book-cover
          img(:src="book.coverUrl")
        .creation-center-book-name {{book.name}}
        .creation-center-book-description {{book.description}}
        .creation-center-book-list
          .creation-center-book-list-item(v-for="l in list")
            .creation-center-book-list-item-name {{l.name}}
            .creation-center-book-list-item-time {{l.time}}
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(@click="navToPage('articleEditor')") 添加文章
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(@click="navToPage('bookEditor')") 设置

</template>

<style lang="less" scoped>
  @import '../../../publicModules/base';
  .creation-center-book{
    .creation-center-book-container{
      .creation-center-book-cover{
        img{
          width: 100%;
        }
        margin-bottom: 2rem;
      }
      .creation-center-book-name{
        font-size: 2rem;
        text-align: center;
        margin-bottom: 1rem;
      }
      .creation-center-book-description{
        text-align: center;
        margin-bottom: 2rem;
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
  export default {
    data: () => ({
      bid: '',
      book: null,
      list: [
        {
          name: '前言',
          time: '2021-12-02 08:23:12'
        },
        {
          name: '第一章 什么是 Javascript',
          time: '2022-12-02 18:23:12'
        },
        {
          name: '第二章 变量作用域与内存',
          time: '2024-12-02 02:33:12'
        }
      ]
    }),
    computed: {
      navList() {
        const {book, bid} = this;
        return [
          {
            name: '文档创作',
            page: 'books'
          },
          {
            name: '我的文档',
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
      navToPage(name, query) {
        this.$router.push({
          name,
          query: {
            bid: this.bid
          }
        });
      },
      getBook() {
        nkcAPI(`/creation/book/${this.bid}`, 'GET')
          .then(data => {
            this.book = data.book;
          })
          .catch(sweetError);
      }
    }
  }
</script>