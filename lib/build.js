'use strict';

var cm = require('./common');
var gulp = require('gulp');
var path  = require('path');
var rename = require('gulp-rename');

var DIR = cm.BUILD_DIR;

module.exports = {

  bower: function (done) {

    var almostDone = cm._.after(5, done);

    gulp.src('./branch/bower/.travis.yml')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src('./branch/bower/bower.tmpl.json')
      .pipe(cm.processTemplateFile())
      .pipe(rename({ext: '.json'}))
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src(path.join('../../dist/', cm.public.main_dist_dir || '') + '/**')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src('../../CHANGELOG.md')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src('../../LICENCE')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);
  },


  subbower: function (moduleName, bwrData) {
    return function (done) {

      var almostDone = cm._.after(5, done);
      var destination = DIR + '/subbower/' + moduleName;

      gulp.src('./branch/bower/.travis.yml')
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src('./branch/bower/bower.tmpl.json')
        .pipe(cm.processTemplateFile({ bwr : cm._.assign({}, cm.bwr, bwrData) }))
        .pipe(rename({ext: '.json'}))
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src(path.join('../../dist/', cm.public.sub_dist_dir || '', moduleName) + '/**')
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src('../../CHANGELOG.md')
        .pipe(gulp.dest(destination))
        .on('end', almostDone);

      gulp.src('../../LICENCE')
        .pipe(gulp.dest(destination))
        .on('end', almostDone);
    };
  },


  ghpages: function (done) {

    if (!cm.public.tocopy)  cm.public.tocopy = [];
    var almostDone = cm._.after(5 + cm.public.tocopy.length, done);

    cm.public.tocopy
      .map(function (file) {
        gulp.src('../../' + file)
          .pipe(gulp.dest(DIR + '/gh-pages/vendor'))
          .on('end', almostDone);
      });

    gulp.src('./branch/gh-pages/core/**')
      .pipe(gulp.dest(DIR + '/gh-pages/core'))
      .on('end', almostDone);
    gulp.src('./branch/gh-pages/assets/**')
      .pipe(gulp.dest(DIR + '/gh-pages/assets'))
      .on('end', almostDone);


    gulp.src('../../demo/**')
      .pipe(gulp.dest(DIR + '/gh-pages/demo'))
      .on('end', almostDone);
    gulp.src(path.join('../../dist/', cm.public.main_dist_dir || '') + '/**')
      .pipe(gulp.dest(DIR + '/gh-pages/dist'))
      .on('end', almostDone);


    gulp.src('./branch/gh-pages/index.tmp.html')
      .pipe(cm.processTemplateFile())
      .pipe(rename({ext: '.html'}))
      .pipe(gulp.dest(DIR + '/gh-pages/'))
      .on('end', almostDone);

  }
};
