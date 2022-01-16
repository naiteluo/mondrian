#!/bin/bash
set -e
set -x

mkdir -p ./packages/mondrian/types
cp -r ./out/mondrian/src/ ./packages/mondrian/types/
