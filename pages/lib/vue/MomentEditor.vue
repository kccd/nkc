<template lang="pug">
  .moment-editor
    resource-selector(ref="resourceSelector")
    .content-body.ghost
      .content-container
        textarea.ghost(
          ref="ghostTextarea"
          v-model="content"
        )
    .content-body
      .content-container
        textarea(
          ref="textarea"
          @input="setTextareaSize"
          :style="'height:' + textareaHeight"
          v-model="content"
          placeholder="想分享什么新鲜事？"
          )
    .buttons-container
      .button-icon(@click="selectMedia")
        .icon.fa.fa-image
        span 媒体
      .button-icon
        .icon.fa.fa-smile-o.icon-face
        span 表情
      .button-pull
        span.number(:class="{'warning': remainingWords < 0}") {{remainingWords}}
        button.publish 发动态
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .moment-editor{
    position: relative;
    .content-body.ghost{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: -1;
    }
    .content-container{
      margin-bottom: 0.5rem;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 0.5rem;
      textarea{
        min-height: 4rem;
        resize: none;
        overflow: hidden;
        width: 100%;
        border: none;
        font-size: 1.25rem;
        line-height: 2rem;
        border-radius: 0;
        outline: none;
        padding: 0;
        &.ghost{
          overflow: auto;
        }
      }
    }
    .buttons-container{
      @buttonHeight: 2.5rem;
      @buttonPostWidth: 5rem;
      position: relative;
      padding-right: @buttonPostWidth;
      .button-icon{
        height: @buttonHeight;
        border-radius: 50%;
        display: inline-block;
        line-height: @buttonHeight;
        cursor: pointer;
        color: #555;
        margin-right: 0.5rem;
        .icon{
          font-size: 1.6rem;
          margin-right: 0.3rem;
          color: #777;
          transition: color 100ms;
          &.icon-face{
            font-size: 1.8rem;
          }
        }
        span{
          font-size: 1.15rem;
          transition: color 100ms;
        }
        &:hover{
          .icon, span{
            color: #333;
          }

        }
      }
      .button-pull{
        position: absolute;
        top: 0;
        right: 0;
        height: @buttonHeight;
        overflow: hidden;
        span.number{
          margin-right: 0.3rem;
          color: #555;
          &.warning{
            color: red;
          }
        }
        button.publish{
          width: @buttonPostWidth;
          border-radius: @buttonHeight / 2;
          height: 100%;
          font-size: 1.2rem;
          background-color: @accent;
          border: none;
          color: #fff;
        }
      }
    }
  }
</style>

<script>
  import ResourceSelector from './ResourceSelector';
  import {getLength} from '../js/checkData';
  export default {
    components: {
      'resource-selector': ResourceSelector
    },
    data: () => ({
      textareaHeight: '0',
      maxContentLength: 1000,
      content: ''
    }),
    computed: {
      contentLength() {
        const {content} = this;
        return getLength(content);
      },
      allowedToPublish() {
        const {contentLength, maxContentLength} = this;
        return contentLength <= maxContentLength;
      },
      remainingWords() {
        const {maxContentLength, contentLength} = this;
        return maxContentLength - contentLength;
      }
    },
    methods: {
      setTextareaSize() {
        const self = this;
        setTimeout(() => {
          const ghostElement = self.$refs.ghostTextarea;
          const scrollHeight = ghostElement.scrollHeight;
          self.textareaHeight = scrollHeight + 'px';
        });
      },
      selectMedia() {
        this.$refs.resourceSelector.open(data => {
          console.log(data);
        })
      },
      publishContent() {

      },
      autoSaveContent() {
        const {content} = this;
      }
    }
  }
</script>