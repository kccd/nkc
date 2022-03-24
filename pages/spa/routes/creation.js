import Creation from '../views/creation/creation';
// import Home from '../views/creation/Home';
import Materials from '../views/creation/material/Material';
import Material from '../views/creation/material/MaterialFolder';
import DocumentEditor from '../views/creation/material/DocumentEditor'
import Books from '../views/creation/book/Books';
import Book from '../views/creation/book/Book';
import BookContent from '../views/creation/book/BookContent';
import BookEditor from '../views/creation/book/BookEditor';
import ArticleEditor from '../views/creation/article/ArticleEditor';
import Categories from '../views/creation/category/Categories';
import Drafts from '../views/creation/drafts/drafts';
import Articles from '../views/creation/articles/Articles';
import ArticlesColumn from '../views/creation/articles/Column';
import Community from '../views/creation/community/Community';
import CommunityThread from '../views/creation/community/Thread';
import CommunityPost from '../views/creation/community/Post';
import CommunityDraft from '../views/creation/community/Draft';
import CommunityNote from '../views/creation/community/Note';
import Column from '../views/creation/column/Column';
import ColumnArticle from '../views/creation/column/Article';
import ColumnDraft from '../views/creation/column/Draft';
import ColumnArticleEditor from '../views/creation/editor/ColumnArticleEditor';
import CommunityThreadEditor from '../views/creation/editor/CommunityThreadEditor';
import ZoneEditor from '../views/creation/editor/ZoneEditor/ZoneEditor';
import ZoneArticleEditor from '../views/creation/editor/ZoneEditor/ZoneArticleEditor';
import ZoneMomentEditor from '../views/creation/editor/ZoneEditor/ZoneMomentEditor';
// import BookEditor from './views/editor/BookEditor';
import Zone from '../views/creation/zone/Zone';
import ZoneArticle from '../views/creation/zone/Article';
import ZoneMoment from '../views/creation/zone/Moment';
import ZoneDraft from '../views/creation/zone/draft';
import DraftEditor from '../views/creation/editor/DraftEditor';

export const routesName = {
  creation: 'creation',
  creationMaterial: 'creationMaterial',
  creationMaterials: 'creationMaterials',
  creationBooks: 'creationBooks',
  creationAddDocument: 'creationAddDocument',
  creationBook: 'creationBook',
  creationBookContent: 'creationBookContent',
  creationBookEditor: 'creationBookEditor',
  creationArticleEditor: 'createArticleEditor',
  creationCategories: 'creationCategories',
  creationDrafts: 'creationDrafts',
  creationColumnArticleEditor: 'creationColumnArticleEditor',
  creationCommunityThreadEditor: 'creationCommunityThreadEditor',
  creationZoneEditor: 'creationZoneEditor',
  creationZoneArticleEditor: 'creationZoneArticleEditor',
  creationZoneMomentEditor: 'creationZoneMomentEditor',
}

export default [
  {
    name: routesName.creation,
    path: '/creation',
    component: Creation,
    children: [
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
          {name: 'communityThread', path: 'thread', component: CommunityThread},
          {name: 'communityPost', path: 'post', component: CommunityPost},
          {name: 'communityDraft', path: 'draft', component: CommunityDraft},
          {name: 'communityNote', path: 'note', component: CommunityNote},
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
        ]
      }
    ]
  },
];
