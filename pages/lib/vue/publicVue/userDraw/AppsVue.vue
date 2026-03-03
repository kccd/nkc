<template lang="pug">
  .module-apps.m-b-1
    .panel-header 网站应用

    a.module-app(v-for="app in apps" :href="app.url" :key="app.url" target="_blank" :title="app.name")
      img(:src=`app.icon`)
      span {{app.name}}

    a.module-app(v-if="permission.hasUser" href="/exam")
      img(src=`/statics/apps/exam.png`)
      span 考试系统

</template>

<script>
import { nkcAPI } from '../../../js/netAPI';
export default {
  props: ['permission'],
  data: () => ({
    apps: [],
  }),
  mounted() {
    this.getApps();
  },
  methods: {
    getApps() {
      nkcAPI(`/apps`, 'GET')
        .then((res) => {
          this.apps = res.appsData || [];
          console.log(this.apps);
        })
        .catch((err) => {
          console.error('获取应用列表失败', err);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.module-apps {
  /*background-color: #eee;*/
}
.module-app {
  overflow: hidden;
  width: 4rem;
  margin-right: 0.7rem;
  text-decoration: none;
  display: inline-block;
  color: #282c37;
  font-weight: 700;
  text-align: center;
}
.module-app:hover,
.module-app:focus {
  text-decoration: none;
  color: #282c37;
}
.module-app img {
  height: 3rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  width: 3rem;
  border-radius: 3px;
  display: block;
}
.module-app span {
  font-size: 1rem;
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
