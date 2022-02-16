module.exports = {
  GET: 'creationCenter',
  drafts: {
    GET: 'creationCenter',
    POST: 'creationCenter',
    editor: {
      GET: 'creationCenter',
      POST: 'creationCenter',
    }
  },
  draft: {
    PARAMETER: {
      GET: 'creationCenter',
      DELETE: 'creationCenter'
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
      list:{
        delete:{
          POST:'creationCenterDeleteList'
        },
        move:{
          POST:'creationCenterMoveList'
        },
        add:{
          POST:'creationCenterAddList'
        }
      },
      member: {
        POST: 'creationCenter',
        DELETE: 'creationCenter'
      },
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
