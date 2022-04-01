<template lang="pug">
  .subscribe-types-list(v-if="targetUser")
    .subscribe-types
      .subscribe-type-edit(@click="editType()") 管理分类
      div 主分类：
        a.subscribe-type(@click="toType('')" :class="!parentType?'active':''") 全部
        a.subscribe-type(v-for="t in subscribeTypes" @click="toType(t._id)" :class="parentType && parentType._id === t._id?'active':''") {{t.name}}
      div.m-t-05(v-if="parentType && parentType.childTypes.length" ) 子分类：
        a.subscribe-type(v-for="t in parentType.childTypes" @click="toType(t._id)" :class="childType && childType._id === t._id?'active':''") {{t.name}}
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.subscribe-types-list {
  padding-bottom: 15px;
  background-color: #fff;
  border-radius: 3px;
  .subscribe-types{
    @typeHeight: 2.2rem;
    position: relative;
    padding-right: 6rem;
    .subscribe-type-edit{
      position: absolute;
      top: 0.4rem;
      cursor: pointer;
      color:@primary;
      right: 0;
    }
    .subscribe-type{
      display: inline-block;
      height: @typeHeight;
      padding: 0 0.5rem;
      background-color: #fff;
      color: @dark;
      margin-bottom: 0.4rem;
      margin-right: 0.5rem;
      line-height: @typeHeight;
      border-radius: 2px;
      border: 1px solid #d4d4d4;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
      &:hover, &:focus{
        text-decoration: none;
      }
      &:hover{
        background-color: #f4f4f4;
      }
      &.active{
        background-color: @primary;
        border: 1px solid @primary;
        color: #fff;
      }
    }
  }
}
</style>
<script>
export default {
  props: ['target-user', 'type', 'parent-type', 'subscribe-types'],
  data: () => ({

  }),
  mounted() {
  },
  methods: {
    //跳转到指定类型
    toType(id) {
      this.$emit('click-type', id);
    }
  }
}
</script>
