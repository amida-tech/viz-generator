var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('default', function () {
    return gulp.src('index.js')
    .pipe(webpack({ output: { filename: 'viz-generator.js' } }))
    .pipe(gulp.dest('dist/'));
});
