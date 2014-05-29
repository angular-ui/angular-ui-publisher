'use strict';

var cm = require('./common');
var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var changed = require('gulp-changed');

var DIR = cm.BUILD_DIR;

module.exports = {

  bower: function (done, bwrData) {

    var almostDone = cm._.after(5, done);
    var destination = DIR + '/bower/';

    gulp.src('./branch/bower/.travis.yml')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);

    gulp.src('./branch/bower/bower.tmpl.json')
      .pipe(changed(destination))
      .pipe(cm.processTemplateFile({ bwr: cm._.assign({}, cm.bwr, bwrData) }))
      .pipe(rename('bower.json'))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);

    gulp.src(path.join('../../dist/', cm.public.main_dist_dir || '') + '/**')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);

    gulp.src('../../CHANGELOG.md')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);

    gulp.src('../../LICENCE')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);
  },


  subbower: function (moduleName, bwrData) {
    return function (done) {

      var almostDone = cm._.after(5, done);
      var destination = DIR + '/subbower/' + moduleName;

      gulp.src('./branch/bower/.travis.yml')
        .pipe(changed(destination))
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src('./branch/bower/bower.tmpl.json')
        .pipe(changed(destination))
        .pipe(cm.processTemplateFile({ bwr: cm._.assign({}, cm.bwr, bwrData) }))
        .pipe(rename('bower.json'))
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src(path.join('../../dist/', cm.public.sub_dist_dir || '', moduleName) + '/**')
        .pipe(changed(destination))
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src('../../CHANGELOG.md')
        .pipe(changed(destination))
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src('../../LICENCE')
        .pipe(changed(destination))
        .pipe(gulp.dest(destination))
        .on('end', almostDone);
    };
  },


  ghpages: function (done) {

    if (!cm.public.tocopy)  cm.public.tocopy = [];
    var almostDone = cm._.after(5 + cm.public.tocopy.length, done);
    var destination;

    destination = DIR + '/gh-pages/vendor';
    cm.public.tocopy
      .map(function (file) {
        gulp.src('../../' + file)
          .pipe(changed(destination))
          .pipe(gulp.dest(destination))
          .on('end', almostDone);
      });

    destination = DIR + '/gh-pages/core';
    gulp.src('./branch/gh-pages/core/**')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);
    destination = DIR + '/gh-pages/assets';
    gulp.src('./branch/gh-pages/assets/**')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);


    destination = DIR + '/gh-pages/demo';
    gulp.src('../../demo/**')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);
    destination = DIR + '/gh-pages/dist';
    gulp.src(path.join('../../dist/', cm.public.main_dist_dir || '') + '/**')
      .pipe(changed(destination))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);


    destination = DIR + '/gh-pages/';
    gulp.src('./branch/gh-pages/index.tmp.html')
      .pipe(changed(destination, {extension: '.html'}))
      .pipe(cm.processTemplateFile())
      .pipe(rename('index.html'))
      .pipe(gulp.dest(destination))
      .on('end', almostDone);

  }
};
