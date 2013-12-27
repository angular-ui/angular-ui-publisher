'use strict';

var cm = require('./common');
var fs = require('fs');
var sh = require('shelljs');
var path = require('path');

var gutil = require('gulp-util');

module.exports = function (opt, done) {

  if (arguments.length === 1) {
    done = opt;
    opt = {};
  }

  var env = this.env;


  var options = cm._.extend({
    cloneLocation: path.resolve(path.join(process.cwd(), cm.PUBLISH_DIR, this.env.branch)),
    dirSrc: path.resolve(path.join(process.cwd(), cm.BUILD_DIR ,this.env.branch)),
    branch: this.env.branch,
    remote: 'origin',
    message: 'Updates',
    tag: 'v' + cm.pkg.version
    //cloneLocation : path.join(process.env.HOME, 'tmp', this.name, this.target)
  }, opt);

  function e(cmd_tmpl, data) {
    var cmd = cm._.template(cmd_tmpl, cm._.extend(data || {}, options));
    if (env.verbose) gutil.log('$', gutil.colors.cyan(cmd));
    return sh.exec(cmd, { cwd: '123'});
  }

  var origin_cwd = process.cwd();
  sh.cd('../..');

  var res;

  // Get the remote.origin.url
  res = e('git config --get remote.origin.url 2>&1 >/dev/null');
  if (res.code > 0) throw new Error('Can\'t get no remote.origin.url !');

  options.repoUrl = process.env.REPO || String(res.output).split(/[\n\r]/).shift();
  if (!options.repoUrl) throw new Error('No repo link !');

  // Remove tmp file
  if (fs.existsSync(options.cloneLocation)) {
    e('rm -rf <%= cloneLocation %>');
  }

  // Clone the repo branch to a special location (clonedRepoLocation)
  res = e('git clone --branch=<%= branch %> --single-branch <%= repoUrl %> <%= cloneLocation %>');
  if (res.code > 0) {
    // try again without banch options
    res = e('git clone <%= repoUrl %> <%= cloneLocation %>');
    if (res.code > 0) throw new Error('Can\'t clone !');
  }


  // Go to the cloneLocation
  sh.cd(options.cloneLocation);

  if (sh.pwd() !== options.cloneLocation) {
    throw new Error('Can\'t access to the clone location : ' + options.cloneLocation + ' from ' + sh.pwd());
  }

  e('git clean -f -d');
  e('git fetch <%= remote %>');

  // Checkout a branch (create an orphan if it doesn't exist on the remote).
  res = e('git ls-remote --exit-code . <%= remote %>/<%= branch %>');
  if (res.code > 0) {
    // branch doesn't exist, create an orphan
    res = e('git checkout --orphan <%= branch %>');
    if (res.code > 0) throw new Error('Can\'t clone !');
  } else {
    // branch exists on remote, hard reset
    e('git checkout <%= branch %>');
  }


  if (!options.add) {
    // Empty the clone
    e('git rm --ignore-unmatch -rfq \'\\.[^\\.]*\' *');
  }


  // Copie the targeted files
  res = e('cp -rf <%= dirSrc %>/*  <%= dirSrc %>/.[a-zA-Z0-9]* ./ | true');
  if (res && res.code > 0) throw new Error(res.output);

  // Add and commit all the files

  e('git add .');
  res = e('git commit -m \'<%= message %>\'');


  if (options.tag) {
    res = e('git tag <%= tag %>');
    if (res.code > 0) console.log('Can\'t tag failed, continuing !');
  }

  // Push :)
  if (options.push) {
    e('git push --tags <%= remote %> <%= branch %>');
  }

  // Restor path...
  sh.cd(origin_cwd);
  done();
};
