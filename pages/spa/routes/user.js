import User from '../views/user/user';
export const routerName = {
  user: 'userHome',
}

export default [
  {
    name: routerName.user,
    path: '/u/:uid',
    component: User,
  }
]

