#!/bin/sh

USER_EMAIL='angular-ui@googlegroups.com'
USER_NAME='AngularUI (via TravisCI)'

echo 'The next script will only run on a Tracis "master" branch or "^src\d+\.\d+\.\d+.*$" tags'
[  "$TRAVIS_PULL_REQUEST" = 'true' ] ||  [ !  `echo "$TRAVIS_BRANCH" | egrep "^(master|(src|[a-z]+-)[0-9]+\.[0-9]+\.[0-9]+(.*))$"` ] && exit 1

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
