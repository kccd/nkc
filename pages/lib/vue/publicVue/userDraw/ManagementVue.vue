<template lang="pug">
  .m-b-1(v-if="management.length !== 0")
    .panel-header 管理
    .module-managements
      a.module-management(v-for="m in management" :href="m.url" target='_blank')
        .fa(:class="m.icon")
        span &nbsp;{{m.name}}
        .management-count(v-if="m.count !== 0") {{m.count}}
</template>

<script>
export default {
  props: ['management'],
  data: () => ({
  }),
  mounted() {},
  methods: {
  }
}
</script>

<style lang="less" scoped>
.module-management{
  display: inline-block;
  margin-right: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #7e8da0;
  position: relative;
}
.module-management:hover, .module-management:focus{
  text-decoration: none;
  color: #282c37;
}
.module-management .management-count{
  display: inline-block;
  position: absolute;
  top: -0.5rem;
  right: -1rem;
  height: 1.3rem;
  line-height: 1.4rem;
  padding: 0 0.4rem;
  font-size: 1rem;
  border-radius: 0.65rem;
  background-color: rgba(255, 0, 0, 0.6);
  color: #fff;
}
</style>
