'use strict';

var path  = require('path');
var es  = require('event-stream');
var gutil = require('gulp-util');
var cm = module.exports = {};

// External libs.
cm.noop = function () {};
cm.component_publisher_dir = '../../out';
cm.BUILD_DIR = cm.component_publisher_dir + '/built';
cm.PUBLISH_DIR = cm.component_publisher_dir + '/clones';

// Fake LoDash
cm._ = {};
cm._.after =  require('lodash.after');
cm._.assign = cm._.extend = require('lodash.assign');
cm._.template = require('lodash.template');


cm.pkg = require(path.resolve(process.cwd(), '../../package.json'));
cm.bwr = require(path.resolve(process.cwd(), '../../bower.json'));

try{
  cm.public = require(path.resolve(process.cwd(), '../../publish.js'))();
}catch(e){
  gutil.log(gutil.colors.red(e.toString()));
  gutil.log(gutil.colors.cyan('Keep going with empty configuration'));
  cm.public = {};
}

cm.date = require('dateformat');



cm.processConfig = function(str){
  return cm.template(str, cm);
};

/**
 * Apply a function on each file
 * @param fct
 * @returns {Stream}
 */
cm.applyOnFile = function(fct){
  var args = Array.prototype.slice.call(arguments, 1);
  return es.map(function (file, cb) {
    file.contents = fct.apply(null, [file].concat(args));
    cb(null, file);
  });
};

/**
 * Process the template content of each file
 * @param options
 * @returns {Stream}
 */
cm.processTemplateFile = function(options){
  return cm.applyOnFile(function(file){
    return new Buffer(gutil.template(file.contents , cm._.assign({file : file}, cm, options) ));
  });
};

/**
 * Apply a function on the content of each files
 * @param fct
 * @returns {Stream}
 */
cm.applyOnFileContent = function(fct){
  var args = Array.prototype.slice.call(arguments, 1);
  return cm.es.map(function (file, cb) {
    file.contents = fct.apply(null, [file.contents].concat(args));
    cb(null, file);
  });
};

/**
 * Get a formatted now date
 * @param format
 * @returns {String}
 */
cm.today = function(format) {
  return cm.date(new Date(), format);
};
