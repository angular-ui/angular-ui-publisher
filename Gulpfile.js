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

gulp.task('build_bower', function(done){
  build.bower(done, cm.public.bowerData);
});

gulp.task('build_subbower', function(done){
  var moduleNames = Object.keys(cm.public.subcomponents);
  var almostDone = cm._.after(moduleNames.length, done);
  for (var i = 0, n = moduleNames.length; i < n ; i++){
    build.subbower(moduleNames[i], cm.public.subcomponents[moduleNames[i]])(almostDone);
  }
});


var allowPushOnRepo = (process.env.TRAVIS == 'true') && (process.env.TRAVIS_PULL_REQUEST == 'false') && true;
gulp.task('publish_gh-pages', function(cb){
  if (process.env.TRAVIS){
    publish.apply(this, [{
      tag:  false,
      push: allowPushOnRepo && /^master$/.test(process.env.TRAVIS_BRANCH),
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
      push: allowPushOnRepo && /^src\d+\.\d+\.\d+.*$/.test(process.env.TRAVIS_BRANCH),
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
      push: allowPushOnRepo && /^src\d+\.\d+\.\d+.*$/.test(process.env.TRAVIS_BRANCH),
      tag: mName + '-' + cm.pkg.version
    }, almostDone]);
  }
});


function prefixedBranchedTasks(prefix){

  gulp.task(prefix, function(cb){
    if (!cm.env.branch )
      throw new Error('\nJust say want you want to ' + prefix + ' like\n' + prefix + ' --branch=bower');

    // TODO test if exist ?
    cm.run(prefix + '_' + cm.env.branch, cb);
  });

}
prefixedBranchedTasks('build');
prefixedBranchedTasks('publish');


