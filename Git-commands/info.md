## Git Commands - A Comprehensive Guide (with Explanations)

This document provides a comprehensive list of commonly used Git commands, along with explanations and examples. It's organized into categories for easier navigation.

---

### I. Basic Commands - Getting Started

* **`git init`**: Initializes a new Git repository. This creates a hidden `.git` directory in your project, which is where Git stores all its version control information.
    * **Example:** `git init`

* **`git clone <repository_url>`**: Creates a local copy of a remote repository.
    * **Example:** `git clone https://github.com/username/repository.git`

* **`git config`**: Sets Git configuration options. Can be used to set your username, email, editor, etc.
    * **Example (set username):** `git config --global user.name "Your Name"`
    * **Example (set email):** `git config --global user.email "your.email@example.com"`

* **`git help <command>`**: Displays help information for a specific Git command.
    * **Example:** `git help commit`

---

### II. Working with Changes - Staging & Committing

* **`git status`**: Shows the status of your working directory and staging area. It tells you which files have been modified, staged, or are untracked.
    * **Example:** `git status`

* **`git add <file>`**: Adds a file to the staging area. This tells Git that you want to include the changes in this file in your next commit.
    * **Example (add a single file):** `git add index.html`
    * **Example (add all modified files):** `git add .`

* **`git commit -m "<message>"`**: Commits the staged changes to your local repository. The message should be a concise description of the changes you made.
    * **Example:** `git commit -m "Fixed a bug in the login form"`

* **`git commit -am "<message>"`**: Combines `git add` and `git commit` in one step. This only works for files that are *already* tracked by Git.
    * **Example:** `git commit -am "Updated documentation"`

* **`git rm <file>`**: Removes a file from the working directory and the staging area. This will be included in your next commit.
    * **Example:** `git rm unwanted_file.txt`

* **`git mv <old_name> <new_name>`**: Renames a file. This is equivalent to `mv` followed by `git add` and `git rm`.
    * **Example:** `git mv old_file.txt new_file.txt`

---

### III. Branching & Merging

* **`git branch`**: Lists all local branches. The current branch is marked with an asterisk (*).
    * **Example:** `git branch`

* **`git branch <branch_name>`**: Creates a new branch.
    * **Example:** `git branch feature/new-login`

* **`git checkout <branch_name>`**: Switches to a different branch.
    * **Example:** `git checkout feature/new-login`

* **`git checkout -b <branch_name>`**: Creates a new branch and switches to it in one step.
    * **Example:** `git checkout -b feature/new-login`

* **`git merge <branch_name>`**: Merges the specified branch into the current branch.
    * **Example:** `git merge feature/new-login`

* **`git branch -d <branch_name>`**: Deletes a branch. Only works if the branch has been merged.
    * **Example:** `git branch -d feature/new-login`

* **`git branch -D <branch_name>`**: Force deletes a branch, even if it hasn't been merged. Use with caution!
    * **Example:** `git branch -D feature/new-login`

---

### IV. Remote Repositories - Collaboration

* **`git remote add <name> <url>`**: Adds a remote repository. `origin` is the conventional name for the main remote repository.
    * **Example:** `git remote add origin https://github.com/username/repository.git`

* **`git remote -v`**: Lists all remote repositories and their URLs.
    * **Example:** `git remote -v`

* **`git fetch <remote>`**: Downloads objects and refs from another repository. This doesn't merge the changes into your working directory.
    * **Example:** `git fetch origin`

* **`git pull <remote> <branch>`**: Fetches changes from a remote repository and merges them into your current branch. This is equivalent to `git fetch` followed by `git merge`.
    * **Example:** `git pull origin main`

* **`git push <remote> <branch>`**: Uploads your local commits to a remote repository.
    * **Example:** `git push origin main`

---

### V. Inspecting History

* **`git log`**: Shows the commit history.
    * **Example:** `git log`
    * **Example (with more details):** `git log --oneline --graph --decorate --all`

* **`git diff`**: Shows the differences between commits, working tree, etc.
    * **Example (diff between working directory and staging area):** `git diff`
    * **Example (diff between two commits):** `git diff <commit1> <commit2>`

* **`git show <commit>`**: Shows the details of a specific commit.
    * **Example:** `git show a1b2c3d4`

---

### VI. Undoing Changes

* **`git checkout -- <file>`**: Discards changes in the working directory for a specific file.  **WARNING: This is a destructive operation!**
    * **Example:** `git checkout -- index.html`

* **`git reset HEAD <file>`**: Unstages a file.  Removes it from the staging area, but keeps the changes in the working directory.
    * **Example:** `git reset HEAD index.html`

* **`git revert <commit>`**: Creates a new commit that undoes the changes made by a specific commit.  This is a safer way to undo changes than `git reset`.
    * **Example:** `git revert a1b2c3d4`

---