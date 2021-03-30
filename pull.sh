#!/bin/sh
unset GIT_DIR

echo "start git pull"
exec git pull origin master
echo "finish"