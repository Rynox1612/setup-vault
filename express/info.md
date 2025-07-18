# 📦 Express.js - Quick Overview & Starter Guide

Express.js is a fast, unopinionated, and minimalist web framework for Node.js, ideal for building APIs and web applications with ease.

---

## 🚀 How to Start Using Express

### ✅ Step-by-step:

1. **Initialize your project**
   ```bash
   npm init -y
   npm install express
   ```
   > ⚙️ **Note:** If you may find problems while using "*" route in version 5.x , so ill recommend you  to use

   ```bash
   npm init -y
   npm install express@4.18.2
   ```
2. **Create a basic server (index.js)**

```js
// index.js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```
3. **Start your server**

```bash 
node index.js
```

> **Note:**Change your directory to the folder which contains your index.js .

