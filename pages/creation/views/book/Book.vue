<template lang="pug">
.creation-center-book
  bread-crumb(:list="navList")
  .row(v-if="book")
    .col-xs-12.col-md-6.col-md-offset-3
      .creation-center-book-container
        .creation-center-book-cover
          img(:src="book.coverUrl")
        .creation-center-book-name {{ book.name }}
        .creation-center-book-description {{ book.description }}
        .creation-center-book-list
          Tree(:data="extendedData", :bid="bid")
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
          @click="navToPage('articleEditor', { bid })"
        ) 撰写文章
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
          @click="navToPage('bookEditor', { bid })"
        ) 设置
  MoveDirectoryDialog(
    :bid="bid",
    :changeStatus="changeStatus"
  )
  AddDialog
</template>

<style lang="less" scoped>
* {
  list-style: none;
  padding: 0;
  margin: 0;
}
.articleTitl {
  cursor: pointer;
  color: black !important;
  font-size: 1.2rem !important;
}
@import "../../../publicModules/base";
.creation-center-book {
  .creation-center-book-container {
    .creation-center-book-cover {
      img {
        width: 100%;
      }
      margin-bottom: 2rem;
    }
    .creation-center-book-name {
      font-size: 2rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    .creation-center-book-description {
      text-align: center;
      margin-bottom: 2rem;
    }
    .creation-center-book-list-selector {
    }
    .creation-center-book-list {
      margin-bottom: 2rem;
      .creation-center-book-list-item {
        @itemHeight: 3rem;
        @timeWidth: 11rem;
        padding-right: @timeWidth + 1rem;
        line-height: @itemHeight;
        // height: @itemHeight;
        overflow: hidden;
        position: relative;
        background-color: #fff;
        // cursor: pointer;
        transition: all 200ms;
        &:hover {
          background-color: #f4f4f4;
        }
        .creation-center-book-list-item-name {
          display: inline-block;
          height: 100%;
          .hideText(@line: 1);
          font-size: 1.3rem;
          span {
            display: inline-block;
            font-size: 1rem;
            color: @primary;
            margin-right: 0.5rem;
          }
          .creation-gt {
            transition: all 0.3s ease;
            cursor: pointer;
            margin-left: 1rem;
            font-size: 1rem;
          }
        }
        .creation-center-book-list-item-time {
          // width: 26rem;
          text-align: right;
          position: absolute;
          top: 0;
          right: 0;
          height: @itemHeight;
          span {
            cursor: pointer;
            font-size: 1rem;
            margin-left: 10px;
            text-align: right;
          }
        }
        .creation-add-list {
          background-color: rgba(red, green, blue, 0.2);
          width: 145%;
          li {
            text-align: center;
            line-height: 2rem;
            // height: 80%;
            font-size: 1rem;
          }
          .add-chapter {
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
          }
        }
        .children {
          display: flex;
          .child {
            display: flex;
            justify-content: space-between;
          }
        }
      }
    }
  }
}
</style>

<script>
import { nkcAPI, nkcUploadFile } from "../../../lib/js/netAPI";
import MoveDirectoryDialog from "../../component/MoveDirectoryDialog.vue";
import Tree from "../../component/tree/Tree.vue";
import { EventBus } from "../../eventBus";
import AddDialog from "../../component/AddDialog.vue";
export default {
  components: {
    MoveDirectoryDialog,
    Tree,
    AddDialog
  },
  data: () => ({
    data: [
      {
        type: "text",
        value: "第一章，阿斯拉达激发",
        published: false,
        time: "2022/1/10 10:57",
        child: [
          {
            type: "article",
            value: "articleId",
            published: false,
            time: "2022/1/10 10:57"
          },
          {
            type: "post",
            value: "postId",
            published: false,
            time: "2022/1/10 10:57",
            child: [
              {
                type: "post",
                value: "postId",
                published: false,
                time: "2022/1/10 10:57"
              }
            ]
          },
          {
            type: "url",
            value: "https://www.google.com",
            published: false,
            time: "2022/1/10 10:57"
          }
        ]
      },
      {
        type: "article",
        value: "articleId",
        published: false,
        time: "2022/1/10 10:57",
        child: [
          {
            type: "article",
            value: "articleId",
            published: false,
            time: "2022/1/10 10:57"
          }
        ]
      }
    ],
    showMoveCharter: false,
    more: false,
    bid: "",
    book: null,
    bookList: [],
    chapters: [],
    mouseEnter: [],
    clientX: "",
    clientY: "",
    addDocument: "",
    seekResult: [],
    parentData: [],
    moveDialogData: []
  }),
  created() {
    EventBus.$on("addGroup", data => {
      // this.parentData.child ?? (this.parentData.child = []);
      // this.parentData.child.unshift({ type: "article", value: data.title });
      this.addGroup(data);
    });

    EventBus.$on("deleteDirectory", async (data, childIndex) => {
      this.seekResult = this.bookList;
      for (let i = 0; i < childIndex.length - 1; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex,
          type: "parent"
        });
      }
      this.seekResult.child.splice(childIndex.slice(-1), 1);
      let url = "/creation/articles/del";
      await nkcAPI(url, "post", {
        data: this.bookList,
        bid: this.bid
      }).then(data => {
        console.log(data);
      });
      this.getBook();
    });
    EventBus.$on("openMenu", (childIndex, status) => {
      this.seekResult = this.bookList;
      for (let i = 0; i < childIndex.length; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex
        });
      }

      this.$set(this.seekResult, "isOpen", status);
      this.changeChild(this.seekResult.child, "isOpen", !status);
      this.openMenuIndex = childIndex;
    });
    EventBus.$on("updatePageData", () => {
      this.getBook();
    });
  },
  computed: {
    navList() {
      const { book, bid } = this;
      return [
        {
          name: "文档创作",
          page: "books"
        },
        {
          name: book ? book.name : `加载中...`
        }
      ];
    },
    extendedData() {
      const that = this;
      function res(data) {
        for (let i = 0; i < data.length; i++) {
          that.$set(data, i, { ...data[i], isMove: false });
          that.$set(data, i, { ...data[i], isOpen: false });
          if (data[i].child?.length > 0) {
            res(data[i].child);
          }
        }
      }
      res(this.bookList);

      return this.bookList;
    }
  },
  provide() {
    return {
      datas: this.data
    };
  },
  mounted() {
    this.bid = this.$route.params.bid;
    this.addDocument = this.$route.query.data;
    this.getBook();
  },
  methods: {
    changeStatus(msg) {
      this.$set(msg, "isMove", true);
    },
    changeChild(data, key, value) {
      if (data) {
        data.forEach(item => {
          this.$set(item, key, value);
          if (item.child) {
            this.changeChild(item.child, key, value);
          }
        });
      }
    },
    //  把 子级 父级 同级 都 写入 就不用 每次都要循环找不同级别
    seekChild({ data, position, currentIndex, findLocation, type = "self" }) {
      const child = data[position];
      if (type === "parent") {
        this.seekResult = child;
        // 点击内层
        if (currentIndex === findLocation.length - 2) {
          this.seekResult = child;
          return;
        }
        if (child) {
          if (child.child) {
            this.seekResult = child.child;
          } else {
            this.seekResult = child;
          }
        }
        // 点击最外层
        if (findLocation.length == 1) {
          this.seekResult = data;
        }
      } else if (type === "childe") {
      } else {
        if (child) {
          if (currentIndex === findLocation.length - 1) {
            // console.log("数据查找结果为", this.seekResult=child);
            this.seekResult = child;
            return;
          }
          if (child.child) {
            this.seekResult = child.child;
          } else {
            this.seekResult = child;
          }
        } else {
          console.warn("此位置没有数据");
        }
      }
    },

    addGroup(data) {
      let url = "/creation/articles/editor";
      // '/creation/addChapter'

      const { aid, articleType, value, type } = data;
      let formData = new FormData();
      formData.append("article", JSON.stringify({ title: value }));
      formData.append("bookId", this.bid);
      formData.append("aid", aid);
      formData.append("type", type);
      formData.append("articleType", articleType);
      nkcUploadFile(url, "POST", formData).then(data => {
        console.log(data, "data");
      });
    },
    moveChapter(l) {
      this.showMoveCharter = !this.showMoveCharter;
    },
    cancel() {
      this.showMoveCharter = false;
    },
    navToPage(name, query = {}, params = {}) {
      this.$router.push({
        name,
        query,
        params
      });
    },

    switchContent(id) {
      this.$router.push({
        name: "bookContent",
        params: {
          bid: this.bid,
          id
        }
      });
    },
    getBook() {
      let url = `/creation/book/${this.bid}`;
      const self = this;
      return nkcAPI(url, "GET")
        .then(data => {
          console.log(data);
          self.book = data.bookData;
          self.bookList = data.bookList;
        })
        .catch(sweetError);
    }
  }
};
</script>
