const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.column_get,
  PARAMETER: {
    a: {
      PARAMETER: {
        GET: Operations.column_article_get,
      },
    },
    GET: Operations.column_single_get,
    PUT: Operations.column_single_settings,
    hot: {
      POST: Operations.homeHotColumn,
      DELETE: Operations.homeHotColumn,
    },
    top: {
      POST: Operations.homeToppedColumn,
      DELETE: Operations.homeToppedColumn,
    },
    category: {
      GET: Operations.column_single_settings_post,
      POST: Operations.column_single_settings_post,
      PUT: Operations.column_single_settings_post,
      PARAMETER: {
        DELETE: Operations.column_single_settings_post,
        PUT: Operations.column_single_settings_post,
      },
    },
    post: {
      POST: Operations.column_single_settings_post,
      GET: Operations.column_single_settings_post,
    },
    subscribe: {
      POST: Operations.column_single_subscribe,
    },
    settings: {
      GET: Operations.column_single_settings,
      post: {
        GET: Operations.column_single_settings_post,
        add: {
          GET: Operations.column_single_settings_post,
        },
      },
      contribute: {
        GET: Operations.column_single_settings_contribute,
        POST: Operations.column_single_settings_contribute,
      },
      category: {
        GET: Operations.column_single_settings_post,
        PUT: Operations.column_single_settings_post,
        PARAMETER: {
          GET: Operations.column_single_settings_post,
        },
      },
      transfer: {
        GET: Operations.column_single_settings_transfer,
        POST: Operations.column_single_settings_transfer,
      },
      close: {
        GET: Operations.column_single_settings_close,
        POST: Operations.column_single_settings_close,
      },
      page: {
        GET: Operations.column_single_settings_page,
        // editor: {
        //   GET: Operations.column_single_settings_page,
        // },
      },
      fans: {
        GET: Operations.column_single_settings_fans,
        DELETE: Operations.column_single_settings_fans,
      },
    },
    contribute: {
      GET: Operations.column_single_contribute,
      POST: Operations.column_single_contribute,
    },
    status: {
      GET: Operations.column_single_status,
    },
    disabled: {
      POST: Operations.column_single_disabled,
    },
    contact: {
      POST: Operations.column_single_contact,
    },
    page: {
      POST: Operations.column_single_settings_page,
      PARAMETER: {
        GET: Operations.column_single_page,
        PUT: Operations.column_single_settings_page,
        DELETE: Operations.column_single_settings_page,
      },
    },
  },
};
