import Creation from '../views/creation/creation';
// import Home from '../views/creation/Home';
import Materials from '../views/creation/material/Material';
import Material from '../views/creation/material/MaterialFolder';
import DocumentEditor from '../views/creation/material/DocumentEditor';
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
import CreationPostList from '../views/creation/community/CreationPostList';
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
import ZoneDraft from '../views/creation/zone/Draft';
import DraftEditor from '../views/creation/editor/DraftEditor';

import Collections from '../views/creation/collections/Collections';

import BlackLists from '../views/creation/collections/BlackLists';

export const routesName = {
  creation: 'creation',
  creationMaterial: 'creationMaterial',
  creationMaterials: 'creationMaterials',
  creationBooks: 'creationBooks',
  creationAddDocument: 'creationAddDocument',
  creationBook: 'creationBook',
  creationBookContent: 'creationBookContent',
  creationBookEditor: 'creationBookEditor',
  creationArticleEditor: 'creationArticleEditor',
  creationCategories: 'creationCategories',
  creationDrafts: 'creationDrafts',
  creationColumnArticleEditor: 'creationColumnArticleEditor',
  creationCommunityThreadEditor: 'creationCommunityThreadEditor',
  creationZoneEditor: 'creationZoneEditor',
  creationZoneArticleEditor: 'creationZoneArticleEditor',
  creationZoneMomentEditor: 'creationZoneMomentEditor',
  creationDraftEditor: 'creationDraftEditor',
  creationArticles: 'creationArticles',
  creationArticlesColumn: 'creationArticlesColumn',
  creationCommunity: 'creationCommunity',
  creationCommunityThread: 'creationCommunityThread',
  creationCommunityPost: 'creationCommunityPost',
  creationCommunityDraft: 'creationCommunityDraft',
  creationCommunityNote: 'creationCommunityNote',
  creationColumn: 'creationColumn',
  creationColumnArticle: 'creationColumnArticle',
  creationColumnDraft: 'creationColumnDraft',
  creationZone: 'creationZone',
  creationZoneMoment: 'creationZoneMoment',
  creationZoneArticle: 'creationZoneArticle',
  creationZoneDraft: 'creationZoneDraft',
  creationCollections: 'creationCollections',
  creationBlackLists: 'creationBlackLists',
};

export default [
  {
    name: routesName.creation,
    path: '/creation',
    component: Creation,
    children: [
      // {name: 'home', path: '/creation', component: Home},
      {
        name: routesName.creationCollections,
        path: '/creation/collections',
        component: Collections,
      },
      {
        name: routesName.creationBlackLists,
        path: '/creation/blackLists',
        component: BlackLists,
      },
      {
        name: routesName.creationMaterials,
        path: '/creation/materials',
        component: Materials,
      },
      {
        name: routesName.creationMaterial,
        path: '/creation/material/:id',
        component: Material,
      },
      {
        name: routesName.creationBooks,
        path: '/creation/books',
        component: Books,
      },
      {
        name: routesName.creationAddDocument,
        path: '/creation/materials/editor',
        component: DocumentEditor,
      },
      {
        name: routesName.creationBook,
        path: '/creation/book/:bid',
        component: Book,
      },
      {
        name: routesName.creationBookContent,
        path: '/creation/book/:bid/:aid',
        component: BookContent,
      },
      {
        name: routesName.creationBookEditor,
        path: '/creation/books/editor',
        component: BookEditor,
      },
      {
        name: routesName.creationArticleEditor,
        path: '/creation/articles/editor',
        component: ArticleEditor,
      },
      {
        name: routesName.creationCategories,
        path: '/creation/categories',
        component: Categories,
      },
      {
        name: routesName.creationDrafts,
        path: '/creation/drafts',
        component: Drafts,
      },
      {
        name: routesName.creationColumnArticleEditor,
        path: '/creation/editor/column',
        component: ColumnArticleEditor,
      },
      {
        name: routesName.creationCommunityThreadEditor,
        path: '/creation/editor/community',
        component: CommunityThreadEditor,
        meta: { keepAlive: true },
      },
      {
        name: routesName.creationZoneEditor,
        path: '/creation/editor/zone',
        component: ZoneEditor,
        children: [
          {
            name: routesName.creationZoneArticleEditor,
            path: '/creation/editor/zone/article',
            component: ZoneArticleEditor,
          },
          {
            name: routesName.creationZoneMomentEditor,
            path: '/creation/editor/zone/moment',
            component: ZoneMomentEditor,
          },
        ],
      },
      {
        name: routesName.creationDraftEditor,
        path: '/creation/editor/draft',
        component: DraftEditor,
      },
      {
        name: routesName.creationArticles,
        path: '/creation/articles',
        component: Articles,
        children: [
          {
            name: routesName.creationArticlesColumn,
            path: 'column',
            component: ArticlesColumn,
          },
        ],
      },
      {
        name: routesName.creationCommunity,
        path: '/creation/community',
        component: Community,
        children: [
          {
            name: routesName.creationCommunityThread,
            path: 'thread',
            component: CreationPostList,
          },
          {
            name: routesName.creationCommunityPost,
            path: 'post',
            component: CreationPostList,
          },
          {
            name: routesName.creationCommunityDraft,
            path: 'draft',
            component: CommunityDraft,
          },
          {
            name: routesName.creationCommunityNote,
            path: 'note',
            component: CommunityNote,
          },
        ],
      },
      {
        name: routesName.creationColumn,
        path: '/creation/column',
        component: Column,
        children: [
          {
            name: routesName.creationColumnArticle,
            path: 'article',
            component: ColumnArticle,
          },
          {
            name: routesName.creationColumnDraft,
            path: 'draft',
            component: ColumnDraft,
          },
        ],
      },
      {
        name: routesName.creationZone,
        path: '/creation/zone',
        component: Zone,
        children: [
          {
            name: routesName.creationZoneMoment,
            path: 'moment',
            component: ZoneMoment,
          },
          {
            name: routesName.creationZoneArticle,
            path: 'article',
            component: ZoneArticle,
          },
          {
            name: routesName.creationZoneDraft,
            path: 'draft',
            component: ZoneDraft,
          },
        ],
      },
    ],
  },
];
