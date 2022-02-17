#!/bin/bash
set -e
# debug
# set -x

cd "$(dirname $0)"

ALI_REMOTE_URL="git@codeup.aliyun.com:mob/naiteluo/mondrian.git"
ZYB_REMOTE_URL="git@git.zuoyebang.cc:yike_fe/mondrian.git"

REMOTE_URL=$ALI_REMOTE_URL

echo $REMOTE_URL

if [[ $1 == "--help" ]]; then
    echo "usage: $(basename $0) [--ali|--zyb]"
    echo
    echo "push to other remotes."
    echo
    echo "--ali      ali codeup remote"
    echo "--zyb      zyb gitlab"
    exit 1
fi

if [[ $# < 1 ]]; then
    echo "Please specify either --ali or --zyb"
    exit 1
fi

if [[ "$1" == "--ali" ]]; then
    REMOTE_URL=$ALI_REMOTE_URL
elif [[ "$1" == "--zyb" ]]; then
    REMOTE_URL=$ZYB_REMOTE_URL
else
    echo "unknown argument - '$1'"
    exit 1
fi

BRANCH="dev"

if [[ $# < 2 ]]; then
    echo "Pushing to default branch dev"
else
    if [[ "$2" == "--master" ]]; then
        BRANCH="master"
    else
        echo "unknown argument - '$2'"
        exit 1
    fi
fi

git push $REMOTE_URL $BRANCH --force

echo 'done.'
