<template lang="pug">
.model(v-show="show")
  .model_box
    .model_container(ref="draggableHandle")
      p.model_title
        span.title 请选择要放置的目录位置
      .model_content
        Tree(v-if="showTree", :data="dialogData", :operations="false")
      .model_footer
        .model_footer_container
          button.model_cancle(@click="cancel") 取消
          button.model_confirm(@click="confirm()") 确认
</template>
<script>
//           :disable="seekResult"
import Tree from "./tree/Tree.vue";
import { DraggableElement } from "../../lib/js/draggable";
import { EventBus } from "../eventBus";
export default {
  components: {
    Tree,
  },
  props: ["seat", "data"],
  data() {
    return {
      show: false,
      title: "",
      info: "",
      quote: "",
      dialogData: {},
      moveData: {},
      moveIndex: "",
      seekResult: {},
      showTree: true,
      insertIndex: "",
      selectedLevel: "childLevel",
    };
  },
  created() {
    this.dialogData = [...this.$props.data];

    EventBus.$on("moveDirectory", (msg, childIndex, isOpen) => {
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
      // 这个地址时 this.dialogData 中对象的地址  修改的数据最外层
      this.$set(this.seekResult, "isMove", true);
      this.seekResult = this.dialogData;
      this.moveIndex = childIndex;
      for (let i = 0; i < childIndex.length; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex,
          type: "parent",
        });
      }
      // 拿到 被移动的aid 和 
      this.moveData = msg;
      this.show = true;
      this.showTree = true;
    });

    EventBus.$on("showIndication", (childIndex, status) => {
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
      this.changeChild(this.dialogData, "showIndication", !status);
      this.$set(this.seekResult, "showIndication", status);
      this.insertIndex = childIndex;
    });

    EventBus.$on("levelSelect", (selectedLevel) => {
      this.selectedLevel = selectedLevel;
    });

    EventBus.$on("deleteDirectory", (childIndex) => {
      this.seekResult = this.dialogData;
      for (let i = 0; i < childIndex.length; i++) {
        const position = childIndex[i];
        this.seekChild({
          data: this.seekResult,
          position,
          currentIndex: i,
          findLocation: childIndex,
          type: "parent",
        });
      }
      this.parentData.splice(this.moveIndex.slice(-1));
      //删除过后发送请求
    });


  },
  mounted() {
    this.initDraggableElement();
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
    seekChild({ data, position, currentIndex, findLocation, type = "self" }) {
      if (type === "parent") console.log(data);
      const child = data[position];
      if (type === "parent") {
        // 点击内层
        if (currentIndex === findLocation.length - 2) {
          this.parentData = child;
        }
        // 点击最外层
        if (findLocation.length - 2 < 0) {
          this.parentData = data;
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
    confirm(data) {
      EventBus.$emit("moveDirectoryConfirm", data);
      // 数据移入选中项 子级或同级
      if (this.selectedLevel === "childLevel") {
        this.seekResult.child ?? (this.seekResult.child = []);
        this.seekResult?.child?.unshift(this.moveData);
      } else {
        this.parentData.unshift(this.moveData);
      }
      console.log(this.parentData);
      // 删除被移动的数据
      this.parentData.splice(this.moveIndex.slice(-1));
      //删除过后发送请求
      // 拿到 aid  和  this.parentData 的 id 后端 aid 移动到 childIndx 位置 并且  删除  this.parentData
      this.$set(this.seekResult, "isMove", false);
      this.close();
    },
    cancel() {
      // 数据重置  数据这里有bug
      this.$set(this.seekResult, "isMove", false);
      this.$set(this.seekResult, "showIndication", false);
      // 关掉是 结构重置
      this.showTree = false;
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
    @media (max-width: 800px) {
      width: 700px;
    }
    @media (max-width: 700px) {
      width: 600px;
    }
    @media (max-width: 400px) {
      width: 380px;
    }
    background-color: white;
    height: 550px;
    width: 800px;
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

