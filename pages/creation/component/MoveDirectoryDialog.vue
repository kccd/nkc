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
      moveIndex: "",
      seekResult: {},
      showTree: true,
      insertIndex: "",
      selectedLevel: "childLevel",
      openMenuIndex: "",
    };
  },
  created() {
    EventBus.$on("moveDirectory", async (msg, childIndex, isOpen, bid) => {
      await this.getBook(bid);
      // 重置 数据
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
      this.changeChild([this.seekResult], "childrenDisable", true);
      // 不知道为什么 这个不行
      this.$set(this.seekResult, "isMove", true);
      // this.$set(this.seekResult, "parentNode", childIndex);
      // console.log(this.seekResult===msg,msg,this.seekResult,childIndex)
      // this.$set(msg, "isMove", true);
      // this.seekResult = this.dialogData;
      this.moveIndex = childIndex;

      this.moveData = msg;
      this.draggableElement.show();
      // 对话框
      // this.show = true;
      // 树结构 用的v-if
      this.showTree = true;
    });
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
      // this.seekResult = this.dialogData;
      // for (let i = 0; i < childIndex.length; i++) {
      //   const position = childIndex[i];
      //   this.seekChild({
      //     data: this.seekResult,
      //     position,
      //     currentIndex: i,
      //     findLocation: childIndex,
      //   });
      // }
      this.$set(data, "isOpen", status);
      // this.changeChild(data.child, "isOpen", !status);
      console.log(data, "this.seekResult");
      this.openMenuIndex = childIndex;
    });
  },
  mounted() {
    this.initDraggableElement();
  },
  destroyed() {
    EventBus.$off();
  },
  updated() {},
  methods: {
    deepClone1(obj) {
      //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
      var objClone = Array.isArray(obj) ? [] : {};
      //进行深拷贝的不能为空，并且是对象或者是
      if (obj && typeof obj === "object") {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key] && typeof obj[key] === "object") {
              objClone[key] = deepClone1(obj[key]);
            } else {
              objClone[key] = obj[key];
            }
          }
        }
      }
      return objClone;
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
        console.log(findLocation, "----------");
        // 点击最外层
        if (findLocation.length === 1) {
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
        this.seekResult.child ?? (this.seekResult.child = []);
        console.log(this.seekResult);
        this.seekResult.child.unshift(this.moveData);
        // 删除被移动的数据
        this.seekResult = this.dialogData;
        for (let i = 0; i < length - 1; i++) {
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
        this.seekResult = this.dialogData;
        this.findParent(this.dialogData, this.moveData).splice(
          deleteDataIndex,
          1
        );
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
        console.log(this.seekResult);
        if (length === 1) {
          this.seekResult.unshift(this.moveData);
        } else {
          this.seekResult.child.unshift(this.moveData);
        }

        // 因为数据是向前添加的所以 原来的数据向后移动了一位
        const deleteDataIndex = this.moveIndex.slice(-1);
        // 因为向上添加 原来位置会后移一位
        const newIndex = this.insertIndex.slice(-1) - 0 + 1;
        console.log(this.findParent(this.dialogData, this.moveData), "-----");
        this.findParent(this.dialogData, this.moveData)[newIndex].child.splice(
          deleteDataIndex,
          1
        );
        // 应该 父级 改变数据
        this.$set(this.moveData, "isMove", false);
        this.$set(this.moveData, "showIndication", false);
        // 关掉是 结构重置
        this.showTree = false;
      }

      let url = "/creation/articles/del";
      await nkcAPI(url, "post", {
        data: this.dialogData, // 原先是 this.parentData
        bid: this.$props.bid,
      }).then((data) => {
        console.log(data);
      });
      EventBus.$emit("updatePageData");
      this.reset(
        this.dialogData,
        ["isMove", "isOpen", "childrenDisable", "showIndication"],
        "reset"
      );
      this.close();
    },
    getBook(bid) {
      let url = `/creation/book/${bid}`;
      const self = this;
      return nkcAPI(url, "GET")
        .then((data) => {
          console.log(data);
          self.book = data.bookData;
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
      console.log(this.dialogData);
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
  .module-dialog-content{
    padding:5px;
    .content{
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
