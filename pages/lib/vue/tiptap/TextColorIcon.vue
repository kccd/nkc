<template lang="pug">
  div.tiptap-text-color-icon(ref="container")
    div.pointer(:title="title" @click="selectedColor({color: color, type: type})")
      <font-size-two theme="outline" size="12" v-if="category === 'color'" />
      <high-light theme="outline" size="14" v-else />
      div(:style="`background-color: ${color}`")
    div.pointer(@click.stop="showPanel")
      <down theme="outline" size="10" />
    div(v-if="isPanelShow" :style="`transform: translateX(${colorPaletteContainerLeft}px)`" ref="colorPaletteContainer")
      color-palette(:default-color="defaultColor" @select="selectedColor")
    div(v-if="isPanelShow" @click="hidePanel")
</template>

<script>
import ColorPalette from '../ColorPalette.vue'
import {FontSizeTwo, Down, HighLight} from '@icon-park/vue'
import {colorPaletteColors} from "../ColorPalette.vue";

export default {
  components: {
    'font-size-two': FontSizeTwo,
    'down': Down,
    'color-palette': ColorPalette,
    'high-light': HighLight,
  },
  data: () => ({
    isPanelShow: false,
    colorPaletteContainerLeft: 0,
    color: colorPaletteColors[1][2],
    type: 'custom',
  }),
  computed: {
    defaultColor() {
      return this.category === 'color'? '#333': ''
    }
  },
  props: ['title', 'category'],
  mounted() {
    window.addEventListener('click', this.hidePanel);
    window.addEventListener('resize', this.resetColorPalettePosition)
    this.resetColorPalettePosition();
  },
  destroyed() {
    window.removeEventListener('click', this.hidePanel);
    window.removeEventListener('resize', this.resetColorPalettePosition)
  },
  methods: {
    selectedColor(res) {
      const {type, color} = res;
      this.color = color;
      this.type = type;
      this.$emit('select', {
        type,
        color
      });
    },
    resetColorPalettePosition() {
      const container = this.$refs.container;
      const colorPaletteContainer = this.$refs.colorPaletteContainer;
      if(!container || !colorPaletteContainer) return;
      const info = container.getClientRects()[0];
      const right = info.left + colorPaletteContainer.offsetWidth;
      if (right + 16 > window.innerWidth) {
        this.colorPaletteContainerLeft = window.innerWidth - right - 16;
      } else {
        this.colorPaletteContainerLeft = 0;
      }
    },
    showPanel() {
      this.isPanelShow = !this.isPanelShow;
    },
    hidePanel() {
      this.isPanelShow = false;
    }
  }
}
</script>

<style scoped lang="less">
.tiptap-text-color-icon {
  border: 1px solid #999;
  display: flex;
  flex-direction: row;
  margin-top: -4px;
  width: 100%;
  position: relative;
  & > div:first-child {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0.2rem;
    div{
      align-items: center;
      margin-top: -0.3rem;
      height: 0.3rem;
      width: 1rem;
      margin-bottom: 0.2rem;
    }
    &:hover{
      color: #2b90d9;
    }
  }
  & > div:nth-child(2) {
    flex: 1;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover{
      color: #2b90d9;
    }
  }
  & > div:nth-child(3) {
    position: absolute;
    top: 2rem;
    left: 0;
    background-color: #fff;
    z-index: 100;
    border-radius: 5px;
    box-shadow: 1px  1px 5px rgba(0, 0, 0, 0.2);
    padding: 1rem;
  }

  & > div:nth-child(4) {
    position: fixed;
    top:0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
  }
}
</style>