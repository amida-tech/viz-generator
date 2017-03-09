import gulp from 'gulp';
import webpack from 'gulp-webpack';
import webpackconfig from './webpack.config';

gulp.task('build', () => gulp.src('src/index.js')
    .pipe(webpack(webpackconfig))
    .pipe(gulp.dest('dist/')));
