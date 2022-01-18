<template lang="pug">
.module-dialog-body(v-show="true")
  .module-dialog-header(ref="draggableHandle")
    .module-dialog-title {{ title }}
    .module-dialog-close(@click="close")
      .fa.fa-remove
  .module-dialog-content
    .select-type
      label(for="" style="margin-left: 5px;")
        span 
          | 新建分组
          input(type="radio" value="group" v-model="selectType")
      label(for="" style="margin-left: 10px;")
        span 
          | 新建文档
          input(type="radio" value="document" v-model="selectType")
      label(for="" style="margin-left: 10px;")
        span 
          | 新建URL
          input(type="radio" value="URL" v-model="selectType")
      label(for="" style="margin-left: 10px;")
        span 
          | 新建POST
          input(type="radio" value="POST" v-model="selectType")  
      .add_group(v-show="selectType === 'group' || selectType === 'URL'")
        select(v-model="protocol" v-show="selectType === 'URL'" class='select')
          option(value='http') http
          option(value='https') https
        span(v-show="selectType === 'group'") 分组名:
        input(class="add-group-input select query-input" id="add-group-input" type="text" v-model="inputValue" v-focus)
    .select-post(v-show="selectType === 'POST'")
      .select-post-query
        .select-post-query-width
          input.query-input(
          type="text",
          placeholder="请输入pid",
          v-model="searchContent"
          )
          button.query-button(@click="query") 查询
          button.query-button(@click="query('reset')") 重置
      ul.select-post-list
        li.post-list-title
          span.postId.title ID
          span.postContent.title 内容
        .list-container(ref="listContainer")
          .list-height(ref="listHeight")
            li.post-list-item(
              v-for="post in [ { id: 1, content: '内容' }, { id: 2, content: '内容2' }, ]"
            )
              span.itemId {{ post.id }}
              span.item-content {{ post.content }}
    .select-tree
      span 请选择新建位置
      Tree(:data="extendedData", :operations="false")
    .m-t-1.m-b-1.text-right
      button.btn.btn-sm.btn-default.m-r-05(@click="close") 关闭
      button.btn.btn-sm.btn-primary(@click="submit") 确定
</template>

<script>
import { DraggableElement } from "../../lib/js/draggable";
import { nkcAPI, nkcUploadFile } from "../../lib/js/netAPI";
import Tree from "./tree/Tree.vue";
import { EventBus } from "../eventBus.js";
export default {
  components: {
    Tree,
  },
  data: () => ({
    show: true,
    title: "",
    info: "",
    quote: "",
    data: {},
    treeData: [],
    selectType: "defaultTips",
    searchContent: "",
    protocol:'http',
    inputValue:''
  }),
  created() {
    EventBus.$on("addDialog", (bid) => {
      if (!bid) console.log("bid不存在");
      this.getTreeData(bid);
      this.draggableElement.show();
    });
  },
  watch:{
    selectType(){
      if(this.selectType === 'POST'){
        this.query(1,"get")
      }
    }
  },
  mounted() {
    this.initDraggableElement();
  },
  updated() {
    this.$nextTick(() => {
      console.dir(this.$refs.listHeight.clientHeight);
      if (this.$refs.listHeight.clientHeight < 240) {
        this.$refs.listContainer.setAttribute(
          "class",
          "list-container-noScroll"
        );
      }
    });
  },
  computed: {
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
      res(this.treeData);

      return this.treeData;
    },
  },
  methods: {
    getTreeData(bid) {
      // let url = `/creation/book/${bid}`;
      let url = `/creation/book/61e51196e9a1781a80932e99`;
      const self = this;
      return nkcAPI(url, "GET")
        .then((data) => {
          console.log(data);
          self.book = data.bookData;
          self.treeData = data.bookList;
        })
        .catch(sweetError);
    },
    async query(page = 1, type = "get") {
      const { searchContent } = this;
      let url
      if(type === 'search'){
        if (!searchContent) return;
         url = `/u/92837/profile/thread?page=${page}&limit=20&type=${type}&content=${searchContent}`;
      }else{
        url= `u/92837/profile/thread?page=${page}&limit=20&type=${type}`;
      }
      const result = await nkcAPI(url, "get");
      console.log(result);
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(
        this.$el,
        this.$refs.draggableHandle
      );

      console.log(this.draggableElement);
    },
    submit: function () {
      this.callback(this.data);
    },
    pickedFile: function (index) {
      var dom = this.$refs["input" + index][0];
      this.data[index].value = dom.files[0];
    },
    open(callback, options) {
      this.callback = callback;
      this.data = options.data;
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
        this.data = {};
      }, 500);
    },
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
};
</script>


<style lang="less" scoped>
* {
  padding: 0;
  margin: 0;
  list-style-type: none;
}
.select{
  margin-top:5px;
  height:2rem; 
}
.add-group-input{
  width:22rem;
}
@import "../../publicModules/base";
.module-dialog-body {
  display: none;
  position: fixed;
  width: 50rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
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

  .module-dialog-content {
    .select-tree {
      border-top:1px solid rgba(218, 216, 216, 0.514);
      margin-top: 10px;
    }
    padding: 0 1rem;
    .select-type {
      // margin-top: 10px;
      width: 27rem;
      margin:10px auto;
    }
    .select-post {
      border-top:1px solid rgba(218, 216, 216, 0.514);
      margin-top: 10px;
      .select-post-query-width{
        // display: inline-block;
        width:22rem;
        margin: 0 auto;
      }
      .query-input {
        outline: none;
      }
      .select-post-list {
        margin-top: 5px;
        .list-container {
          border: 1px rgba(218, 216, 216, 0.514) solid;
          height: 20rem;
          overflow-y: scroll;
          .post-list-item {
            margin-top: 3px;
            background: rgb(216 234 243);
          }
        }
        .list-container-noScroll {
          border: 1px rgba(218, 216, 216, 0.514) solid;
          height: 20rem;
        }
        li {
          margin-top: 3px;
        }
        .post-list-title {
          font-weight: 600;
        }
      }
    }
  }
}
::-webkit-scrollbar {
  width: 10px;
  height: 1px;
  background: #ededed;
}
::-webkit-scrollbar-track {
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: bisque;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>

          