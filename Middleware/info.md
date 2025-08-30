# Express.js Middleware Guide 🚀

---

A comprehensive guide to understanding and implementing middleware in Express.js applications.

## Table of Contents

- [What is Middleware?](#what-is-middleware)
- [How Middleware Works](#how-middleware-works)
- [Creating Custom Middleware](#creating-custom-middleware)
- [Using the `next()` Function](#using-the-next-function)
- [Common Middleware Examples](#common-middleware-examples)
- [Passing Middleware as Route Attributes](#passing-middleware-as-route-attributes)
- [Useful Request Properties](#useful-request-properties)
- [Best Practices](#best-practices)

## What is Middleware?

Middleware is a function that executes during the **request-response cycle** in Express.js. It sits between receiving a request and sending a response, allowing you to:

- Process incoming requests
- Modify request and response objects
- Execute code before route handlers
- Control the flow of execution
- End the request-response cycle

### Built-in Middleware Examples

- `express.static()` - Serves static files
- `express.urlencoded()` - Parses URL-encoded data
- `express.json()` - Parses JSON data

## How Middleware Works

```javascript
// Basic middleware structure
app.use((req, res, next) => {
  // Middleware logic here
  next(); // Pass control to next middleware
});
```

### Key Characteristics:

- ✅ Access to `req` (request) and `res` (response) objects
- ✅ Can chain multiple middleware functions
- ✅ Can end the request-response cycle
- ✅ Must call `next()` to continue to the next middleware

## Creating Custom Middleware

### Global Middleware

Applied to all routes in your application:

```javascript
// This middleware runs for every request
app.use((req, res, next) => {
  console.log("This middleware runs for every route");
  next();
});
```

### Route-Specific Middleware

Applied only to specific routes:

```javascript
// Middleware for specific route
app.get("/protected", middleware, (req, res) => {
  res.send("Protected route");
});
```

## Using the `next()` Function

The `next()` function is crucial for middleware chaining:

```javascript
app.use((req, res, next) => {
  console.log("First middleware");
  next(); // Calls the next middleware in the stack
});

app.use((req, res, next) => {
  console.log("Second middleware");
  next(); // Continues to route handler
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
```

### Without `next()` - Ending the Cycle

```javascript
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized");
    // No next() called - request ends here
  }
  next(); // Continue if authorized
});
```

## Common Middleware Examples

### 1. Logger Middleware

Logs useful request information:

```javascript
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};

app.use(logger);
```

### 2. Authentication Middleware

```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verify token logic here
  req.user = { id: 1, name: "John" }; // Add user to request
  next();
};
```

### 3. Error Handling Middleware

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
};

app.use(errorHandler);
```

## Passing Middleware as Route Attributes

You can pass middleware functions directly as parameters to route methods like `app.get()`, `app.post()`, etc.

### Single Middleware

```javascript
const authMiddleware = (req, res, next) => {
  // Authentication logic
  console.log("Checking authentication...");
  next();
};

// Pass middleware as second parameter
app.get("/dashboard", authMiddleware, (req, res) => {
  res.send("Welcome to dashboard!");
});

app.post("/api/data", authMiddleware, (req, res) => {
  res.json({ message: "Data received", data: req.body });
});
```

### Multiple Middleware

```javascript
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const validateData = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "Name is required" });
  }
  next();
};

// Pass multiple middleware functions
app.post("/users", logger, validateData, (req, res) => {
  res.json({ message: "User created", user: req.body });
});
```

### Array of Middleware

```javascript
const middlewareStack = [
  (req, res, next) => {
    console.log("Middleware 1");
    next();
  },
  (req, res, next) => {
    console.log("Middleware 2");
    next();
  },
];

app.get("/complex-route", middlewareStack, (req, res) => {
  res.send("All middleware executed!");
});
```

### Conditional Middleware

```javascript
const conditionalAuth = (req, res, next) => {
  if (req.path.startsWith("/admin")) {
    // Check admin privileges
    if (!req.user?.isAdmin) {
      return res.status(403).send("Admin access required");
    }
  }
  next();
};

app.get("/admin/users", conditionalAuth, (req, res) => {
  res.json({ users: [] });
});
```

## Useful Request Properties

Access important request information in your middleware:

```javascript
app.use((req, res, next) => {
  // Log request details
  console.log("Method:", req.method); // GET, POST, PUT, DELETE
  console.log("Hostname:", req.hostname); // example.com
  console.log("Path:", req.path); // /api/users
  console.log("URL:", req.url); // /api/users?id=123
  console.log("IP:", req.ip); // Client IP address

  // Add timestamp to request
  req.timestamp = new Date(Date.now()).toString();

  next();
});
```

### Request Object Properties

| Property       | Description         | Example                                  |
| -------------- | ------------------- | ---------------------------------------- |
| `req.method`   | HTTP method         | `GET`, `POST`, `PUT`                     |
| `req.hostname` | Domain name         | `localhost`, `example.com`               |
| `req.path`     | URL path            | `/api/users`                             |
| `req.url`      | Full URL with query | `/api/users?id=123`                      |
| `req.ip`       | Client IP address   | `127.0.0.1`                              |
| `req.headers`  | Request headers     | `{ 'content-type': 'application/json' }` |
| `req.params`   | Route parameters    | `{ id: '123' }`                          |
| `req.query`    | Query parameters    | `{ search: 'john' }`                     |
| `req.body`     | Request body        | `{ name: 'John' }`                       |

## Best Practices

### 1. Always Handle Errors

```javascript
const safeMiddleware = (req, res, next) => {
  try {
    // Your middleware logic
    console.log("Processing request...");
    next();
  } catch (error) {
    next(error); // Pass error to error handler
  }
};
```

### 2. Use Descriptive Names

```javascript
// Good ✅
const authenticateUser = (req, res, next) => {
  /* ... */
};
const validateUserInput = (req, res, next) => {
  /* ... */
};

// Avoid ❌
const middleware1 = (req, res, next) => {
  /* ... */
};
const func = (req, res, next) => {
  /* ... */
};
```

### 3. Keep Middleware Focused

Each middleware should have a single responsibility:

```javascript
// Separate concerns
const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const checkAuth = (req, res, next) => {
  // Only handle authentication
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized");
  }
  next();
};
```

### 4. Order Matters

```javascript
// Correct order
app.use(express.json()); // Parse JSON first
app.use(logger); // Then log
app.use("/api", authenticate); // Then authenticate API routes
app.use(errorHandler); // Error handler last
```

## Complete Example

```javascript
const express = require("express");
const app = express();

// Global middleware
const logger = (req, res, next) => {
  req.timestamp = new Date().toISOString();
  console.log(`[${req.timestamp}] ${req.method} ${req.path}`);
  next();
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = { id: 1, name: "John Doe" };
  next();
};

// Apply global middleware
app.use(express.json());
app.use(logger);

// Routes with middleware attributes
app.get("/", (req, res) => {
  res.send("Public route - no middleware needed");
});

app.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "Profile data",
    user: req.user,
    timestamp: req.timestamp,
  });
});

app.post("/api/data", logger, authenticate, (req, res) => {
  res.json({
    message: "Data processed successfully",
    data: req.body,
    user: req.user,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

**Note**: Remember that middleware execution order is important. Middleware functions are executed in the order they are defined, so place authentication, logging, and parsing middleware before your route handlers.

Happy coding! 🎉
