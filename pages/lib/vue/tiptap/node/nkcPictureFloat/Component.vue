<template>
  <node-view-wrapper class="node-view-wrapper">
    <div class="resource-selector-container">
      <resource-selector ref="resourceSelector" />
    </div>

    <span :class="'float-' + this.float">
      <img :src="pictureUrl" :alt="originProps.id" >
      <span>
        <span @click="switchFloat">{{float === 'left'? '右移': '左移'}}</span>
        <span @click="selectResource">选择图片</span>
      </span>
    </span>
    <node-view-content class="node-view-content" />
  </node-view-wrapper>
</template>

<script>
import {nodeViewProps, NodeViewContent, NodeViewWrapper} from "@tiptap/vue-2";
import {getUrl} from "../../../../js/tools";
import ResourceSelector from '../../../ResourceSelector.vue';
export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'node-view-content': NodeViewContent,
    'resource-selector': ResourceSelector,
  },
  props: nodeViewProps,
  computed: {
    float() {
      return this.originProps.float === 'left' ? 'left' : 'right'
    },
    originProps() {
      return {
        id: this.node.attrs.id,
        float: this.node.attrs.float,
      }
    },
    pictureUrl() {
      return getUrl('resource', this.originProps.id);
    }
  },
  methods: {
    switchFloat() {
      this.node.attrs.float = this.float === 'left' ? 'right' : 'left';
    },
    selectResource() {
      this.$refs.resourceSelector.open((res) => {
        this.node.attrs.id = res.resourcesId[0];
        this.$refs.resourceSelector.close();
      }, {
        countLimit: 1,
        allowedExt: ['picture'],
        fastSelect: false,
      });
    }
  }
}
</script>

<style scoped lang="less">
.resource-selector-container{
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
.node-view-wrapper{
  margin-bottom: 1rem;
  overflow: hidden;
  .node-view-content{
    border: 1px solid #f4f4f4;
    min-height: 10rem;
  }
  img{
    border-radius: 5px;
    position: absolute;
    top: 1rem;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &>span{
    width: 39%;
    padding-top: 26%;
    position: relative;
    margin-bottom: 1rem;
    &.float-left{
      float: left;
      margin-right: 1.5rem;
    }
    &.float-right{
      float: right;
      margin-left: 1.5rem;
    }
    &>span{
      position: absolute;
      top: 1.3rem;
      right: 0.5rem;
      user-select: none;
      span{
        cursor: pointer;
        display: inline-block;
        font-size: 1rem;
        height: 1.8rem;
        line-height: 1.8rem;
        padding: 0 0.4rem;
        border-radius: 2px;
        background-color: rgba(255, 255, 255, 0.6);
        &:hover, &:active{
          background-color: rgba(255, 255, 255, 1);
        }
      }
    }
  }
}
</style>