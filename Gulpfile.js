'use strict';


//////////////////////////////////////////////////////////////////////////////
// REQUIRED
//////////////////////////////////////////////////////////////////////////////

var gulp = require('gulp');
var path = require('path');
var cm = require('./lib/common');


var publish = require('./lib/publish');
var build = require('./lib/build');



//////////////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function(done) {

  var rimraf = require('gulp-rimraf');
  var DIR = cm.component_publisher_dir;
  gulp.src(DIR + '/**').pipe(rimraf())
  .on('end', done);
});

gulp.task('build_gh-pages', build.ghpages);
gulp.task('build_bower', build.bower);
gulp.task('build_subbower', function(done){
  var moduleNames = Object.keys(cm.public.subcomponents);
  var almostDone = cm._.after(moduleNames.length, done);
  for (var i = 0, n = moduleNames.length; i < n ; i++){
    build.subbower(moduleNames[i], cm.public.subcomponents[moduleNames[i]])(almostDone);
  }
});


var allowPushOnRepo = (process.env.TRAVIS == 'true') && (process.env.TRAVIS_PULL_REQUEST == 'false') && (process.env.TRAVIS_BRANCH == 'develop') && true;
gulp.task('publish_gh-pages', function(cb){
  if (process.env.TRAVIS){
    publish.apply(this, [{
      tag:  false,
      push: allowPushOnRepo,
      message: 'Travis commit : build ' + process.env.TRAVIS_BUILD_NUMBER
    }, cb]);
  }else{
    publish.apply(this, [cb]);
  }
});

gulp.task('publish_bower', function(cb){
  if (process.env.TRAVIS){
    publish.apply(this, [
    {
      push: allowPushOnRepo,
      message: 'Travis commit : build ' + process.env.TRAVIS_BUILD_NUMBER
    }, cb]);
  }else{
    publish.apply(this, [cb]);
  }
});

gulp.task('publish_subbower', function(done){
  var moduleNames = Object.keys(cm.public.subcomponents);
  var almostDone = cm._.after(moduleNames.length, done);
  for (var i = 0, n = moduleNames.length; i < n ; i++){
    var mName = moduleNames[i];
    publish.apply(this, [{
      branch: 'bower-' + mName,
      cloneLocation: path.resolve(path.join(process.cwd(), cm.PUBLISH_DIR, 'subbower', mName)),
      dirSrc: path.resolve(path.join(process.cwd(), cm.BUILD_DIR, 'subbower', mName)),
      message: 'Travis commit : build ' + process.env.TRAVIS_BUILD_NUMBER,
      push: allowPushOnRepo,
      tag: mName + '-' + cm.pkg.version
    }, almostDone]);
  }
});


function prefixedBranchedTasks(prefix){

  gulp.task(prefix, function(cb){
    if (!this.env.branch )
      throw new Error('\nJust say want you want to ' + prefix + ' like\n' + prefix + ' --branch=bower');

    // TODO test if exist ?
    gulp.run(prefix + '_' + this.env.branch, cb);
  });

}
prefixedBranchedTasks('build');
prefixedBranchedTasks('publish');


