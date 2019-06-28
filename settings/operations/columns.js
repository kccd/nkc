module.exports = {
  GET: "column_get",
  PARAMETER: {
    GET: 'column_single_get',
    PATCH: "column_single_settings",
    avatar: {
      GET: "column_single_avatar_get"
    },
    banner: {
      GET: "column_single_banner_get"
    },
    category: {
      GET: "column_single_settings_post",
      POST: "column_single_settings_post",
      PARAMETER: {
        DELETE: "column_single_settings_post",
        PATCH: "column_single_settings_post"
      }
    },
    post: {
      POST: "column_single_settings_post",
      GET: "column_single_settings_post"
    },
    settings: {
      GET: "column_single_settings",
      post: {
        GET: "column_single_settings_post",
        POST: "column_single_settings_post"
      }
    }
  }
};