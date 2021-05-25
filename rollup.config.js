const path = require("path");
const glob = require("glob");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const nodePolyfills = require("rollup-plugin-node-polyfills");
const { terser } = require("rollup-plugin-terser");
const { babel } = require("@rollup/plugin-babel");
const { string } = require("rollup-plugin-string");
const styles = require("rollup-plugin-styles");
const vue = require("rollup-plugin-vue");

const DIST_DIR = "dist";
const SCRIPTS_GLOBS = "pages/**/*.js";
const files = glob.sync(SCRIPTS_GLOBS);

const configuration = files.map(filename => {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const output = path.join(__dirname, DIST_DIR, filename, "../", basename + ".js");
  return {
    input: filename,
    output: {
      name: basename,
      file: output,
      format: "umd",
      sourcemap: process.env.NODE_ENV === "production" ? false : "inline",
      compact: false
    },
    plugins: [
      nodePolyfills(),
      nodeResolve(),
      commonjs(),
      vue(),
      babel({ babelHelpers: "bundled" }),
      styles({ minimize: true }),
      string({ include: "pages/**/*.html" }),
      process.env.NODE_ENV === "production" && terser()
    ],
    cache: true
  }
});

module.exports = configuration;