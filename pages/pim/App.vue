<template lang="pug">
  v-app
    v-navigation-drawer(
      app
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
      )
      <v-list-item class="px-2">
      <v-list-item-avatar>
        <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
      </v-list-item-avatar>

      <v-list-item-title>John Leider</v-list-item-title>

      <v-btn icon @click.stop="mini = !mini">
          <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
      <v-list-item v-for="item in items" :key="item.title" link @click='navToPage(item.page)'>
      <v-list-item-icon>
      <v-icon>{{ item.icon }}</v-icon>
      </v-list-item-icon>

      <v-list-item-content>
      <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item-content>

      </v-list-item>
      </v-list>
    v-app-bar(app)
      v-app-bar-nav-icon(@click="drawer = !drawer")
      v-toolbar-title 产品管理系统
    v-main
      v-container
        //<vue-simple-spinner size="medium" />
        router-view
</template>
<script>
  import VueSimpleSpinner from 'vue-simple-spinner';
  export default {
    data: () => ({
      drawer: false,
      items: [
        { title: '数据总览', icon: 'mdi-home-city', page: 'home'},
        { title: '我的团队', icon: 'mdi-account', page: 'team'},
        { title: '消息', icon: 'mdi-account-group-outline', page: 'target' },
      ],
      mini: false,
    }),
    components: {
      VueSimpleSpinner
    },
    methods: {
      navToPage(page) {
        this.$router.push(page);
      }
    }
  }
</script>
