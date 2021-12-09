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
      settings: {
        GET: 'creationCenter'
      }
    }
  }
}