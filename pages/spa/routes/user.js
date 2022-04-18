import User from '../views/user/user';
import UserFollowerAndFans from "../../lib/vue/publicVue/userFollowAndFans/UserFollowerAndFans";
import UserMoment from "../views/user/propfile/profile/UserMoment";
import UserPostList from "../views/user/propfile/profile/UserPostList";
import Subscribe from "../views/user/subscribe/Subscribe";
import ProfileView from "../views/user/propfile/ProfileView";
import Profile from "../views/user/propfile/profile/Profile";
import SubscribeColumns from "../views/user/subscribe/SubscribeColumns";
import SubscribeBlacklist from "../views/user/subscribe/SubscribeBlacklist";
import SubscribeUsers from "../views/user/subscribe/SubscribeUsers";
import SubscribeForums from "../views/user/subscribe/SubscribeForums";
import SubscribeCollection from "../views/user/subscribe/SubscribeCollection";
import Finance from "../views/user/propfile/profile/Finance";
import UserColumnThread from "../views/user/propfile/profile/UserColumnThread";
export const routerName = {
  user: 'userHome',
  follower: 'follower',
  fan: 'fan',
  moment: 'moment',
  post: 'post',
  blacklist: 'blacklist',
  subscribe: 'subscribe',
  thread: 'thread',
  profile: 'profile',
  accountUser: 'accountUser',
  subColumns: 'subColumns',
  subUsers: 'subUsers',
  subForums: 'subForums',
  subThreads: 'subThreads',
  profileView: 'profileView',
  subCollection: 'subCollection',
  finance: 'finance',
  column: 'column',
}

export default [
  {
    name: routerName.user,
    path: '/u/:uid',
    redirect: '/u/:uid/p/moment',
    component: User,
    children: [
      {
        name: routerName.profileView,
        path: '/u/:uid/p',
        component: ProfileView,
        redirect: '/u/:uid/p/moment',
        children: [
          {
            name: routerName.profile,
            path: '/',
            redirect: '/u/:uid/p/moment',
            component: Profile,
            children: [
              {
                name: routerName.moment,
                path: '/u/:uid/p/moment',
                component: UserMoment,
              },
              {
                name: routerName.post,
                path: '/u/:uid/p/post',
                component: UserPostList
              },
              {
                name: routerName.thread,
                path: '/u/:uid/p/thread',
                component: UserPostList
              },
              {
                name: routerName.follower,
                path: '/u/:uid/p/follower',
                component: UserFollowerAndFans,
                props: { pageType: "follower" }
              },
              {
                name: routerName.fan,
                path: '/u/:uid/p/fan',
                component: UserFollowerAndFans,
                props: { pageType: "fan" }
              },
              {
                name: routerName.column,
                path: '/u/:uid/p/column',
                component: UserColumnThread,
              }
            ]
          },
          {
            name: routerName.subscribe,
            path: '/u/:uid/p/s',
            component: Subscribe,
            children: [
              {
                name: routerName.blacklist,
                path: '/u/:uid/p/s/blacklist',
                component: SubscribeBlacklist,
              },
              {
                name: routerName.subColumns,
                path: '/u/:uid/p/s/column',
                component: SubscribeColumns,
              },
              {
                name: routerName.subForums,
                path: '/u/:uid/p/s/forum',
                component: SubscribeForums,
              },
              {
                name: routerName.subUsers,
                path: '/u/:uid/p/s/user',
                component: SubscribeUsers,
              },
              {
                name: routerName.subCollection,
                path: '/u/:uid/p/s/collection',
                component: SubscribeCollection,
              }
            ]
          }
        ]
      },
      {
        name: routerName.finance,
        path: '/u/:uid/p/finance',
        component: Finance,
      },
    ],
    
  }
]

