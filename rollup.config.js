import path from "path";
import globby from "globby";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";
import vue from "rollup-plugin-vue";
import json from "@rollup/plugin-json";
import styles from "rollup-plugin-styles";
import buble from "@rollup/plugin-buble";

const DIST_DIR = process.env.NODE_ENV === "production"? "dist-prod": "dist";
const LIB_DIR_PATTERN = "!pages/**/lib";
const SCRIPTS_PATTERNS = ["pages/**/*.js", LIB_DIR_PATTERN];
const STYLES_PATTERNS = ["pages/**/*.less", LIB_DIR_PATTERN];

function getOutputPath(filename, outputExt) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  return path.join(__dirname, DIST_DIR, filename, "../", basename + (outputExt || ext));
}

export default (async () => {
  const scriptFiles = await globby(SCRIPTS_PATTERNS);
  const styleFiles = await globby(STYLES_PATTERNS);
  let configs = [
    // scripts
    ...scriptFiles.map(filename => {
      return {
        input: filename,
        output: {
          name: path.basename(filename, ".js"),
          file: getOutputPath(filename),
          format: "umd",
          sourcemap: process.env.NODE_ENV === "production" ? false : "inline",
          compact: false
        },
        plugins: [
          nodeResolve(),
          commonjs(),
          json(),
          styles(),
          vue({ needMap: false }),
          babel({
            babelHelpers: "bundled",
            extensions: [ ".js", ".ts", ".tsx", ".jsx", ".es6", ".es", ".mjs", ".vue" ]
          }),
          buble({}),
          process.env.NODE_ENV === "production" && terser()
        ],
        cache: true
      }
    }),

    // styles
    ...styleFiles.map(filename => {
      const tempFile = getOutputPath(filename, ".css.js");
      const basename = path.basename(filename, path.extname(filename));
      return {
        input: filename,
        output: {
          file: tempFile,
          assetFileNames: "[name][extname]",
          format: "umd",
          name: basename,
          exports: "named"
        },
        plugins: [
          styles({
            mode: ["extract", basename + ".css"],
            minimize: process.env.NODE_ENV === "production",
            sourceMap: process.env.NODE_ENV === "production" ? false : "inline"
          })
        ]
      }
    })
  ];

  return configs;
})();