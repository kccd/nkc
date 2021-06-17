<template>
  <div>
    <h1 class="title">
      Hello World
      <a class="link" href="http://www.google.com">Google</a>
    </h1>
    <div @click="consolePrint()">console print</div>
  </div>
</template>
<script>
import bundle from /* preval */ "./lib/bundle.preval.js";

console.log(bundle);

export default {
  data: () => ({
    
  }),
  methods: {
    consolePrint: () => {
      const a = 100;
      console.log(a);
    }
  }
}
</script>

<style scoped lang="less">
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