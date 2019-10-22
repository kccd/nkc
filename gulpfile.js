const gulp = require("gulp");
const less = require("gulp-less");
const babel = require("gulp-babel");

const lessPath = `view/less/**/*.less`;
const cssDest = `public/css`;
gulp.task("buildCSS", () => {
  return gulp.src(lessPath)
    .pipe(less())
    .pipe(gulp.dest(cssDest));
});

const jsPath = `view/js/**/*.js`;
const jsDest = `public/js`;
gulp.task("buildJS", () => {
  return gulp.src(jsPath)
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(gulp.dest(jsDest));
});

gulp.task("watch", () => {
  gulp.watch(lessPath, gulp.series("buildCSS"));
  gulp.watch(jsPath, gulp.series("buildJS"));
});

