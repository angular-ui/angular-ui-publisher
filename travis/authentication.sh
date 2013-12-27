#!/bin/sh

MAIN_BRANCH='master'
USER_EMAIL='angular-ui@googlegroups.com'
USER_NAME='AngularUI (via TravisCI)'

usage() {
  echo 'By default this script run only on the main branch : '"$MAIN_BRANCH"
  echo 'Use -b or --branch to change it.'
  echo 'authentication.sh --branch=develop'
  echo ''
}

while [ "$1" != '' ]; do
  PARAM=`echo $1 | awk -F= '{print $1}'`
  VALUE=`echo $1 | awk -F= '{print $2}'`
  case $PARAM in
    -h | --help)
      usage
      exit 0
      ;;
    --branch)
      MAIN_BRANCH=$VALUE
      ;;
    *)
      echo 'ERROR: unknown parameter '"$PARAM"
      usage
      exit 1
      ;;
  esac
  shift
done

[  "$TRAVIS_PULL_REQUEST" != 'false' ] || [  "$TRAVIS_BRANCH" != "$MAIN_BRANCH" ] && exit 0

#
# Authentication
#

echo '>>> '"$USER_NAME"' ('"$USER_EMAIL"') authentication!'


git remote set-url origin $REPO.git
git config --global user.email "$USER_EMAIL"
git config --global user.name "$USER_NAME"

[ -z "$id_rsa_{1..23}" ] && { echo 'No $id_rsa_{1..23} found !' ; exit 3; }

# it's strange but the range ( {a..b} ) notation is no longer working on Travis CI
for i in $(seq 0 23);do eval echo '$id_rsa_'$i; done > ~/.ssh/travis_rsa_64
[ -s ~/.ssh/travis_rsa_64 ] || { echo '>>> Encrypted RSA ID concatenation Fail !'; exit 3 ; }
[ $(stat -c %s ~/.ssh/travis_rsa_64) -gt 100 ] ||  { echo '>>> The output file size is to little !'; exit 3 ; }

base64 -di ~/.ssh/travis_rsa_64 > ~/.ssh/id_rsa

echo ''
[ -f ~/.ssh/id_rsa ] || { echo '>>> RSA ID decoding Fail !'; exit 3 ; }

chmod 600 ~/.ssh/id_rsa

echo '>>> Copy config'
mv -fv node_modules/angular-ui-publisher/travis/ssh-config ~/.ssh/config

echo '>>> Hi github.com !'
ssh -T git@github.com

[ $? -eq 255 ] && { echo '>>> Authentication Fail !' ; exit 3 ; }

echo ''
