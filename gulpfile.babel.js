import gulp from 'gulp';
import webpack from 'gulp-webpack';

gulp.task('default', function () {
    return gulp.src('index.js')
    .pipe(webpack({ output: { filename: 'viz-generator.js' } }))
    .pipe(gulp.dest('dist/'));
});
