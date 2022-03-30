import User from '../views/user/user';
import UserFollowAndFans from "../../lib/vue/publicVue/userFollowAndFans/UserFollowAndFans";
import UserMoment from "../../lib/vue/publicVue/userCard/UserMoment";
import UserPostList from "../../lib/vue/publicVue/userCard/UserPostList";
import Subscribe from "../views/user/subscribe/Subscribe";
import Profile from "../views/user/propfile/Profile";
import SubscribeColumns from "../views/user/subscribe/SubscribeColumns";
import SubscribeBlackList from "../views/user/subscribe/SubscribeBlackList";
import SubscribeUsers from "../views/user/subscribe/SubscribeUsers";
import SubscribeForums from "../views/user/subscribe/SubscribeForums";
import SubscribeThreads from "../views/user/subscribe/SubscribeThreads";
export const routerName = {
  user: 'userHome',
  follow: 'follow',
  fans: 'fans',
  moment: 'moment',
  post: 'post',
  blackList: 'blackList',
  subscribe: 'subscribe',
  thread: 'thread',
  profile: 'profile',
  subColumns: 'subColumns',
  subUsers: 'subUsers',
  subForums: 'subForums',
  subThreads: 'subThreads',
}

export default [
  {
    name: routerName.user,
    path: '/u/:uid',
    redirect: '/u/:uid/content/moment',
    component: User,
    children: [
      {
        name: routerName.subscribe,
        path: '/u/:uid/s',
        component: Subscribe,
        redirect: '/u/:uid/s/user',
        children: [
          {
            name: routerName.blackList,
            path: '/u/:uid/s/blackList',
            component: SubscribeBlackList,
          },
          {
            name: routerName.subColumns,
            path: '/u/:uid/s/column',
            component: SubscribeColumns,
          },
          {
            name: routerName.subForums,
            path: '/u/:uid/s/forum',
            component: SubscribeForums,
          },
          {
            name: routerName.subUsers,
            path: '/u/:uid/s/user',
            component: SubscribeUsers,
          },
          {
            name: routerName.subThreads,
            path: '/u/:uid/s/thread',
            component: SubscribeThreads,
          }
        ]
      },
      {
        name: routerName.profile,
        path: '/u/:uid/content',
        component: Profile,
        redirect: '/u/:uid/content/moment',
        children: [
          {
            name: routerName.moment,
            path: '/u/:uid/content/moment',
            component: UserMoment,
          },
          {
            name: routerName.post,
            path: '/u/:uid/content/post',
            component: UserPostList
          },
          {
            name: routerName.thread,
            path: '/u/:uid/content/thread',
            component: UserPostList
          },
          {
            name: routerName.follow,
            path: '/u/:uid/content/follow',
            component: UserFollowAndFans,
            props: { pageType: "follow" }
          },
          {
            name: routerName.fans,
            path: '/u/:uid/content/fans',
            component: UserFollowAndFans,
            props: { pageType: "fans" }
          }
        ]
      }
    ],
    
  }
]

