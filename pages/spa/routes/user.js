import User from '../views/user/user';
import UserFollowAndFans from "../../lib/vue/publicVue/userFollowAndFans/UserFollowAndFans";
import UserMoment from "../../lib/vue/publicVue/userCard/UserMoment";
import UserPostList from "../../lib/vue/publicVue/userCard/UserPostList";
import Subscribe from "../views/user/subscribe/Subscribe";
export const routerName = {
  user: 'userHome',
  follow: 'follow',
  fans: 'fans',
  moment: 'moment',
  post: 'post',
  thread: 'thread',
  subscribe: 'subscribe',
}

export default [
  {
    name: routerName.user,
    path: '/u/:uid',
    redirect: '/u/:uid/moment',
    component: User,
    // children: [
    //   {
    //     name: routerName.subscribe,
    //     path: '/u/:uid/profile',
    //     component: Subscribe,
    //   }
    // ],
    children: [
      {
        name: routerName.moment,
        path: '/u/:uid/moment',
        component: UserMoment,
      },
      {
        name: routerName.post,
        path: '/u/:uid/post',
        component: UserPostList
      },
      {
        name: routerName.thread,
        path: '/u/:uid/thread',
        component: UserPostList
      },
      {
        name: routerName.follow,
        path: '/u/:uid/follow',
        component: UserFollowAndFans,
        props: { pageType: "follow" }
      },
      {
        name: routerName.fans,
        path: '/u/:uid/fans',
        component: UserFollowAndFans,
        props: { pageType: "fans" }
      }
    ]
  }
]

