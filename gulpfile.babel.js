import gulp from 'gulp';
import gulpwebpack from 'gulp-webpack';
import webpack from 'webpack';
import gutil from 'gulp-util';
import { Server } from 'karma';
import WebpackDevServer from 'webpack-dev-server';
import webpackconfig from './webpack.config';

gulp.task('build', () => gulp.src('src/index.js')
    .pipe(gulpwebpack(webpackconfig, webpack))
    .pipe(gulp.dest('./')));

gulp.task('build:watch', () => gulp.src('src/index.js')
    .pipe(gulpwebpack(Object.assign(webpackconfig, { watch: true }), webpack))
    .pipe(gulp.dest('./')));

gulp.task('test', done =>
    new Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true,
    }, done).start());

gulp.task('test:watch', done =>
    new Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: false,
    }, done).start());

gulp.task('serve', () => {
    const compiler = webpack(webpackconfig);
    new WebpackDevServer(compiler).listen(8080, 'localhost', (err) => {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});
