const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.creationCenter,
  home: {
    calendar: {
      GET: Operations.creationCenter,
    },
    active: {
      GET: Operations.creationCenter,
    },
    visit: {
      GET: Operations.creationCenter,
    },
    data: {
      GET: Operations.creationCenter,
    },
  },
  drafts: {
    GET: Operations.creationCenter,
    POST: Operations.creationCenter,
    editor: {
      GET: Operations.creationCenter,
      POST: Operations.creationCenter,
    },
  },
  draft: {
    PARAMETER: {
      DELETE: Operations.creationCenter,
      GET: Operations.creationCenter,
    },
  },
  category: {
    GET: Operations.creationCenter,
  },
  categories: {
    GET: Operations.creationCenter,
  },
  material: {
    PARAMETER: {
      GET: Operations.creationCenter,
      PUT: Operations.creationCenter,
      DELETE: Operations.creationCenter,
      editor: {
        POST: Operations.creationCenter,
      },
    },
  },
  materials: {
    GET: Operations.creationCenter,
    POST: Operations.creationCenter,
    DELETE: Operations.creationCenter,
    PUT: Operations.creationCenter,
    editor: {
      POST: Operations.creationCenter,
      GET: Operations.creationCenter,
    },
    document: {
      GET: Operations.creationCenter,
    },
    material: {
      POST: Operations.creationCenter,
    },
    del: {
      POST: Operations.creationCenter,
    },
    drag: {
      POST: Operations.creationCenter,
    },
  },
  books: {
    GET: Operations.creationCenter,
    editor: {
      GET: Operations.creationCenter,
      POST: Operations.creationCenter,
    },
  },
  book: {
    PARAMETER: {
      GET: Operations.creationCenter,
      list: {
        delete: {
          POST: Operations.creationCenterDeleteList,
        },
        move: {
          POST: Operations.creationCenterMoveList,
        },
        add: {
          POST: Operations.creationCenterAddList,
        },
      },
      member: {
        POST: Operations.creationCenter,
        DELETE: Operations.creationCenter,
      },
    },
  },
  articles: {
    GET: Operations.creationCenter,
    editor: {
      GET: Operations.creationCenter,
      POST: Operations.publishArticle,
    },
    column: {
      GET: Operations.creationCenter,
      POST: Operations.creationCenter,
    },
  },
  article: {
    PARAMETER: {
      DELETE: Operations.creationCenter,
      draft: {
        DELETE: Operations.creationCenter,
      },
      options: {
        GET: Operations.creationCenter,
      },
      unblock: {
        POST: Operations.creationCenter,
      },
    },
  },
  column: {
    GET: Operations.creationCenter,
    article: {
      GET: Operations.creationCenter,
    },
    draft: {
      GET: Operations.creationCenter,
    },
  },
  zone: {
    GET: Operations.creationCenter,
    article: {
      GET: Operations.creationCenter,
      editor: {
        GET: Operations.creationCenter,
      },
    },
    draft: {
      GET: Operations.creationCenter,
    },
    moment: {
      GET: Operations.creationCenter,
    },
  },
  community: {
    GET: Operations.creationCenter,
    thread: {
      GET: Operations.creationCenter,
    },
    post: {
      GET: Operations.creationCenter,
    },
    draft: {
      GET: Operations.creationCenter,
    },
    note: {
      GET: Operations.creationCenter,
    },
  },
  editor: {
    column: {
      GET: Operations.creationCenter,
    },
    community: {
      GET: Operations.creationCenter,
    },
    zone: {
      GET: Operations.creationCenter,
      moment: {
        GET: Operations.creationCenter,
      },
      article: {
        GET: Operations.creationCenter,
      },
    },
    book: {
      GET: Operations.creationCenter,
    },
    draft: {
      GET: Operations.creationCenter,
    },
  },
  collections: {
    GET: Operations.creationCenter,
    data: {
      GET: Operations.creationCenter,
    },
  },
  blackLists: {
    GET: Operations.creationCenter,
  },
};
