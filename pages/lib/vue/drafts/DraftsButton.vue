<template lang="pug">
  .option-button
    a(@click="editDraft")
      .fa.fa-plus &nbsp;
      | 添加草稿
    a(@click="trash")
      .fa.fa-trash &nbsp;
      | 回收站
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
export default {
  data: function (){
    return {
      folderName: "",
      decoration: "",
      allSelect: false,
      canBack: true,
      draftName: '',
      draftDecoration: ''
    }
  },
  components: {
  },
  mounted() {
  },
  computed: {},
  methods: {
    //创建草稿
    editDraft() {
      this.$emit('edit-draft');
    },
    //进入回收站
    trash() {
    }
  }
}
</script>
