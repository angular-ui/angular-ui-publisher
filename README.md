# Angular UI Publisher [![Build Status](https://travis-ci.org/angular-ui/angular-ui-publisher.png?branch=master)](https://travis-ci.org/angular-ui/angular-ui-publisher) [![NPM version](https://badge.fury.io/js/angular-ui-publisher.png)](http://badge.fury.io/js/angular-ui-publisher)

Helper component for building and publishing your angular modules as bower components

## Goal

The goal of all this is to automatize the construction of this type of repo tree.

```
+ git repo
  + master (src) branch // build directory is ignored
    - tag: src1.0.x
    - tag: src1.1.x
  + gh-pages (doc) branch
  + bower (build) branch // build directory is committed
    - tag: v1.0.x
    - tag: v1.1.x
  + bower-subcomponent-a (like angular-ui-event) branch
    - tag: subcomponent-a-1.0.x
    - tag: subcomponent-a-1.1.x
  + bower-subcomponent-b (like angular-ui-event) branch
    - tag: subcomponent-b-1.0.x
    - tag: subcomponent-b-1.1.x
```

So the `master` branch is free of builds files, the `gh-pages` branch is free of source files and the `bower` branches are only containing the vital part of a component. This way if a repo produces separate components, I could simply create multiple bower-branches for each produced component. Like for the component `subcomponent-a`, the branch `bower-subcomponent-a` with the specific version tags prefixed with `bower-subcomponent-a-`

Like so, throw bower you can install
```sh
# All the repo
bower install <package>#master

# The latest bower build
bower install <package>#bower

# A specific bower build
bower install <package>#v0.0.8

# The latest bower build of a sub component
bower install <package>#bower-subcomponent-a

# A specific bower build of a sub component
bower install <package>#subcomponent-a-0.0.8
```

## Usage

Add it as a npm component:

```
npm install angular-ui-publisher --save-dev
```

You have now access to the gulp build system in :  
`./node_modules/angular-ui-publisher/node_modules/.bin/gulp`.  
Like it's pretty far and **you're current path must be in the `/node_modules/angular-ui-publisher`** it's safer to use it in another build system to do the thing.

### Play nice with Gulp

This project is itself made with Gulp :)  
Still, here is some handy functions to do the work.

```javascript
//
// ACCESS TO THE ANGULAR-UI-PUBLISHER
function targetTask(task){
  return function(done){

    var spawn = require('child_process').spawn;
    var path = require('path');

    spawn(path.resolve(process.cwd(), './node_modules/.bin/gulp'), process.argv.slice(2), {
      cwd : './node_modules/angular-ui-publisher',
      stdio: 'inherit'
    }).on('close', done);
  }
}


gulp.task('build', targetTask('build'));
gulp.task('publish', targetTask('publish'));
```

and use

```sh
./node_modules/.bin/gulp build --branch=bower
# or
./node_modules/.bin/gulp build --branch=gh-pages
# or
./node_modules/.bin/gulp publish --branch=bower
# or
./node_modules/.bin/gulp publish --branch=gh-pages
```


### Hack nice with Grunt

For Grunt you can do this :

```javascript
//
// HACK TO ACCESS TO THE ANGULAR-UI-PUBLISHER
function fakeTargetTask(prefix){
  return function(){

    if (this.args.length !== 1) return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');

    var done = this.async();
    var spawn = require('child_process').spawn;
    spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
      cwd : './node_modules/angular-ui-publisher',
      stdio: 'inherit'
    }).on('close', done);
  };
}

grunt.registerTask('build', fakeTargetTask('build'));
grunt.registerTask('publish', fakeTargetTask('publish'));
//
```

and use

```sh
grunt build:bower
# or
grunt build:gh-pages
# or
grunt publish:bower
# or
grunt publish:gh-pages
```

## Tasks

### build

It's just coping or processing template files to the `out/built/<branch_name>` with `<branch_name>` given by the flag `--branch`.

### publish

It's acting in `out/clones/<branch_name>`.
 * Clones the given `<branch_name>`.
 * Copy the built files into it.
 * Commits the result (with the current build number on TravisCI)
 * Tags it with the current version (given by the package.json)
 * Push it (only on TravisCI for now)

## Building configuration

The component publisher can use a configuration file named `publish.js` to specify various thing to use while building the branches.  
This file must return a object with the configuration like so :

```javascript
module.exports = function() {
  return {
    // ...
  };
};
```

This config object can content the following key:

```javascript
{
  humaName : String,
  // the name used as title in the gh-pages (ex: 'UI.Utils')

  repoName : String,
  // the repo name used in github links in the gh-pages (ex: 'ui-utils')

  inlineHTML : String,
  // The html to inline in the index.html file in the gh-pages
  // (ex: 'Hello World' or fs.readFileSync(__dirname + '/demo/demo.html'))

  inlineJS : String,
  // The javascript to inline at the end of the index.html file in the gh-pages

  js : Array.of(String) | Function,
  // The js files to use in the gh-pages, loaded after angular by default (ex: ['dist/ui-utils.js'])
  // or
  // function that returns the final array of files to load 
  // (ex: function(defaultJsFiles) { return ['beforeFile.js'].concat(defaultJsFiles); })

  css : Array.of(String),
  // The css files to use in the gh-pages

  tocopy : Array.of(String),
  // Additional files to copy in the vendor directory in the gh-pages



  main_dist_dir : String,
  // directory used to store the main sources in the './dist' directory (ex: 'main')

  sub_dist_dir : String,
  // directory used to store the sub component sources in the './dist' directory (ex: 'sub')

  bowerData : {
    // Bower data to overwrite.
    // (ex: { name: 'my-component', main: './my-component.js' })
  }

  subcomponents : {  // Collection of sub component
    "<sub component name>" : {
      // Bower data to overwrite.
      // (ex: { name: 'my-component', main: './my-component.js' })
    }
  }

}
```


## CLI flags

*--branch*
Allows you to specify the branch to take care of.

* `build --branch=gh-pages` or `build --branch=bower`  
will build the `gh-pages` or the `bower` files in `./out/built`
* `publish --branch=gh-pages` or `publish --branch=bower`  
will publish the `gh-pages` or the `bower` files in `./out/clones`

### Made for Travis-CI

**It's working with ssh deploy key ! (so even organization can make Travis commit on them repos.**  
You can find a quick tuto [here](https://gist.github.com/douglasduteil/5525750#file-travis-secure-key-sh).

After you added your deploy key to GitHub and Travis (in  `.travis.yml`).  
Add a global value with your repo name, like :

```
env:
  global:
  - REPO="git@github.com:<org>/<repo>.git"
  - secure: ! 'MR37oFN+bprRlI1/YS3...etc...
```

Then add the authentication script that will automatically decode your deploy key (passed encoded in your .travis.yml). And try SSH to  Github.

```yaml
after_success:
- "./node_modules/angular-ui-publisher/travis/authentication.sh || exit 0"
- "grunt dist build:gh-pages publish:gh-pages build:bower publish:bower"
```

I recommend adding a ` || exit 0` after the authentication script to make sure that if your access is denied no building and publishing will be made.  
If you need to change the restriction to another branch that *master* by default, use the environment variable `MAIN_BRANCH` like below :

```yaml
env:
  global:
  - MAIN_BRANCH=develop
  - REPO="git@github.com:<org>/<repo>.git"
  - secure: ! 'MR37oFN+bprRlI1/YS3...etc...
```
