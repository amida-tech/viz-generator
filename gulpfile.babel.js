import gulp from 'gulp';
import webpack from 'gulp-webpack';
import { Server } from 'karma';
import webpackconfig from './webpack.config';

gulp.task('build', () => gulp.src('viz.js')
    .pipe(webpack(webpackconfig))
    .pipe(gulp.dest('dist/')));

gulp.task('test', done =>
    new Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true,
    }, done).start(),
);
