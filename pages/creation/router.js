import Home from './views/Home';
import Material from './views/Material';
import Books from './views/book/Books';
import Book from './views/book/Book';
import BookEditor from './views/book/BookEditor';
import ArticleEditor from './views/article/ArticleEditor';
const routes = [
  {name: 'home', path: '/creation', component: Home},
  {name: 'materials', path: '/creation/materials', component: Material},
  {name: 'material', path: '/creation/material/:mid', component: Material},
  {name: 'books', path: '/creation/books', component: Books},
  {name: 'book', path: '/creation/book/:bid', component: Book},
  {name: 'bookEditor', path: '/creation/books/editor', component: BookEditor},
  {name: 'articleEditor', path: '/creation/articles/editor', component: ArticleEditor},
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;