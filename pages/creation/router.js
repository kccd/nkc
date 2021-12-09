import Home from './views/Home';
import Material from './views/Material';
import Books from './views/book/Books';
import Book from './views/book/Book';
import BookSettings from './views/book/BookSettings';
const routes = [
  {name: 'home', path: '/creation', component: Home},
  {name: 'material', path: '/creation/material', component: Material},
  {name: 'books', path: '/creation/books', component: Books},
  {name: 'book', path: '/creation/book/:bid', component: Book},
  {name: 'bookSettings', path: '/creation/book/settings', component: BookSettings},
  {name: 'bookCreator', path: '/creation/books/creator', component: BookSettings},
];

export default new VueRouter({
  mode: 'history',
  routes
});