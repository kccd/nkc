<template lang="pug">
.module-dialog-body(v-show="true")
  .module-dialog-header(ref="draggableHandle")
    .module-dialog-title {{title}}
    .module-dialog-close(@click="close")
      .fa.fa-remove
  .module-dialog-content
    .select-type
      label(for="", style="margin-left: 5px")
        span 
          | 新建分组
          input(type="radio", value="text", v-model="selectType")
      label(for="", style="margin-left: 10px")
        span 
          | 新建URL
          input(type="radio", value="url", v-model="selectType")
      label(for="", style="margin-left: 10px")
        span 
          | 新建POST
          input(type="radio", value="post", v-model="selectType") 
      .add-url(v-show="selectType === 'url'")
        p.url-title
          span 标题:
          input.add-group-input.select.query-input(
          type="text",
          v-model="urlTitle",
          v-focus
        )
        p.url-address
          span 地址:
          select.select(v-model="protocol", v-show="selectType === 'url'")
            option(value="http://") http://
            option(value="https://") https://
          input.add-group-input.select.query-input(
          type="text",
          v-model="inputValue",
          v-focus
        )
      .add-group(v-show="selectType === 'text'")
        span 分组名:
        input.add-group-input.select.query-input(
          type="text",
          v-model="inputValue",
          v-focus
        )
    .split-line
    .select-post(v-show="selectType === 'post'")
      .select-post-query
        .select-post-query-width
          input.query-input(
            type="text",
            placeholder="请输入pid",
            v-model="searchContent"
          )
          button.query-button(@click="query(0,'search')") 查询
          button.reset-button(@click="query(0, 'reset')") 重置
      ul.select-post-list
        .list-container(ref="listContainer")
          .list-height(ref="listHeight")
            .post-list-paging
              span(v-for="(page, i) in paging.buttonValue" :key="i" :class="{pageActive:page.type === 'active'}" @click="query(page.num)" )  {{page.type === 'null' ? '...' : page.num}}
            li.post-list-item(v-for="post in postList")
              label.radio-post(for="" )
                input(type="radio" :value="post.firstPost.pid" v-model="selectPostId" @input="selectPost(post)")
              .content
                p.postId {{ post.firstPost.t }}
                p.postContent {{ post.firstPost.c }}
            li(v-if="postList.length === 0" style="font-size:24px") 数据加载中...
            li(v-else-if="!postList" style="font-size:24px") 暂无数据
            .post-list-paging.bottom
              span(v-for="(page, i) in paging.buttonValue" :key="i" :class="{pageActive:page.type === 'active'}" @click="query(page.num)") {{page.type === 'null' ? '...' : page.num}}
    //- .select-tree
    //-   span 请选择新建位置
    //-   Tree(:data="extendedData", :operations="false")
    .m-t-1.m-b-1.text-right
      button.btn.btn-sm.btn-default.m-r-05(@click="close") 关闭
      button.btn.btn-sm.btn-primary(@click="submit") 确定
</template>

<script>
import { DraggableElement } from "../../lib/js/draggable";
import { nkcAPI, nkcUploadFile } from "../../lib/js/netAPI";
import Tree from "./tree/Tree.vue";
import { EventBus } from "../eventBus.js";
import { getState } from "../../lib/js/state";
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
    selectType: "text",
    searchContent: "",
    protocol: "http://",
    inputValue: "默认分组",
    postList: [],
    addResult:'',
    selectPostId:'',
    selectPostData:'',
    insertData:{},
    bid:'',
    type:'',
    urlTitle:'科创',
    dialogType:'add',
    paging:[]
  }),
  created() {
    EventBus.$on("addDialog", ({bid, data, childIndex,title,type='add'}) => {
      this.dialogType=type
      this.title=title
      if (!bid) console.error("bid不存在");
      this.bid=bid,
      this.insertData={
        data,
        index:childIndex
      },
      this.getTreeData(bid);
      this.draggableElement.show();
      if(type === 'editor'){
        switch(data.type){
          case 'url':
            this.urlTitle=data.title;
            this.inputValue=data.url;
            break
          case 'post':
            this.selectPostId=data.id;
            break
          case 'text':
            this.inputValue=data.title
            break
          default:
            console.error('不存在的类型')
        }
        this.selectType=data.type
      }
    });
  },
  watch: {
    selectType() {
      if (this.selectType === "post") {
        this.query(0, "get");
      } else if (this.selectType === "url") {
        this.inputValue = "www.kechuang.org";
      } else if (this.selectType === "text") {
        this.inputValue = "默认新建分组名";
      }
    },
  },
  mounted() {
    this.initDraggableElement();
  },
  updated() {
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

    selectPost(data){
      console.log(data)
      const {firstPost}=data
      this.selectPostData={
        title:firstPost.t,
        id:firstPost.pid,
        url:firstPost.url,
        type:'post',
        child:[]
      }
    },
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
    async query(page = 0, type = "get") {
      let url;
      const { searchContent } = this;
      let username = await getState();
      if (!username.uid) return;
      if (type === "search") {
        if (!searchContent) return;
        url = `/u/${username.uid}/profile/thread?page=${page}&limit=20&type=${type}&pid=${searchContent}`;
      } else {
        url = `/u/${username.uid}/profile/thread?page=${page}&limit=20&type=${type}`;
      }
      this.postList=[]
      const result = await nkcAPI(url, "get");
      this.postList =result.threads.length ? result.threads : ''; // 先不改了
      this.paging =result.paging; // 先不改了
      this.$nextTick(() => {
      if (this.$refs.listHeight.clientHeight < 480) {
        this.$refs.listContainer.setAttribute(
          "class",
          "list-container-noScroll"
        );
      }else{
        this.$refs.listContainer.setAttribute(
          "class",
          "list-container"
        );
      }
    });
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(
        this.$el,
        this.$refs.draggableHandle
      );
    },
    submit: function () {
      // this.callback(this.data);
      // 如果修改 值没改变 就不发送请求
      // 如果是新增 post没有 选中 post 那么 也不执行 后续再加
      if(this.selectType === 'post'){
        this.addResult=this.selectPostData
        this.type='post'
      }else if(this.selectType === 'url'){
        this.addResult={
          title:this.urlTitle,
          url:this.protocol + this.inputValue,
        }
        this.type='url'
      }else{
        this.addResult=this.inputValue
        this.type='text'
      }
      EventBus.$emit('addConfirm',{res:this.addResult, data:this.insertData, dialogType:this.dialogType})
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
    findPid(data,id){

    }
  },
  directives: {
    focus: {
      bind: function (el) {
        el.focus();
        // el.select();
      },
    },
  },
  destroyed(){
    EventBus.$off()
  }
};
</script>


<style lang="less" scoped>
.pageActive{
  background: rgb(248, 226, 211);
}
* {
  padding: 0;
  margin: 0;
  list-style-type: none;
}
.select {
  height: 2rem;
}
.add-group-input {
  flex: auto;
}
.query-input {
  outline: none;
}
.postId {
  font-size: 1.2rem;
  font-weight: 600;
  // margin-right: 3px;
}
.post-list-paging{
  margin-top:10px;
  background: rgb(173, 217, 245);
  height: 20px;
  span{
    transition: all .2s;
    cursor: pointer;
    margin-right: 5px;
    padding: 2px 5px;
    border:1px solid rgb(219, 217, 217);
    border-radius: 3px;
  }
  .bottom{

  }
}
.postContent {
    margin: 0.6rem 0;
    max-height: 4.5rem;
    word-break: break-word;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
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
      border-top: 1px solid rgba(218, 216, 216, 0.514);
      margin-top: 10px;
    }
    padding: 0 1rem;
    .select-type {
      // margin-top: 10px;
      width: 27rem;
      margin: 10px auto;

      .add-url{
        margin-top: 5px;
        .url-title{
          display: flex;
          align-items: center;
        }
        .url-address{
          display: flex;
          align-items: center;
        }
      }
      .add-group {
        margin-top: 5px;
        display: flex;
        align-items: center;
        .add-group-input {
          flex: auto;
        }
      }
    }
    // .split-line{
    //   border-top:1px solid rgba(218, 216, 216, 0.514);
    //   margin-bottom:5px;
    // }
    .select-post {
      margin-top: 10px;
      .select-post-query-width {
        display: flex;
        button{
          padding:0 8px;
          margin-left: 10px;
        }
      }

      .select-post-list {
        display: flex;
        align-items: baseline;
        margin-top: 5px;
        .list-container {
          border: 1px rgba(218, 216, 216, 0.514) solid;
          height: 40rem;
          width:100%;
          overflow-y: scroll;
          .list-height{
            position: relative;
            cursor: pointer;
            .post-list-item:hover{
                background-color: #e6e0db ;
              }
            .post-list-item {
              display: flex;
              align-items: center;
              .radio-post{
                margin-right: 10px;
              }
              .content{
                
              }
              transition: all .3s ;
              padding: 1rem;
              background-color: #f6f2ee;
              border-radius: 3px;
            }
          }
        }
        .list-container-noScroll {
          width: 100%;
          border: 1px rgba(218, 216, 216, 0.514) solid;
          height: 40rem;
          .list-height{
            cursor: pointer;
            .post-list-item:hover{
                background-color: #e6e0db ;
              }
            .post-list-item {
              display: flex;
              align-items: center;
              .radio-post{
                margin-right: 10px;
              }
              .content{
                
              }
              transition: all .3s ;
              padding: 1rem;
              background-color: #f6f2ee;
              border-radius: 3px;
            }
            
          }
        }
        li {
          margin-top: 3px;
        }
        .post-list-title {
          background: rgb(138, 137, 137);
          display: flex;
          align-items: baseline;
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
  background: rgb(212, 212, 211);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>

          