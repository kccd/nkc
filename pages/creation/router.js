import Home from './views/Home';
import Materials from './views/material/Material';
import Material from './views/material/MaterialFolder';
import AddDocument from './views/material/AddDocument'
import Books from './views/book/Books';
import Book from './views/book/Book';
import BookContent from './views/book/BookContent';
import BookEditor from './views/book/BookEditor';
import ArticleEditor from './views/article/ArticleEditor';
const routes = [
  {name: 'home', path: '/creation', component: Home},
  {name: 'materials', path: '/creation/materials', component: Materials},
  {name: 'material', path: '/creation/material/:id', component: Material},
  {name: 'books', path: '/creation/books', component: Books},
  {name: 'addDocument', path: '/creation/materials/editor', component: AddDocument},
  {name: 'book', path: '/creation/book/:bid', component: Book},
  {name: 'bookContent', path: '/creation/book/:bid/:aid', component: BookContent},
  {name: 'bookEditor', path: '/creation/books/editor', component: BookEditor},
  {name: 'articleEditor', path: '/creation/articles/editor', component: ArticleEditor},
];


// 防止路由重复点击报错

const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
