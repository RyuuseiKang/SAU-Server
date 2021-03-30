#!/bin/sh
unset GIT_DIR
SHELL_PATH=`pwd -P`
cd $SHELL_PATH

echo "start git pull"
exec git pull origin master
echo "finish"