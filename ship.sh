#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: npm run ship \"your commit message\""
  exit 1
fi

git add -A
git commit -m "$1"
git push
