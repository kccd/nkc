import Home from './views/Home';
import Materials from './views/material/Material';
import Material from './views/material/MaterialFolder';
import DocumentEditor from './views/material/DocumentEditor'
import Books from './views/book/Books';
import Book from './views/book/Book';
import BookContent from './views/book/BookContent';
import BookEditor from './views/book/BookEditor';
import ArticleEditor from './views/article/ArticleEditor';
import Categories from './views/category/Categories';
import Drafts from './views/drafts/drafts';
import Articles from './views/articles/Articles';
import ArticlesColumn from './views/articles/Column';
import Community from './views/community/Community';
import CommunityThread from './views/community/Thread';
import CommunityPost from './views/community/Post';
import CommunityDraft from './views/community/Draft';
import CommunityNote from './views/community/Note';
import Column from './views/column/Column';
import ColumnArticle from './views/column/Article';
import ColumnDraft from './views/column/Draft';
import ColumnArticleEditor from './views/editor/ColumnArticleEditor';
import CommunityThreadEditor from './views/editor/CommunityThreadEditor';
import ZoneEditor from './views/editor/ZoneEditor/ZoneEditor';
import ZoneArticleEditor from './views/editor/ZoneEditor/ZoneArticleEditor';
import ZoneMomentEditor from './views/editor/ZoneEditor/ZoneMomentEditor';
// import BookEditor from './views/editor/BookEditor';
import Zone from './views/zone/Zone';
import ZoneArticle from './views/zone/Article';
import ZoneMoment from './views/zone/Moment';
import ZoneArticleReviseEditor from './views/zone/editor';
import ZoneDraft from './views/zone/draft';
import DraftEditor from './views/editor/DraftEditor';

const routes = [
  {name: 'home', path: '/creation', component: Home},
  {name: 'materials', path: '/creation/materials', component: Materials},
  {name: 'material', path: '/creation/material/:id', component: Material},
  {name: 'books', path: '/creation/books', component: Books},
  {name: 'addDocument', path: '/creation/materials/editor', component: DocumentEditor},
  {name: 'book', path: '/creation/book/:bid', component: Book},
  {name: 'bookContent', path: '/creation/book/:bid/:aid', component: BookContent},
  {name: 'bookEditor', path: '/creation/books/editor', component: BookEditor},
  {name: 'articleEditor', path: '/creation/articles/editor', component: ArticleEditor},
  {name: 'categories', path: '/creation/categories', component: Categories},
  {name: 'drafts', path: '/creation/drafts', component: Drafts},
  {name: 'columnArticleEditor', path: '/creation/editor/column', component: ColumnArticleEditor},
  {name: 'communityThreadEditor', path: '/creation/editor/community', component: CommunityThreadEditor},
  {
    name: 'zoneEditor',
    path: '/creation/editor/zone',
    component: ZoneEditor,
    children: [
      {name: 'zoneArticleEditor', path: '/creation/editor/zone/article', component: ZoneArticleEditor},
      {name: 'zoneMomentEditor', path: '/creation/editor/zone/moment', component: ZoneMomentEditor},
    ]
  },
  {name: 'draftEditor', path: '/creation/editor/draft', component: DraftEditor},
  {
    name: 'articles',
    path: '/creation/articles',
    component: Articles,
    children: [
      {name: 'articlesColumn', path: 'column', component: ArticlesColumn}
    ]
  },
  {
    name: 'community',
    path: '/creation/community',
    component: Community,
    children: [
      {name: 'communityThread', path: 'thread?type=hidden', component: CommunityThread},
      {name: 'communityPost', path: 'post?type=hidden', component: CommunityPost},
      {name: 'communityDraft', path: 'draft?type=hidden', component: CommunityDraft},
      {name: 'communityNote', path: 'note?type=hidden', component: CommunityNote},
    ]
  },
  {
    name: 'column',
    path: '/creation/column',
    component: Column,
    children: [
      {name: 'columnArticle', path: 'article', component: ColumnArticle},
      {name: 'columnDraft', path: 'draft', component: ColumnDraft},
    ]
  },
  {
    name: 'zone',
    path: '/creation/zone',
    component: Zone,
    children: [
      {name: 'zoneMoment', path: 'moment', component: ZoneMoment},
      {name: 'zoneArticle', path: 'article', component: ZoneArticle},
      {name: 'zoneDraft', path: 'draft', component: ZoneDraft},
      {name: 'ZoneArticleReviseEditor', path: 'article/editor', component: ZoneArticleReviseEditor},
    ]
  }
];


// 防止路由重复点击报错

const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
