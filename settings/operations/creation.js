module.exports = {
  GET: 'creationCenter',
  material: {
    PARAMETER: {
      GET: 'creationCenter',
      PUT: 'creationCenter',
      DELETE: 'creationCenter'
    }
  },
  materials: {
    GET: 'creationCenter'
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