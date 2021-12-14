import Home from './views/Home';
import Material from './views/Material';
import Books from './views/book/Books';
import Book from './views/book/Book';
import BookEditor from './views/book/BookEditor';
import ArticleEditor from './views/article/ArticleEditor';
const routes = [
  {name: 'home', path: '/creation', component: Home},
  {name: 'material', path: '/creation/material', component: Material},
  {name: 'books', path: '/creation/books', component: Books},
  {name: 'book', path: '/creation/book/:bid', component: Book},
  {name: 'bookEditor', path: '/creation/book/:bid/edit', component: BookEditor},
  {name: 'bookCreator', path: '/creation/books/creator', component: BookEditor},
  {name: 'articleCreator', path: '/creation/articles/creator', component: ArticleEditor},
  {name: 'articleEditor', path: '/creation/article/:aid/edit', component: ArticleEditor},
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;