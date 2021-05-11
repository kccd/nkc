import path from "path";
import glob from "glob";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const DIST_DIR = "dist";
const files = glob.sync("pages/**/*.{js,mjs}");

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
      sourcemap: "inline",
      compact: false
    },
    plugins: [
      commonjs(),
      nodeResolve(),
      babel({ babelHelpers: "bundled" }),
      process.env.NODE_ENV === "production"? terser() : null
    ]
  }
});