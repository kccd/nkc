<template lang="pug">
.model(v-show="show")
  .model_box
    .model_container(ref="draggableHandle")
      p.model_title
        span.title 请选择要放置的目录位置
      .model_content
        Tree(
          :data="dialogData",
          :operations="false",
          :funcs="{ open, confirm }",
          :disable="seekResult"
        )
      .model_footer
        .model_footer_container
          button.model_cancle(@click="cancel") 取消
          button.model_confirm(@click="confirm()") 确认
</template>


<script>
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
      msg: {},
      seekResult: {},
    };
  },
  created() {
    // ？？
    this.dialogData = [...this.$props.data];
  },
  mounted() {
    this.initDraggableElement();
    EventBus.$on("moveDirectory", (msg, childIndex) => {
      console.log("msg", msg, childIndex);
      console.log(childIndex);
      for (let i = 0; i < childIndex.length; i++) {
        const position = childIndex[i];
        this.seekChild(this.dialogData, position,i,childIndex);
      }
      // 这样子给 会导致全部一致 ，只能通过 修改data中的某一项 来完成，但是通过data中某一项来完成 ，数据渲染是 应该又会出现问题。那咋搞啊  ，不能用disaple
      this.seekResult.isMove = msg.isMove;
      console.log(this.seekResult)
      this.msg = msg;
      this.show = true;
      console.log(this.dialogData, "console.log(childIndex);");
    });
  },
  destroyed() {
    EventBus.$off();
  },
  methods: {
    seekChild(data, position,i,childIndex) {
      console.log(data, position);
      const child = data[position];
      console.log("child", child);
      if (child) {
        if (child.child) {
          this.seekResult = child.child;
        } else {
          this.seekResult = child;
        }
        if (i === childIndex.length - 1) {
          console.log("数据查找完毕结果1为", this.seekResult=child);
        }
      } else {
        console.error("此位置没有数据");
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
      this.callback();
    },
    cancel() {
      // this.$emit("close");
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

