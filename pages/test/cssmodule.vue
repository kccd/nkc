<template>
  <div>
    <h1 :class="[$style.title, custom]" @click="change()">
      Hello World
      <a :class="$style.link" href="http://www.google.com">Google</a>
    </h1>
    <div @click="consolePrint()">console print</div>
  </div>
</template>
<script>
export default {
  data: () => ({
    custom: ""
  }),
  methods: {
    change() {
      console.log(this.$style)
      this.custom = this.$style.small;
    },
    consolePrint: () => {
      const a = 100;
      console.log(a);
    }
  }
}
</script>

<style module scoped lang="less">
  .title {
    color: green;
    transition: font-size .5s;
    .link {
      color: blue;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .small {
    font-size: 1.5em;
  }
</style>