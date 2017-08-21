# Git Magic

This document contains tips and tricks for working with git.

## Checkout a Pull Request

Add the following to your user's git config file (`~/.gitconfig` for linux):
```
[alias]
        pr = "!f() { git fetch -fu ${2:-origin} refs/pull/$1/head:pr/$1 && git checkout pr/$1; }; f"
```
Then use the command in the project directory, like this:
```
git pr NUMBER_OF_PULL_REQUEST REMOTE
```

