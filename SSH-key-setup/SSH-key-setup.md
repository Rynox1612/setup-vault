🛠️ SSH Key Setup for id\_user1
-------------------------------

### 🔹 Step 1: Generate SSH Key for user1

```bash

ssh-keygen -t ed25519 -C "user1@example.com" -f ~/.ssh/id_user1   

```
> **Here user1 is variable**

*   \-t ed25519 → uses modern secure algorithm
    
*   \-C → label for the key (email)
    
*   \-f → filename for private key (in this case: id\_user1)
    

It will generate two files:
```bash
cd ~/
ls -la
```
*  Locate these files

*.ssh/id_user1          → private key*
*.ssh/id_user1.pub      → public key*   

### 🔹 Step 2: Add the private key to the ssh-agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_user1   
```

### 🔹 Step 3: Add Public Key to GitHub

Copy your public key:

```bash
cat ~/.ssh/id_user1.pub
```

Go to:

> GitHub → Settings → SSH and GPG keys → New SSH KeyPaste the key → Give it a title like user1-key

### 🔹 Step 4: Configure ~/.ssh/config

```bash

 ~/.ssh/config 

#config content

 Host github.com-user1    
 HostName github.com    
 User git    
 IdentityFile ~/.ssh/id_user1   

 ```
> If SSH config is not created

**✅ Recommendedto make it manually**

```bash
touch ~/.ssh/config

nano ~/.ssh/config

# insert "config content" above and save it with ctrl+s and exit with ctrl+x
```

> ✅ github.com-user1 is an alias — we'll use it to clone repos separately.

### 🔹 Step 5: Clone Repos using the alias

```bash
git clone git@github.com-user1:username/repo-name.git   
```

### 🔹 Step 6: Set Local Git Config (for this repo)

```bash 
cd repo-name
git config user.name "User One"  
git config user.email "user1@example.com"   
```

> ⚠️ Don’t use --global — this setting will apply only to this repo.

### ✅ Testing

```bash 
ssh -T git@github.com-user1   
```

If setup correctly, output will be:

```vbnet
username! You've successfully authenticated, but GitHub does not provide shell access.   
```