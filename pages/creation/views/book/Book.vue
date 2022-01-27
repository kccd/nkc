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
          @click="add()"
        ) 新建目录
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
          @click="navToPage('articleEditor', { bid })"
        ) 撰写文章
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
          @click="navToPage('bookEditor', { bid })"
        ) 设置
  MoveDirectoryDialog(:bid="bid", :changeStatus="changeStatus")
  AddDialog(ref="addDialog")
</template>

<style lang="less" scoped>
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
import { sweetSuccess, sweetError } from "../../../lib/js/sweetAlert.js";
export default {
  components: {
    MoveDirectoryDialog,
    Tree,
    AddDialog,
  },
  data: () => ({
    data: [],
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
    moveDialogData: [],
  }),
  computed: {
    navList() {
      const { book, bid } = this;
      return [
        {
          name: "文档创作",
          page: "books",
        },
        {
          name: book ? book.name : `加载中...`,
        },
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
    },
  },
  mounted() {
    EventBus.$on("addGroup", (data) => {
      this.addGroup(data);
    });
    EventBus.$on("addConfirm", async ({ res, type, data: insertData, dialogType, level }) => {
        // insertData 是修改或者新建的数据
        let obj;
        if (type === "text") {
          obj = {
            title: res,
            type: type,
            id: "",
            url: "",
            child: [],
          };
        } else if (type === "url") {
          obj = {
            title: res.title,
            type: type,
            id: "",
            url: res.url,
            child: [],
          };
        } else if (type === "post") {
          obj = {
            title: res.title,
            type: type,
            id: res.id,
            url: res.url,
            child: [],
          };
        } else {
          sweetError("不允许的数据类型");
          return;
        }
        if (dialogType === "editor") {
          this.seekResult = this.bookList;
          console.log(obj,insertData)
          for (let i = 0; i < insertData.index.length - 1; i++) {
            const position = insertData.index[i];
            this.seekChild({
              data: this.seekResult,
              position,
              currentIndex: i,
              findLocation: insertData.index,
              type: "parent",
            });
          }
          // 修改 如果是修改 最外层
          const editorIndex = insertData.index.slice(-1);
          if (insertData.index.length === 1) {
            this.seekResult[editorIndex] = obj;
          } else {
            // 里层
            this.seekResult.child[editorIndex] = obj;
          }
        } else {
          if (level === "outermost") {
            this.bookList.push(obj);
          } else {
            // 都是向子级的child 插入数据
            const index = insertData.index;
            this.seekResult = this.bookList;
            for (let i = 0; i < index.length; i++) {
              const position = index[i];
              this.seekChild({
                data: this.seekResult,
                position,
                currentIndex: i,
                findLocation: index,
              });
            }
            this.seekResult.child.unshift(obj);
          }
        }
        // 添加 修改 的共同业务
        let url = `/creation/book/${this.bid}/list/add`;
        await nkcAPI(url, "POST", {
          data: this.bookList,
          bid: this.bid,
        }).then((data) => {
          if (!data.bid) {
            sweetError(dialogType === "editor" ? "修改失败" : "添加失败");
          } else {
            sweetSuccess(dialogType === "editor" ? "修改成功" : "添加成功");
          }
        });
        this.getBook();
        this.$refs.addDialog.close();
      }
    );

    EventBus.$on("deleteDirectory", async (data, childIndex) => {
      this.seekResult = this.bookList;
      for (let i = 0; i < childIndex.length - 1; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex,
          type: "parent",
        });
      }
      // 最外层 可能是 一位数 可能是 二位数 三位数 等等
      if (childIndex.length === 1) {
        this.seekResult.splice(childIndex[0], 1);
      } else {
        this.seekResult.child.splice(childIndex[childIndex.length - 1], 1);
      }
      let url = `/creation/book/${this.bid}/list/delete`;
      await nkcAPI(url, "post", {
        data: this.bookList,
        bid: this.bid,
      }).then(async (data) => {
        if (!data.bid) {
          sweetError("删除失败");
        } else {
          sweetSuccess("删除成功");
        }
        this.getBook();
      });
    });
    EventBus.$on("openMenu", (childIndex, status) => {
      this.seekResult = this.bookList;
      for (let i = 0; i < childIndex.length; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex,
        });
      }

      this.$set(this.seekResult, "isOpen", status);
      this.changeChild(this.seekResult.child, "isOpen", !status);
      this.openMenuIndex = childIndex;
    });
    EventBus.$on("updatePageData", () => {
      this.getBook();
    });
    this.bid = this.$route.params.bid;
    this.addDocument = this.$route.query.data;
    this.getBook();
  },
  methods: {
    changeStatus(msg) {
      this.$set(msg, "isMove", true);
    },
    findId(data, id) {
      let findData;
      function find(data, id) {
        if (data) {
          for (let obj of data) {
            if (obj.id === id) {
              findData = obj;
            } else if (obj.child && obj.child.length) {
              find(obj, child, id);
            }
          }
        }
      }
      find(data, id);
      return findData;
    },
    changeChild(data, key, value) {
      if (data) {
        data.forEach((item) => {
          this.$set(item, key, value);
          if (item.child) {
            this.changeChild(item.child, key, value);
          }
        });
      }
    },
    //  把 子级 父级 同级 都 写入 就不用 每次都要循环找不同级别   还可以把 循环封装在内，这个先暂时用着
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
          sweetError("此位置不存在数据");
          return;
        }
      }
    },
    add(data, childIndex) {
      EventBus.$emit("addDialog", {
        bid: this.bid,
        data,
        childIndex,
        title: "新建同级目录",
        level: "outermost",
      });
    },
    addGroup(data) {
      let url = "/creation/articles/editor";
      const { aid, articleType, value, type } = data;
      let formData = new FormData();
      formData.append("article", JSON.stringify({ title: value }));
      formData.append("bookId", this.bid);
      formData.append("aid", aid);
      formData.append("type", type);
      formData.append("articleType", articleType);
      nkcUploadFile(url, "POST", formData).then((data) => {
        console.log(data, "data");
      });
    },
    cancel() {
      this.showMoveCharter = false;
    },
    navToPage(name, query = {}, params = {}) {
      this.$router.push({
        name,
        query,
        params,
      });
    },
    switchContent(id) {
      this.$router.push({
        name: "bookContent",
        params: {
          bid: this.bid,
          id,
        },
      });
    },
    getBook() {
      let url = `/creation/book/${this.bid}`;
      const self = this;
      return nkcAPI(url, "GET")
        .then((data) => {
          self.book = data.bookData;
          self.bookList = data.bookList;
        })
        .catch(sweetError);
    },
  },
};
</script>
