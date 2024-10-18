<template lang="pug">
  .app-menu-container(ref="container")
    div.pointer(@click.stop='showPanel')
      <more-one theme="outline" size="16" />
    .app-menu-content(v-if="show" :style="`left: ${left}px;`" ref="appMenuContent")
      .app-menu-item(@click="onClick('picture')")
        <new-picture theme="outline" size="18"/>
        span 图片
      .app-menu-item(@click="onClick('audio')")
        <music theme="outline" size="18"/>
        span 音频
      .app-menu-item(@click="onClick('video')")
        <video-two theme="outline" size="18"/>
        span 视频
      .app-menu-item(@click="onClick('attachment')")
        <paperclip theme="outline" size="18"/>
        span 附件
      .app-menu-item(@click="onClick('table')")
        <insert-table theme="outline" size="18"/>
        span 表格
      .app-menu-item(@click="onClick('terminal')")
        <terminal theme="outline" size="18"/>
        span 代码块
</template>

<style scoped lang="less">
.app-menu-container{
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &>div:first-child {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .app-menu-content{
    background-color: #fff;
    position: absolute;
    top: 2rem;
    z-index: 100;
    border-radius: 5px;
    box-shadow: 1px  1px 5px rgba(0, 0, 0, 0.2);
    padding: 0.5rem 0;
    width: 8rem;
    .app-menu-item{
      padding: 0 1rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      height: 2.5rem;
      &:hover{
        background-color: rgba(0, 0, 0, 0.05);
      }
      &>*:first-child{
        padding-top: 4px;
      }
      &>span{
        margin-left: 0.5rem;
      }
    }
  }
}
</style>

<script>
import {
  MoreOne,
  NewPicture,
  VideoTwo,
  InsertTable,
  Music,
  Paperclip,
  Terminal,
} from "@icon-park/vue";
export default {
  components: {
    'more-one': MoreOne,
    'new-picture': NewPicture,
    'video-two': VideoTwo,
    'insert-table': InsertTable,
    'music': Music,
    'paperclip': Paperclip,
    'terminal': Terminal,
  },
  data: () => ({
    callback: null,
    show: false,
    left: 0,
  }),
  mounted() {
    window.addEventListener('click', this.hidePanel);
    window.addEventListener('resize', this.resetLeft);
    this.resetLeft();
  },
  destroyed() {
    window.removeEventListener('click', this.hidePanel);
    window.removeEventListener('resize', this.resetLeft);
  },
  methods: {
    hidePanel() {
      this.show = false;
    },
    showPanel() {
      this.show = true;
    },
    onClick(type) {
      this.$emit('select', type);
      this.hidePanel();
    },
    resetLeft() {
      const container = this.$refs.container;
      const appMenuContent = this.$refs.appMenuContent;
      if(!container || !appMenuContent) return;
      const info = container.getClientRects()[0];
      const right = info.left + appMenuContent.offsetWidth;
      if (right + 16 > window.innerWidth) {
        this.left = window.innerWidth - right - 16;
      } else {
        this.left = 0;
      }
    },
  }
}
</script>
