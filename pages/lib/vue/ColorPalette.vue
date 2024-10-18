<template lang="pug">
  div.color-palette-container
    div(v-if="defaultColor")
      div.color-palette-color-item.pointer(:style="`background-color: ${defaultColor}`" @click="selectDefaultColor(defaultColor)")
      span.font-size-1rem 默认
    div.color-palette-list(v-for="colorList in colors")
      div.color-palette-color-item.pointer(:style="`background-color: ${color}`" v-for="color in colorList" :title="color" @click="selectColor(color)")

</template>

<style scoped lang="less">
.color-palette-container{
  width: 19rem;
  &>div:nth-child(1) {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    &>div{
      margin-right: 0.5rem;
    }
  }
  .color-palette-list{
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
    &>div{

    }
  }
}
.color-palette-color-item{
  height: 1.5rem;
  width: 1.5rem;
  border: 1px solid #e6e6e6;
}
</style>

<script>
export const colorPaletteColors = [
  ["#000000", "#262626", "#585a5a", "#8a8f8d", "#d8dad9", "#e7e9e8", "#eff0f0", "#f4f5f5", "#fafafa", "#ffffff"],
  ["#df2a3f", "#ed740c", "#ecaa04", "#fbde28", "#74b602", "#1dc0c9", "#117cee", "#2f4bda", "#601bde", "#d22d8d"],
  ["#fbe4e7", "#fde6d3", "#f9efcd", "#fbf5cb", "#e8f7cf", "#cef5f7", "#d9eafc", "#d9dffc", "#e6dcf9", "#fbe3ef"],
  ["#f1a2ab", "#f8b881", "#f5d480", "#fce75a", "#c1e77e", "#81dfe4", "#81bbf8", "#96a7fd", "#ba9bf2", "#f297cc"],
  ["#e4495b", "#f38f39", "#f3bb2f", "#edce02", "#8ccf17", "#01b2bc", "#2f8ef4", "#4861e0", "#7e45e8", "#e746a4"],
  ["#ad1a2b", "#c75c00", "#c99103", "#a58f04", "#5c8d07", "#07787e", "#0c68ca", "#213bc0", "#4c16b1", "#ae146e"],
  ["#70000d", "#663000", "#664900", "#665800", "#2a4200", "#004347", "#00346b", "#101e60", "#270070", "#5c0036"],
];
export default {
  props: ['defaultColor'],
  data: () => ({
    colors: colorPaletteColors
  }),
  methods: {
    selectDefaultColor(color) {
      this.$emit('select', {
        type: 'default',
        color: color,
      });
    },
    selectColor(color) {
      this.$emit('select', {
        type: 'custom',
        color: color,
      });
    }
  }

}

</script>