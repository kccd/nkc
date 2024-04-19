<template lang="pug">
  .container-fluid.max-width
    .row
      .col-md-offset-2.col-xs-12.col-md-8.min-md-p-r-0
        .box-shadow
          .btn-group.btn-group-justified.m-b-1
            .btn-group(role="group")
              button.btn.btn-default(:class="{'btn-primary': tab === zoneTab.all }" @click="getList(type,'a')") 全部
            .btn-group(role="group")
              button.btn.btn-default(:class="{'btn-primary': tab === zoneTab.subscribe }" @click="getList(type,'s')") 我的关注
          .m-b-05.p-t-05(v-if="uid")
            moment-editor(@published='published')
          .paging-button
            a.button.radius-left(:class="{'active': type === zoneTypes.moment }" @click="getList('m',tab)") 电文
            a.button.radius-right(:class="{'active': type === zoneTypes.article }" @click="getList('a',tab)") 长电文
          paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
          .m-b-1
          bubble(@scroll='scroll' :avatars="avatars" v-if='updated' :isapp='isApp')
          div(v-if="type==='m'")
            div(v-if="loading" style='height:50vh;text-align:center;') 
              .m-b-1(style='position: relative;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size:1.5rem')
                span.fa.fa-spinner.fa-spin
              div(style='position: relative;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size:1.2rem') 加载中...
            div(v-else)
              moments(@handleDetail='handleDetail' :latests="latestData" :moments="momentsData" :permissions="permissions" v-if='momentsData.length > 0')
              .p-t-5.p-b-5.text-center(v-else) 空空如也~
          div.m-b-1(v-if="type==='a'")
            div(v-if="loading" style='height:50vh;text-align:center;') 
              .m-b-1(style='position: relative;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size:1.5rem')
                span.fa.fa-spinner.fa-spin
              div(style='position: relative;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size:1.2rem') 加载中...
            div(v-else)
              div(v-if="articlesPanelData && articlesPanelData.length > 0")
                articles-panel(:articles="articlesPanelData" :panelStyle="latestZoneArticlePanelStyle")
              .p-t-5.p-b-5.text-center(v-else) 空空如也~
          paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
</template>

<style lang="less" scoped></style>

<script>
// import '../../../../../pages/publicModules/articlePanel/articlePanel.less';
import { getDataById } from '../../../js/dataConversion';
import { nkcAPI } from '../../../js/netAPI';
import { visitUrl } from '../../../js/pageSwitch';
import { getSocket } from '../../../js/socket';
import { getState } from '../../../js/state';
import PagingVue from '../../Paging.vue';
import ArticlesPanel from '../ArticlesPanel.vue';
import Bubble from '../Bubble.vue';
import MomentEditorVue from '../MomentEditor.vue';
import Moments from '../Moments.vue';

// import {momentVote} from "../../js/zone/vote";
const { uid } = getState();
const socket = getSocket();
// const { momentsData, permissions, subUid, isApp, tab, zoneTab, type, paging, zoneTypes, articlesPanelData, latestZoneArticlePanelStyle } = getDataById('data');
export default {
  components: {
    moments: Moments,
    bubble: Bubble,
    'moment-editor': MomentEditorVue,
    "paging": PagingVue,
    'articles-panel': ArticlesPanel,
  },
  // props: ['data', 'focus', 'permissions', 'mode', 'type'],
  data: () => ({
    momentsData: [],
    latestData: [],
    permissions: {},
    avatars: [],
    isApp: false,
    tab: '',
    zoneTab: '',
    type: '',
    loading: false,
    paging: {},
    zoneTypes: '',
    latestZoneArticlePanelStyle: {},
    articlesPanelData: [],
    subUid: [],
    uid,
  }),
  created() {
    const { momentsData, permissions, subUid, tab, zoneTab, type, paging, zoneTypes, articlesPanelData, latestZoneArticlePanelStyle } = this.$store.state;
    if (!momentsData && !articlesPanelData) {
      this.getListV2();
    } else {
      this.momentsData = momentsData;
      this.permissions = permissions;
      this.subUid = subUid;
      this.isApp = NKC.configs.isApp;
      this.tab = tab;
      this.zoneTab = zoneTab;
      this.type = type;
      this.paging = paging;
      this.zoneTypes = zoneTypes;
      this.articlesPanelData = articlesPanelData;
      this.latestZoneArticlePanelStyle = latestZoneArticlePanelStyle;
    }


  },
  mounted() {
    if (uid) {
      this.connectZoneHomeRoom();
    }

    const self = this;
    const { savePosition } = self.$store.state
    this.$nextTick(() => {
      const element = document.querySelector('.float-user');
      if (element) {
        element.remove();
      }
      setTimeout(() => {
        window.scrollTo({
          top: savePosition.y || 0,
          // left: this.$store.state.savePosition.x,
          behavior: 'instant',
        });
      },150)

    });

  },
  // watch: {
  //   type(newVal) {
  //     this.updateRoute();
  //   },
  //   tab(newVal) {
  //     this.updateRoute();
  //   },
  //   page(newVal) {
  //     this.updateRoute();
  //   }
  // },
  computed: {
    updated() {
      return this.avatars.length > 0;
    },
    pageButtons() {
      return this.paging && this.paging.buttonValue ? this.paging.buttonValue : [];
    },
  },
  destroyed() { },
  methods: {
    refresh() {
      this.avatars = [];
      localStorage.setItem('zoneTab', 'a');
      visitUrl(
        `${window.location.pathname}?t=m-a`,
      );
    },
    scroll() {
      this.refresh();
    },
    joinRoom() {
      socket.emit('joinRoom', {
        type: 'zoneHome',
        data: {
          testID: 'testID',
        },
      });
    },
    connectZoneHomeRoom() {
      const self = this;
      if (socket.connected) {
        self.joinRoom();
      } else {
        socket.on('connect', () => {
          self.joinRoom();
        });
      }

      socket.on('zoneHomeMessage', ({ bubbleData }) => {
        const data = bubbleData;
        if (uid === data.uid || data.status !== 'normal') {
          return;
        }

        let avatarsArray = [...self.avatars];
        // if (subUid) {
        //   const index = subUid.indexOf(data.uid);
        //   if (index !== -1 && subUid[index] !== uid) {
        //     avatarsArray.unshift(data.avatarUrl);
        //   }
        // } else {
        avatarsArray.unshift(data.avatarUrl);
        // }
        // 需要去重
        self.avatars = [...new Set(avatarsArray)];
      });
    },
    handleDetail(e) {
      const { mid, type } = e;
      // console.log('22222',e);
      // return
      const { isApp } = getState();
      if (isApp) {
        visitUrl(`/z/m/${mid}?type=${type}`,true);
      } else {
        this.$router.push({
          name: 'MomentDetail',
          params: {
            mid,
          },
          query: {
            type
          }
        });
      }
    },
    getList(type, tab, page = 0) {
      if (tab === 's' && !uid) {
        return window.RootApp.openLoginPanel('login')
      }
      localStorage.setItem('zoneTab', `${tab}`);
      const self = this;
      this.type = type;
      this.tab = tab;
      this.loading = true;
      nkcAPI(`/api/v1/zone?t=${type}-${tab}&page=${page}`, 'GET')
        .then((data) => {
          const res = data.data;
          if (res.type === 'm') {
            self.momentsData = res.momentsData;
            self.permissions = res.permissions;
            self.subUid = res.subUid;
            self.tab = res.tab;
            self.zoneTab = res.zoneTab;
            self.type = res.type;
            self.paging = res.paging;
            self.zoneTypes = res.zoneTypes;
            self.avatars = [];
            self.$store.commit('setMomentsData', res.momentsData);
            self.$store.commit('setPaging', res.paging);
            self.$store.commit('setTab', res.tab);
            self.$store.commit('setType', res.type);
            self.$store.commit('setPermissions', res.permissions);
            self.$store.commit('setZoneTab', res.zoneTab);
            self.$store.commit('setZoneTypes', res.zoneTypes);
          } else {
            self.latestZoneArticlePanelStyle = res.latestZoneArticlePanelStyle;
            self.articlesPanelData = res.articlesPanelData;
            self.tab = res.tab;
            self.zoneTab = res.zoneTab;
            self.type = res.type;
            self.paging = res.paging;
            self.zoneTypes = res.zoneTypes;
            self.subUid = res.subUid;
            self.$store.commit('setArticlesPanelData', res.articlesPanelData);
            self.$store.commit('setPaging', res.paging);
            self.$store.commit('setLatestZoneArticlePanelStyle', res.latestZoneArticlePanelStyle);
            self.$store.commit('setTab', res.tab);
            self.$store.commit('setType', res.type);
            self.$store.commit('setPermissions', res.permissions);
            self.$store.commit('setZoneTab', res.zoneTab);
            self.$store.commit('setZoneTypes', res.zoneTypes);
          }
          self.loading = false;
          self.updateRoute(self.type, self.tab, page);
          // self.$nextTick(() => {
          //   self.showCommentPanel();
          // });
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    getListV2() {
      const type = this.$route.query ? this.$route.query.t.split('-')[0] : 'm';
      const tab = this.$route.query ? this.$route.query.t.split('-')[1] : 'a';
      const page = this.$route.query ? this.$route.query.page : 0;
      if (tab === 's' && !uid) {
        return window.RootApp.openLoginPanel('login')
      }
      localStorage.setItem('zoneTab', `${tab}`);
      const self = this;
      this.type = type;
      this.tab = tab;
      this.loading = true;
      nkcAPI(`/api/v1/zone?t=${type}-${tab}&page=${page}`, 'GET')
        .then((data) => {
          const res = data.data;
          if (res.type === 'm') {
            self.momentsData = res.momentsData;
            self.permissions = res.permissions;
            self.subUid = res.subUid;
            self.tab = res.tab;
            self.zoneTab = res.zoneTab;
            self.type = res.type;
            self.paging = res.paging;
            self.zoneTypes = res.zoneTypes;
            self.avatars = [];
            self.$store.commit('setMomentsData', res.momentsData);
            self.$store.commit('setPaging', res.paging);
            self.$store.commit('setTab', res.tab);
            self.$store.commit('setType', res.type);
            self.$store.commit('setPermissions', res.permissions);
            self.$store.commit('setZoneTab', res.zoneTab);
            self.$store.commit('setZoneTypes', res.zoneTypes);
          } else {
            self.latestZoneArticlePanelStyle = res.latestZoneArticlePanelStyle;
            self.articlesPanelData = res.articlesPanelData;
            self.tab = res.tab;
            self.zoneTab = res.zoneTab;
            self.type = res.type;
            self.paging = res.paging;
            self.zoneTypes = res.zoneTypes;
            self.subUid = res.subUid;
            self.$store.commit('setArticlesPanelData', res.articlesPanelData);
            self.$store.commit('setPaging', res.paging);
            self.$store.commit('setLatestZoneArticlePanelStyle', res.latestZoneArticlePanelStyle);
            self.$store.commit('setTab', res.tab);
            self.$store.commit('setType', res.type);
            self.$store.commit('setPermissions', res.permissions);
            self.$store.commit('setZoneTab', res.zoneTab);
            self.$store.commit('setZoneTypes', res.zoneTypes);
          }
          self.loading = false;
          self.updateRoute(self.type, self.tab, page);
          // self.$nextTick(() => {
          //   self.showCommentPanel();
          // });
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    published() {
      visitUrl(
        `/z?t=m-${localStorage.getItem('zoneTab') || 'a'
        }`,
      );
    },
    //点击分页
    clickButton(num) {
      this.getList(this.type, this.tab, num);
    },
    updateRoute(type, tab, page = 0) {
      // const { type, tab, page } = this;
      const newQuery = {
        t: `${type}-${tab}`,
        page: page
      };
      this.$router.replace({ path: '/z', query: newQuery });
    },
  },
};
</script>
