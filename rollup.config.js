import path from "path";
import glob from "glob";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";
import vue from "rollup-plugin-vue";
import json from "@rollup/plugin-json";
import styles from "rollup-plugin-styles";

const DIST_DIR = "dist";
const SCRIPTS_GLOBS = "pages/**/*.js";
const files = glob.sync(SCRIPTS_GLOBS);

export default files.map(filename => {
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
      nodeResolve(),
      commonjs(),
      json(),
      styles(),
      vue({ needMap: false }),
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".vue"]
      }),
      process.env.NODE_ENV === "production" && terser()
    ],
    cache: true
  }
});