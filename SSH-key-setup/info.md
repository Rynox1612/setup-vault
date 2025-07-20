# 🔐 Managing Multiple GitHub Accounts Using SSH

In some situations, a developer might need to work with **multiple GitHub accounts on the same machine** — for example:

- One for **personal projects**
- One for **open-source contributions**
- One for **client or company work**

In such cases, using **SSH keys** is the most effective, clean, and secure method to manage multiple accounts.

---

## ✅ Why SSH Key Setup is the Best Approach?

Using SSH keys allows:

1. **Account Separation**  
   You can assign **different SSH keys** to different GitHub accounts and map them via the SSH config file.

2. **Secure Authentication**  
   SSH uses public-private key encryption. It’s more secure than username-password or even personal access tokens (PATs).

3. **No Repeated Login**  
   Once configured, SSH lets you push/pull without needing to log in every time.

4. **Custom Git Configs**  
   You can pair specific SSH keys with specific git usernames/email IDs in separate folders/repos.

5. **Scalable**  
   Works seamlessly even if you have 2, 3, or more GitHub accounts — just add a new key and config entry.

---

## 📂 Full Setup Guide

➡️ **To view the complete SSH key setup process with commands, config, and repo-wise examples:**  
[Click here to open `SSH-key-setup.md`](./SSH-key-setup.md)

