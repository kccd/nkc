import User from '../views/user/user';
import UserFollowAndFans from "../../lib/vue/publicVue/userFollowAndFans/UserFollowAndFans";
import UserMoment from "../../lib/vue/publicVue/userCard/UserMoment";
import UserPostList from "../../lib/vue/publicVue/userCard/UserPostList";
export const routerName = {
  user: 'userHome',
  follow: 'follow',
  fans: 'fans',
  moment: 'moment',
  post: 'post',
  thread: 'thread'
}

export default [
  {
    name: routerName.user,
    path: '/u/:uid',
    component: User,
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

