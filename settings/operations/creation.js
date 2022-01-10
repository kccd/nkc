module.exports = {
  GET: 'creationCenter',
  drafts: {
    GET: 'creationCenter',
    POST: 'creationCenter',
    DELETE: 'creationCenter',
    draftEdit: {
      GET: 'creationCenter',
      POST: 'creationCenter',
    }
  },
  category: {
    GET: 'creationCenter',
  },
  categories: {
    GET: 'creationCenter',
  },
  material: {
    PARAMETER: {
      GET: 'creationCenter',
      PUT: 'creationCenter',
      DELETE: 'creationCenter',
      editor: {
        POST: 'creationCenter'
      }
    }
  },
  materials: {
    GET: 'creationCenter',
    POST: 'creationCenter',
    DELETE: 'creationCenter',
    PUT: 'creationCenter',
    editor: {
      POST: 'creationCenter',
      GET: 'creationCenter',
    },
    document: {
      GET: 'creationCenter',
    },
    material: {
      POST: 'creationCenter',
    },
    del: {
      POST: 'creationCenter'
    },
    drag: {
      POST: 'creationCenter'
    }
  },
  books: {
    GET: 'creationCenter',
    editor: {
      GET: 'creationCenter',
      POST: 'creationCenter'
    }
  },
  book: {
    PARAMETER: {
      GET: 'creationCenter',
      PARAMETER: {
        GET: 'creationCenter'
      }
    }
  },
  articles: {
    GET: 'creationCenter',
    editor: {
      GET: 'creationCenter',
      POST: 'creationCenter'
    }
  },
  article: {
    PARAMETER: {
      GET: 'creationCenter'
    }
  }
}
