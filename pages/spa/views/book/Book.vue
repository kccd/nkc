<template lang="pug">
  .container-fluid.creation-center-book
    .m-b-1
      bread-crumb(:list="navList")
    .creation-center-book-container.standard-container(v-if="book")
      .creation-center-book-cover
        img(:src="book.coverUrl")
      .creation-center-book-name {{ book.name }}
      .creation-center-book-description {{ book.description }}
      .creation-center-author
        user-group(:users="bookMembers")
      .creation-center-book-list
        Tree(:data="extendedData", :bid="bid")
        button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm.mt(
          @click="add()"
        ) 新建目录
      button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
        @click="navToPage('articleEditor', { bid })"
      ) 撰写文章
      button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
        @click="toBookHome"
      ) 阅读专题
      button.creation-center-book-list-selector.btn.btn-default.btn-block.btn-sm(
        @click="navToPage('bookEditor', { bid })"
      ) 设置
    MoveDirectoryDialog(:bid="bid")
    AddDialog(ref="addDialog")
</template>

<style lang="less" scoped>
.mt {
  margin-top: 10px;
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
      }
    }
  }
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
        &[data-type='stable'][data-status='unknown'] {
          background: #ffdcb2!important;
        }
        &[data-type='beta'][data-status='unknown'] {
          background: #ccc!important;
        }
        &[data-type='stable'][data-status='faulty'] {
          background: #ffdbd5!important;
        }
        &[data-type='stable'][data-status='disabled'] {
          background: #bdbdbd!important;
        }
        @itemHeight: 3rem;
        @timeWidth: 11rem;
        margin-bottom: 0.2rem;
        padding-right: @timeWidth + 1rem;
        padding-left: 0.2rem;
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
</style>

<script>
import { nkcAPI } from "../../../lib/js/netAPI";
import MoveDirectoryDialog from "../../component/MoveDirectoryDialog.vue";
import Tree from "../../component/tree/Tree.vue";
import { EventBus } from "../../eventBus";
import AddDialog from "../../component/AddDialog.vue";
import { sweetSuccess, sweetError } from "../../../lib/js/sweetAlert.js";
import UserGroup from "../../../lib/vue/userGroup"
import {visitUrl} from "../../../lib/js/pageSwitch";
import {getUrl} from "../../../lib/js/tools";

export default {
  components: {
    MoveDirectoryDialog,
    Tree,
    AddDialog,
    'user-group': UserGroup
  },
  data: () => ({
    bid: "",
    book: null,
    bookList: [],
    seekResult: [],
    bookMembers: [],
  }),
  computed: {
    navList() {
      const { book } = this;
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
          that.$set(data, i, { ...data[i], isOpen: true });
          if (data[i].child?.length > 0) {
            res(data[i].child);
          }
        }
      }
      res(this.bookList);
      return this.bookList;
    },
  },
  created() {},
  mounted() {
    EventBus.$on(
      "addConfirm",
      async ({ res, type, data: insertData, dialogType, level }) => {
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
            title: "",
            type: type,
            id: res.id,
            url: "",
            child: [],
          };
        } else {
          sweetError("不允许的数据类型");
          return;
        }
        if (dialogType === "editor") {
          this.seekChild2({
              findLocation: insertData.index
            })
          obj.child = this.seekResult.child;
          this.seekChild2({
              findLocation: insertData.index,
              type: "parent",
            })
          //  最外层
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
            this.seekChild2({
              findLocation: index,
            })
            this.seekResult.child ?? (this.seekResult.child=[])
            this.seekResult.child.unshift(obj);
          }
        }
        // 添加 修改 的共同业务
        let url = `/creation/book/${this.bid}/list/add`;
        await nkcAPI(url, "POST", {
          data: this.bookList,
          bid: this.bid,
        }).then((data) => {
          // if (!data.bid) {
          //   sweetError(dialogType === "editor" ? "修改失败" : "添加失败");
          // } else {
            sweetSuccess(dialogType === "editor" ? "修改成功" : "添加成功");
          // }
        });
        this.getBook();
        this.$refs.addDialog.close();
      }
    );
    EventBus.$on("deleteDirectory", async (data, childIndex) => {
      this.seekChild2({findLocation: childIndex, type: "parent"})
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
      }).finally(()=>{
        this.getBook();
      });
    });
    EventBus.$on("openMenu", (childIndex, status) => {
      this.seekChild2({
        findLocation: childIndex,
      });
      this.$set(this.seekResult, "isOpen", status);
      this.changeChild(this.seekResult.child, "isOpen", !status);
      this.openMenuIndex = childIndex;
    });
    EventBus.$on("updatePageData", () => {
      this.getBook();
    });
    this.bid = this.$route.params.bid;
    this.getBook();
  },
  destroyed() {
    EventBus.$off();
  },
  methods: {
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
    // findLocation 是一个数组 存放的数据位置 [0,0,1,2...]
    seekChild2({ findLocation, type = "self" }) {
      this.seekResult = this.bookList;
      let length = findLocation.length
      if (type === "parent") {
        length--;
      }
      for (let i = 0; i < length; i++) {
        const position = findLocation[i];
        find({ position, currentIndex: i, findLocation, type }, this);
      }
      // const that = this;
      function find({ position, currentIndex, findLocation }, that) {
        const child = that.seekResult[position];
        if (type === "parent") {
          that.seekResult = child;
          // 点击内层
          if (currentIndex === findLocation.length - 2) {
            that.seekResult = child;
            return;
          }
          if (child) {
            if (child.child) {
              that.seekResult = child.child;
            } else {
              that.seekResult = child;
            }
          }
          // 点击最外层
          if (findLocation.length == 1) {
            that.seekResult = that.bookList;
          }
        } else {
          if (child) {
            if (currentIndex === findLocation.length - 1) {
              that.seekResult = child;
              return;
            }
            if (child.child) {
              that.seekResult = child.child;
            } else {
              that.seekResult = child;
            }
          } else {
            sweetError("此位置不存在数据");
            return;
          }
        }
      }
    },
    // seekChild({ data, position, currentIndex, findLocation, type = "self" }) {
    //   const child = data[position];
    //   if (type === "parent") {
    //     this.seekResult = child;
    //     // 点击内层
    //     if (currentIndex === findLocation.length - 2) {
    //       this.seekResult = child;
    //       return;
    //     }
    //     if (child) {
    //       if (child.child) {
    //         this.seekResult = child.child;
    //       } else {
    //         this.seekResult = child;
    //       }
    //     }
    //     // 点击最外层
    //     if (findLocation.length == 1) {
    //       this.seekResult = data;
    //     }
    //   } else {
    //     if (child) {
    //       if (currentIndex === findLocation.length - 1) {
    //         // console.log("数据查找结果为", this.seekResult=child);
    //         this.seekResult = child;
    //         return;
    //       }
    //       if (child.child) {
    //         this.seekResult = child.child;
    //       } else {
    //         this.seekResult = child;
    //       }
    //     } else {
    //       sweetError("此位置不存在数据");
    //       return;
    //     }
    //   }
    // },
    add(data, childIndex) {
      EventBus.$emit("addDialog", {
        bid: this.bid,
        data,
        childIndex,
        title: "新建同级目录",
        level: "outermost",
      });
    },
    navToPage(name, query = {}, params = {}) {
      this.$router.push({
        name,
        query,
        params,
      });
    },
    getBook() {
      let url = `/creation/book/${this.bid}`;
      const self = this;
      return nkcAPI(url, "GET")
        .then((data) => {
          self.book = data.bookData;
          self.bookList = data.bookList;
          self.bookMembers = data.bookMembers;
        })
        .catch(sweetError);
    },
    toBookHome() {
      const {bid} = this;
      visitUrl(getUrl('book', bid), true)
    }
  },
};
</script>
