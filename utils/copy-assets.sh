#!/bin/bash
set -e
set -x
mkdir -p ./packages/mondrian/lib/assets
cp -r ./packages/mondrian/src/assets/* ./packages/mondrian/lib/assets/
