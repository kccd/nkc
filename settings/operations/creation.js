module.exports = {
  GET: 'creationCenter',
  material: {
    GET: 'creationCenter'
  },
  books: {
    GET: 'creationCenter',
    creator: {
      GET: 'creationCenter',
      POST: 'creationCenter'
    }
  },
  book: {
    PARAMETER: {
      GET: 'creationCenter',
      edit: {
        GET: 'creationCenter'
      }
    }
  },
  articles: {
    GET: 'creationCenter',
    creator: {
      GET: 'creationCenter',
      POST: 'creationCenter'
    }
  },
  article: {
    PARAMETER: {
      GET: 'creationCenter',
      edit: {
        GET: 'creationCenter'
      }
    }
  }
}