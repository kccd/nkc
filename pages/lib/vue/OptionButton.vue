<template lang="pug">
  .option-button
    common-modal(ref="commonModal")
    resource-selector(ref="resourceSelector")
    a(@click="back" :class="{'disabled': (!canBack || mark)}")
      .fa.fa-arrow-left &nbsp;
      | 返回上一层
    a(@click="createFolder" :class="{'disabled': mark}")
      .fa.fa-plus &nbsp;
      | 新建文件夹
    a(@click="addFiles" :class="{'disabled': mark}")
      .fa.fa-plus &nbsp;
      | 添加文件
    a(@click="addDocument" :class="{'disabled': mark}")
      .fa.fa-plus &nbsp;
      | 添加文档
    .display-i-b
      a(@click="markSelect")
        .fa.fa-dot-circle-o &nbsp;
          span(v-if="!mark") 多选
          span(v-else) 取消
      span(v-if="mark")
        a(@click="allSelected")
          .fa.fa-square &nbsp;
          |
          span(v-if="!allSelect") 全选
          span(v-if="allSelect") 取消全选
        span
          //a(@click="moveFolders")
          //  .fa.fa-arrows &nbsp;
          //  | 移动
          a(@click="delFolders")
            .fa.fa-trash &nbsp;
            | 删除
</template>

<style lang="less" scoped>
.option-button {
  display: inline-block;
  padding-right: 1rem;
  a.disabled, a.disabled:hover, a.disabled:focus{
    background-color: #f7f7f7;
    color: #ccc;
    cursor: not-allowed;
  }
  a {
    &:hover {
      text-decoration: none;
      background-color: #2b90d9;
      color: #fff;
    }
    &:focus {
      text-decoration: none;
      background-color: #2b90d9;
      color: #fff;
    }
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -khtml-user-select: none;
    user-select: none;
    display: inline-block;
    height: 2rem;
    cursor: pointer;
    color: #777;
    line-height: 2rem;
    text-align: center;
    min-width: 2rem;
    margin-right: 0.3rem;
    padding: 0 0.8rem;
    font-size: 1.2rem;
    background-color: #f4f4f4;
    border-radius: 3px;
    transition: background-color 200ms, color 200ms;
    margin-bottom: 0.5rem;
    .fa {
      display: inline-block;
      font: normal normal normal 14px/1 FontAwesome;
      font-size: inherit;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
    }
  }
  .display-i-b {
      display: inline-block;
  }
}
</style>

<script>
import CommonModal from './CommonModal';
import ResourceSelector from './ResourceSelector'
export default {
  props: ['mark'],
  data: function (){
    return {
      folderName: "",
      decoration: "",
      allSelect: false,
      canBack: true,
    }
  },
  components: {
    'common-modal': CommonModal,
    'resource-selector': ResourceSelector,
  },
  mounted() {
    if(this.$route.path === '/creation/materials') {
      this.canBack =  false;
    }
  },
  computed: {},
  methods: {
    //返回上一层
    back() {
      if(!this.canBack) return;
      this.$emit('back');
    },
    //添加文件
    addFiles() {
      const self = this;
      this.$refs.resourceSelector.open(function(data) {
        let r = data.resources[0];
        self.$emit('add-files', r);
      });
    },
    //新建文件夹
    createFolder() {
      if(this.mark) return;
      const self = this;
      this.$refs.commonModal.open(function(data) {
        if(data) {
          if(data[0].value === '') return sweetError('请输入文件夹名');
          self.$emit('create', data);
          self.$refs.commonModal.close();
        }
      }, {
        data: [
          {
            label: "请输入文件夹名",
            dom: "input",
            value: this.folderName
          },
          {
            label: "请输入文件夹描述信息",
            dom: "input",
            value: this.decoration
          }
        ],
        title: "新建文件夹"
      });
    },
    allSelected() {
      if(!this.allSelect) {
        //全部选中
        this.$emit('all-selected')
      } else {
        //取消全部选中
        this.$emit('all-unselected')
      }
      this.allSelect = !this.allSelect;
    },
    delFolders() {
      this.$emit('del-folders');
    },
    markSelect() {
      if(!this.mark) {
        //文件多选
        this.$emit('select');
      } else {
        //取消多选
        this.$emit('cancel');
      }
    },
    //移动文件夹
    moveFolders() {
      this.$emit('move-folders');
    },
    //添加文档
    addDocument() {
      this.$emit('add-document');
    }
  }
}
</script>
