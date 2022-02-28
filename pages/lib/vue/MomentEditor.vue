<template lang="pug">
  .moment-editor
    .content-container
      textarea
    .buttons-container
      .button-icon
        .icon.fa.fa-image
        span 媒体
      .button-post
        button 发表
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .moment-editor{
    .content-container{
      textarea{
        height: 10rem;
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 3px;
      }
    }
    .buttons-container{
      @buttonHeight: 2.5rem;
      @buttonPostWidth: 4rem;
      position: relative;
      padding-right: @buttonPostWidth;
      .button-icon{
        height: @buttonHeight;
        border-radius: 50%;
        display: inline-block;
        line-height: @buttonHeight;
        cursor: pointer;
        color: #555;
        .icon{
          font-size: 1.4rem;
          margin-right: 0.2rem;
          color: #777;
          transition: color 100ms;
        }
        span{
          font-size: 1.25rem;
          transition: color 100ms;
        }
        &:hover{
          .icon, span{
            color: #333;
          }

        }
      }
      .button-post{
        position: absolute;
        top: 0;
        right: 0;
        width: @buttonPostWidth;
        height: @buttonHeight;
        border-radius: 50%;
        button{
          height: 100%;
          width: 100%;
          background-color: @accent;
          border: none;
          color: #fff;
        }
      }
    }
  }
</style>

<script>
  export default {
    data: () => ({

    })
  }
</script>