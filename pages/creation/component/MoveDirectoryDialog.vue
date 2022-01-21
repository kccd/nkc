<template lang="pug">
.module-dialog-body
  .module-dialog-header(ref="draggableHandle")
    .module-dialog-title {{ title }}
    .module-dialog-close(@click="close")
      .fa.fa-remove
  .module-dialog-content
    .content
      Tree(
        v-if="showTree",
        :data="dialogData",
        :operations="false",
        :bid="bid"
      )
    //- .model_footer
    //-   .model_footer_container
    //-     button.model_cancle(@click="cancel") 取消
    //-     button.model_confirm(@click="confirm()") 确认
    .m-t-1.m-b-1.text-right
      button.btn.btn-sm.btn-default.m-r-05(@click="cancel") 关闭
      button.btn.btn-sm.btn-primary(@click="confirm()") 确定
</template>
<script>
import { nkcAPI, nkcUploadFile } from "../../lib/js/netAPI";
import Tree from "./tree/Tree.vue";
import { DraggableElement } from "../../lib/js/draggable";
import { EventBus } from "../eventBus";
import { sweetSuccess, sweetError } from "../../lib/js/sweetAlert.js";
export default {
  components: {
    Tree,
  },
  props: {
    bid: String,
    changeStatus: Function,
  },
  data() {
    return {
      show: false,
      title: "请选择移动位置",
      info: "",
      quote: "",
      dialogData: [],
      moveData: {},
      moveIndex: [],
      seekResult: {},
      showTree: true,
      insertIndex: [],
      selectedLevel: "childLevel",
      openMenuIndex: "",
    };
  },
  created() {},
  mounted() {
    EventBus.$on("showIndication", (childIndex, status, data) => {
      this.seekResult = this.dialogData;
      for (let i = 0; i < childIndex.length; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex,
        });
      }
      this.insertIndex = childIndex;
      //   就这有 bug
      this.changeChild(this.dialogData, "showIndication", !status);
      this.$set(this.seekResult, "showIndication", status);
    });
    EventBus.$on("levelSelect", (selectedLevel) => {
      this.selectedLevel = selectedLevel;
    });
    EventBus.$on("moveDialogOpenMenu", (data, childIndex, status = false) => {
      this.$set(data, "isOpen", status);
      // this.changeChild(data.child, "isOpen", !status);
      this.openMenuIndex = childIndex;
    });
    EventBus.$on(
      "moveDirectory",
      async (msg, childIndex, isOpen, bid, type = "move") => {
        // console.log(type);
        this.dialogtype = type;
        await this.getBook(bid);
        // 重置 数据
        if (type !== "choice") {
          // childIndex[0]=childIndex[0]-0+1
          // const arr = childIndex.split("");
          childIndex[0] = childIndex[0] - 0 + 1;
          // childIndex = arr.join("");
          this.seekResult = this.dialogData;
          // 根据 childIndex(字符串每个数组记录的是数组中数据的位置) 长度来查找 数组指定位置的数据
          for (let i = 0; i < childIndex.length; i++) {
            const position = childIndex[i];
            this.seekChild({
              data: this.seekResult,
              position,
              currentIndex: i,
              findLocation: childIndex,
            });
          }
          // 给所有当前 项下的子级加上属性 用来判断
          this.changeChild([this.seekResult], "childrenDisable", true);
          this.$set(this.seekResult, "isMove", true);
        }

        this.moveIndex = childIndex;
        this.moveData = msg;
        this.draggableElement.show();
        // 树结构 用的v-if
        this.showTree = true;
      }
    );
    this.initDraggableElement();
  },
  destroyed() {
    EventBus.$off();
  },
  updated() {},
  methods: {
    moveDialog(data, childIndex, isOpen, bid, type) {
      EventBus.$emit("moveDirectory", data, childIndex, isOpen, bid, type);
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
    reset(data, key, type) {
      data.forEach((item) => {
        if (type === "reset") {
          this.$set(item, key[0], false);
          this.$set(item, key[1], false);
          this.$set(item, key[2], false);
          this.$set(item, key[3], false);
        }
        if (item.child) {
          this.reset(item.child, key, type);
        }
      });
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
        if (findLocation.length === 1) {
          this.seekResult = data;
        }
      } else if (type === "childe") {
      } else {
        if (child) {
          if (currentIndex === findLocation.length - 1) {
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
        }
      }
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(
        this.$el,
        this.$refs.draggableHandle
      );
    },
    findParent(data, item) {
      for (let obj of data) {
        console.log(obj, item);
        if (obj.id === item.id) {
          return data;
        }
        if (data.child && data.child.length) {
          this.findParent(data.child, item);
        }
      }
    },
    async confirm(data) {
      // 数据移入选中项 子级
      if (this.selectedLevel === "childLevel") {
        if (!this.insertIndex.length) {
          this.close();
          return;
        }
        this.seekResult = this.dialogData;
        for (let i = 0; i < this.insertIndex.length; i++) {
          const position = this.insertIndex[i];
          this.seekChild({
            data: this.seekResult,
            position,
            currentIndex: i,
            findLocation: this.insertIndex,
          });
        }
        let length;
        if (this.insertIndex.length === 1) {
          length = 1;
        } else {
          length = this.insertIndex.length - 1;
        }
        // 移动
        this.seekResult.child ?? (this.seekResult.child = []);
        this.seekResult.child.unshift(this.moveData);
        // 如果是选择类型就不执行删除
        if (this.dialogtype !== "choice" && this.moveIndex.length) {
          // 删除被移动的数据
          this.seekResult = this.dialogData;
          for (let i = 0; i < length; i++) {
            const position = this.insertIndex[i];
            this.seekChild({
              data: this.seekResult,
              position,
              currentIndex: i,
              findLocation: this.insertIndex,
              type: "parent",
            });
          }
          const deleteDataIndex = this.moveIndex.slice(-1);
          console.log(this.seekResult, "seekResult");
          if (this.insertIndex.length === 1) {
            this.seekResult = this.dialogData;
            for (let i = 0; i < this.moveIndex.length - 1; i++) {
              const position = this.moveIndex[i];
              this.seekChild({
                data: this.seekResult,
                position,
                currentIndex: i,
                findLocation: this.moveIndex,
                type: "parent",
              });
            }
            this.seekResult.splice(this.moveIndex.slice(-1), 1);
          } else {
            this.seekResult = this.dialogData;
            for (let i = 0; i < this.moveIndex.length; i++) {
              const position = this.moveIndex[i];
              this.seekChild({
                data: this.seekResult,
                position,
                currentIndex: i,
                findLocation: this.moveIndex,
              });
            }
            this.seekResult.child.splice(this.moveIndex.slice(-1), 1);
          }
        }
        // 数据移入同级
      } else {
        //  debugger
        let length;
        this.seekResult = this.dialogData;
        if (this.insertIndex.length === 1) {
          length = 1;
        } else {
          length = this.insertIndex.length - 1;
        }
        for (let i = 0; i < length; i++) {
          const position = this.insertIndex[i];
          this.seekChild({
            data: this.seekResult,
            position,
            currentIndex: i,
            findLocation: this.insertIndex,
            type: "parent",
          });
        }
        // 添加数据
        const insertposition = this.insertIndex.slice(-1) - 0 + 1;
        console.log(insertposition);
        if (length === 1) {
          this.seekResult.splice(insertposition, 0, this.moveData);
        } else {
          this.seekResult.child.splice(insertposition, 0, this.moveData);
        }
        //  如果是选择类型 就不删除数据
        if (this.dialogtype !== "choice" && this.moveIndex.length) {
          // 可以写成先删除就没这么麻烦 在添加 spice 是可以拿到删除项的  ，让后直接插入指定未知即可。就不需要删除插入都去找未知
          // 如果插入未知为 第一项 （0） 那么所有未知都会向后移动。占位项为第一项。
          let deleteDataIndex = this.moveIndex.slice(-1);
          // 有些项是没有 id的 所一还得通过 查找位置 ，或者在源数据上添加唯一标识
          let moveIndex;
          //  如果被插入数据最外层位置 小于 移动最外层位置 那么 被插入数据 向后移动一位
          console.log(this.insertIndex.slice(0, 1));
          if (this.insertIndex.slice(0, 1) < this.moveIndex.slice(0, 1)) {
            deleteDataIndex = deleteDataIndex - 0 + 1;
            // const arr = this.moveIndex.split("");
            this.moveIndex[0] = this.moveIndex[0] - 0 + 1;
            moveIndex = this.moveIndex;
          } else {
            moveIndex = this.moveIndex;
          }
          this.seekResult = this.dialogData;
          for (let i = 0; i < moveIndex.length - 1; i++) {
            const position = moveIndex[i];
            this.seekChild({
              data: this.seekResult,
              position,
              currentIndex: i,
              findLocation: moveIndex,
              type: "parent",
            });
          }
          console.log(deleteDataIndex);
          // 删除   被移动数据层数 最外层
          if (moveIndex.length === 1) {
            this.seekResult.splice(deleteDataIndex, 1);
          } else {
            //删除移动里层
            this.seekResult.child.splice(deleteDataIndex - 1, 1);
          }
        }
      }
      this.dialogData.splice(0, 1);
      let url = "/creation/articles/del";
      const resData = await nkcAPI(url, "post", {
        data: this.dialogData, // 原先是 this.parentData
        bid: this.$props.bid,
      });
      if (!resData.bid && !resData.length) {
        sweetError("操作失败");
        // this.dialogData=resData.data
      } else {
        if (this.dialogtype === "choice") {
          // 通知 添加文章页面
          EventBus.$emit("saveArticle");
        }
        sweetSuccess("操作成功");
      }
      EventBus.$emit("updatePageData");
      // 重置数据
      this.reset(
        this.dialogData,
        ["isMove", "isOpen", "childrenDisable", "showIndication"],
        "reset"
      );
      setTimeout(this.close, 500);
    },
    getBook(bid) {
      let url = `/creation/book/${bid}`;
      const self = this;
      return nkcAPI(url, "GET")
        .then((data) => {
          self.book = data.bookData;
          data.bookList.unshift({
            title: "移动到第一项",
            type: "text",
            describe: "seat",
          });
          if (self.dialogtype === "choice") {
            data.bookList.splice(data.bookList.length - 1, 1);
          }
          self.dialogData = data.bookList;
        })
        .catch(sweetError);
    },
    cancel() {
      // 数据重置  数据这里有bug
      this.reset(
        this.dialogData,
        ["isMove", "isOpen", "childrenDisable", "showIndication"],
        "reset"
      );
      // 关掉是 结构重置
      this.showTree = false;
      this.show = false;
      this.close();
    },
    open(callback, options) {
      this.callback = callback;
      this.dialogData = options.dialogData;
      this.quote = options.quote;
      this.title = options.title;
      this.info = options.info || "";
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      setTimeout(function () {
        this.dialogData = {};
      }, 500);
    },
  },
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  list-style: none;
}
@import "../../publicModules/base";
.module-dialog-body {
  display: none;
  position: fixed;
  width: 30rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-dialog-content {
    padding: 5px;
    .content {
      border: 1px solid #c1b9b9;
    }
  }
  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }
    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
}
.model {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  // background-color: rgba(153, 152, 152, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  .model_box {
    // @media (max-width: 800px) {
    //   width: 700px;
    // }
    // @media (max-width: 700px) {
    //   width: 600px;
    // }
    // @media (max-width: 400px) {
    //   width: 380px;
    // }
    background-color: white;
    // height: 550px;
    // width: 800px;
    box-shadow: rgba(138, 138, 138, 0.438) 5px 5px 8px;
    border: rgba(138, 138, 138, 0.438) 1px solid;
    .model_container {
      height: 100%;
      width: 100%;
      padding: 20px;
      .model_title {
        margin-bottom: 10px;
      }
      .title {
        height: 50px;
        font-size: 1.5rem;
        font-weight: 500;
      }
      .model_content {
        border: rgba(194, 191, 191, 0.2) 1px solid;
        height: 420px;
        border-radius: 5px;
      }
      .model_footer {
        height: 80px;
        margin-top: 20px;
        .model_footer_container {
          display: inline-block;
          // width: 100px;
          float: right;
          button {
            box-sizing: border-box;
            border-radius: 5px;
            display: inline-block;
            padding: 10px 20px;
            border: rgba(194, 191, 191, 0.2) 1px solid;
            text-align: center;
          }
          .model_cancle {
            background: rgb(223, 222, 222);
            color: black;
            margin-right: 20px;
          }
          .model_confirm {
            background: white;
            color: rgb(94, 135, 248);
          }
        }
      }
    }
  }
}
</style>
