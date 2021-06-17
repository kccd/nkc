module.exports = {
  presets: [
    ["@babel/preset-env", {
      targets: {
        chrome: "38",
        ie: "9"
      }
    }]
  ],
  plugins: [
    [require.resolve("babel-plugin-preval")],
    [require.resolve("@babel/plugin-transform-object-assign")],
    [require.resolve("babel-plugin-module-resolver"),
      {
        alias: {
          "vue": "vue/dist/vue.esm.browser.js"
        }
      }
    ]
  ]
}