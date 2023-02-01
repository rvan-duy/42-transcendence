#!/bin/bash

# This script runs ESLint on the codebase. It is used by the GitHub Actions

output=$(./node_modules/.bin/eslint . --max-warnings=0 2>/dev/null)

if [ $? -ne 0 ]; then
    echo -e "\033[31mESLint found errors in the codebase. Fix them and try again.\033[0m"
    echo "$output"
    echo -e "\033[31mPlease note we are treating warnings as errors.\033[0m"
    exit 1
fi
