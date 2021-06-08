const gulp = require('gulp');
const sass = require('gulp-sass');
 
sass.compiler = require('node-sass');
 
gulp.task('sass', () => {
  return gulp.src('./scss/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});
 
gulp.task('scss:watch', () => {
  gulp.watch('./scss/**/*.scss', gulp.series('sass'));
});