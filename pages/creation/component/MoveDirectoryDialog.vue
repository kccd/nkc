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
import { nkcAPI } from "../../lib/js/netAPI";
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
  },
  data() {
    return {
      title: "请选择移动位置",
      dialogData: [],
      moveData: {},
      moveIndex: [],
      seekResult: {},
      showTree: true,
      insertIndex: [],
      selectedLevel: "childLevel",
      // openMenuIndex: "",
      // publishIndex: "",
      publishInfo: {},
      publishFun:'',
      dialogtype:''
    };
  },
  mounted() {
    EventBus.$on("showIndication", (childIndex, status, data) => {
      this.seekChild2({
        findLocation: childIndex,
      })
      this.insertIndex = childIndex;
      this.changeChild(this.dialogData, "showIndication", !status);
      this.$set(this.seekResult, "showIndication", status);
    });
    EventBus.$on("levelSelect", (selectedLevel) => {
      this.selectedLevel = selectedLevel;
    });
    EventBus.$on("moveDialogOpenMenu", (data, childIndex, status = false) => {
      this.seekChild2({
        findLocation: childIndex,
      })
      console.log(this.seekResult)
      if(!this.seekResult.showIndication){
        this.$set(data, "isOpen", true);
      }else{
        this.$set(data, "isOpen", status);
      }
      
      // this.openMenuIndex = childIndex;
    });
    EventBus.$on("moveDirectory", async (msg, childIndex, type = "move", callBack) => {
        this.publishFun = callBack
        this.dialogtype = type;
        await this.getBook(this.bid);
        // 文章已经存在，点击编辑后发布
        if (childIndex.length) {
          childIndex[0] = childIndex[0] - 0 + 1 + "";
          this.seekChild2({
            findLocation: childIndex,
          })
          // 给所有当前 项下的子级加上属性 用来判断
          this.changeChild([this.seekResult], "childrenDisable", true);
          this.$set(this.seekResult, "isMove", true);
          if (childIndex.length > 1) {
            let parnetPosition = childIndex.length ;
            const self = this;
            function isOPen(length) {
              self.seekChild2({
                findLocation: childIndex.slice(0, length),
              })
              self.$set(self.seekResult, "isOpen", true);
              if (length < parnetPosition) {
                isOPen(length + 1);
              }
            }
            isOPen(1);
          }
          this.moveIndex = childIndex;
          //发布需要带上所有子元素进行更新  
          //如果不进行处理需要在点击编辑时把数据传递 tree》 editor》moveDialog
          if (type === "publish") {
            // console.log(msg)
            this.findAllChild(this.dialogData, msg);
            msg.child = this.publishInfo?.self?.child || [];
          }
          // 新建后直接发布 默认添加在最后一个
        } else {
          this.$set(
            this.dialogData[this.dialogData.length - 1],
            "isMove",
            true
          );
        }
        this.moveData = msg;
        this.draggableElement.show();
        this.showTree = true;
      }
    );
    this.initDraggableElement();
  },
  destroyed() {
    EventBus.$off();
  },
  methods: {
    seekChild2({ findLocation, type = "self" }) {
      this.seekResult = this.dialogData;
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
    seekChild({ data, position, currentIndex, findLocation, type = "self" }) {
      if (typeof findLocation === 'number')findLocation= String(findLocation)
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
    findAllChild(data, item) {
      for (let key in data) {
        const obj = data[key];
        if (obj.id === item.id) {
          this.publishInfo = {
            currentIndex: key,
            parent: data,
            self: obj,
          };
          return;
        }
        if (data.child && data.child.length) {
          this.findAllChild(data.child, item);
        }
      }
    },
    async confirm() {
      if (!this.insertIndex.length) {
        // sweetError("请选择后，再点击确定按钮");
        // return;
        this.selectedLevel = ''
      }
      // 数据移入选中项 子级
      if (this.selectedLevel === "childLevel") {
        if (!this.moveIndex.length) {
          const deleteData = this.dialogData[this.dialogData.length - 1];
          this.seekChild2({
            findLocation: this.insertIndex,
          })
          let insertDataIndex = this.seekResult;
          insertDataIndex.child.unshift(deleteData);
          this.dialogData.splice(this.dialogData.length - 1, 1);
        } else {
          this.seekChild2({
            findLocation: this.insertIndex,
          })
          let insertDataindex = this.seekResult;
          // 删除被移动的数据
          this.seekChild2({
            findLocation: this.moveIndex,
            type: "parent",
          })
          let deleteDataParent = this.seekResult;
          // 删除
          if (this.moveIndex.length === 1) {
            deleteDataParent.splice(this.moveIndex.slice(-1), 1);
          } else {
            deleteDataParent.child.splice(this.moveIndex.slice(-1), 1);
          }
          // 插入
          insertDataindex.child ?? (insertDataindex.child = []);
          insertDataindex.child.unshift(this.moveData);

        }
      } else if(this.selectedLevel === "sameLevel") {
        // 编辑后直接发布 就没有坐标和数据 并且默认在最后一项
        if (!this.moveIndex.length) {
          const deleteData = this.dialogData[this.dialogData.length - 1];
          this.seekChild2({
            findLocation: this.insertIndex,
            type: "parent",
          })
          const insertDataParent = this.seekResult;
          if (this.insertIndex.length === 1) {
            insertDataParent.splice(this.insertIndex[0] - 0 + 1, 0, deleteData);
          } else {
            insertDataParent.child.splice(
              this.insertIndex.slice(-1) - 0 + 1,
              0,
              deleteData
            );
          }
          this.dialogData.splice(this.dialogData.length - 1, 1);
        } else {
          this.seekChild2({
            findLocation: this.moveIndex,
            type: "parent",
          })
          let deleteDataParent = this.seekResult;
          this.seekChild2({
            findLocation: this.insertIndex,
            type: "parent",
          })
          let insertDataParent = this.seekResult;
          // 删除
          if (this.moveIndex.length === 1) {
            deleteDataParent.splice(this.moveIndex.slice(-1), 1);
          } else {
            deleteDataParent.child.splice(this.moveIndex.slice(-1), 1);
          }
          // 插入
          if (this.insertIndex.length === 1) {
            // 当插入项 大于 被移动项
            let moveBack = 1
            if(this.insertIndex[0] > this.moveIndex[0]){
               moveBack = 0
            }
            insertDataParent.splice(
              this.insertIndex.slice(-1) - 0 + moveBack,
              0,
              this.moveData
            );
          } else {
            insertDataParent.child.splice(
              this.insertIndex.slice(-1) - 0 + 1,
              0,
              this.moveData
            );
          }
        }
      }
      // 删除添加到第一项
      this.dialogData.splice(0, 1);
      let url = `/creation/book/${this.$props.bid}/list/move`;
      await nkcAPI(url, "post", {
        data: this.dialogData,
        bid: this.$props.bid,
      }).then(()=>{
        if(this.publishFun){
          this.publishFun()
        }else if(this.dialogtype === 'publish'){
          sweetError("缺少回调函数");
        }
      })
      EventBus.$emit("updatePageData");
      setTimeout(this.close, 200);
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
          self.dialogData = data.bookList;
        })
        .catch(sweetError);
    },
    cancel() {
      setTimeout(this.close, 200);
    },
    close() {
      this.draggableElement.hide();
      this.showTree = false;
      this.insertIndex = "";
      this.selectedLevel = "childLevel";
      // 重置数据
      this.reset(
        this.dialogData,
        ["isMove", "childrenDisable", "showIndication"],
        "reset"
      );
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
      overflow-y: scroll;
      height: 500px;
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
