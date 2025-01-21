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
    categories: {
        GET: Operations.creationCenter,
    },
    articles: {
        GET: Operations.creationCenter,
        editor: {
            GET: Operations.creationCenter,
            POST: Operations.publishArticle,
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