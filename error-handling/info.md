# Express.js Error Handling Guide for Interns

## Table of Contents

1. [Introduction to Error Handling](#introduction-to-error-handling)
2. [Creating a Custom Error Class](#creating-a-custom-error-class)
3. [Using the Custom Error Class](#using-the-custom-error-class)
4. [Setting Up Global Error Handling Middleware](#setting-up-global-error-handling-middleware)
5. [Handling Async Errors](#handling-async-errors)
6. [Complete Example](#complete-example)
7. [Project Structure](#project-structure)

## Introduction to Error Handling

Error handling is one of the most important aspects of building reliable web applications. When something goes wrong in your Express.js application, you want to:

- **Prevent crashes**: Keep your server running even when errors occur
- **Provide meaningful feedback**: Give users helpful error messages instead of confusing technical details
- **Log errors for debugging**: Track what went wrong so you can fix issues
- **Maintain security**: Avoid exposing sensitive information in error messages

### Why Use Middleware for Error Handling?

Express.js middleware allows you to handle errors in a centralized way. Instead of writing error handling code in every route, you can create one place where all errors are processed consistently.

**Benefits:**

- **Consistency**: All errors are handled the same way
- **Maintainability**: Easy to update error handling logic in one place
- **Clean code**: Routes focus on business logic, not error handling

## Creating a Custom Error Class

First, let's create a custom error class that will make our error handling more organized and powerful.

### Step 1: Create the Error Class File

Create a new file called `customError.js` in a `utils` or `errors` folder:

```javascript
// utils/customError.js

/**
 * Custom Error Class for Express Applications
 *
 * This class extends the built-in JavaScript Error class
 * and adds additional properties like HTTP status codes
 */
class CustomError extends Error {
  /**
   * Constructor for CustomError
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
   * @param {string} message - Error message to display
   */
  constructor(statusCode, message) {
    // Call the parent Error class constructor with the message
    super(message);

    // Set the HTTP status code for this error
    this.statusCode = statusCode;

    // Set the error name (helpful for debugging)
    this.name = this.constructor.name;

    // Determine if this is an operational error (expected) or programming error
    // Errors with status codes 400-499 are usually operational (client errors)
    this.isOperational = statusCode >= 400 && statusCode < 500;

    // Capture the stack trace (helps with debugging)
    // This removes the constructor function from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Export the class so it can be used in other files
module.exports = CustomError;
```

### Why Extend the Error Class?

By extending JavaScript's built-in `Error` class, our custom error:

- Keeps all the standard error functionality (like stack traces)
- Adds our own properties (like HTTP status codes)
- Works seamlessly with Express.js error handling

## Using the Custom Error Class

Now let's see how to import and use our custom error class in route handlers.

### Step 2: Import and Use in Routes

```javascript
// routes/userRoutes.js

const express = require("express");
const CustomError = require("../utils/customError"); // Import our custom error class
const router = express.Router();

/**
 * GET /users/:id - Get a user by ID
 */
router.get("/users/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Validate the user ID
    if (!userId || isNaN(userId)) {
      // Create and throw a custom error for bad requests
      throw new CustomError(400, "User ID must be a valid number");
    }

    // Simulate database lookup (replace with actual database call)
    const user = await findUserById(userId);

    // Check if user exists
    if (!user) {
      // Create and throw a custom error for not found
      throw new CustomError(404, `User with ID ${userId} not found`);
    }

    // Send successful response
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Pass any error to the error handling middleware
    // The 'next' function with an error parameter triggers error middleware
    next(error);
  }
});

/**
 * POST /users - Create a new user
 */
router.post("/users", async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      throw new CustomError(400, "Name and email are required fields");
    }

    // Validate email format (simple check)
    if (!email.includes("@")) {
      throw new CustomError(400, "Please provide a valid email address");
    }

    // Simulate creating user (replace with actual database call)
    const newUser = await createUser({ name, email });

    // Send successful response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error); // Pass error to middleware
  }
});

module.exports = router;
```

### Key Points About Using Custom Errors:

1. **Always use `next(error)`**: This passes the error to Express's error handling system
2. **Specific status codes**: Use appropriate HTTP status codes (400 for bad requests, 404 for not found, etc.)
3. **Clear messages**: Write error messages that help users understand what went wrong

## Setting Up Global Error Handling Middleware

Error handling middleware in Express.js is special - it must have **exactly 4 parameters**: `(err, req, res, next)`.

### Step 3: Create Error Handling Middleware

```javascript
// middleware/errorHandler.js

const CustomError = require("../utils/customError");

/**
 * Global Error Handling Middleware
 *
 * This middleware catches all errors in the application
 * and sends appropriate responses to the client
 *
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.log("Error Handler Triggered 🚨");

  // Start with default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Check if this is our custom error
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  // Handle specific types of common errors
  else if (err.name === "ValidationError") {
    // MongoDB validation error
    statusCode = 400;
    message = "Validation failed: " + err.message;
    isOperational = true;
  } else if (err.name === "CastError") {
    // MongoDB invalid ID error
    statusCode = 400;
    message = "Invalid ID format";
    isOperational = true;
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 400;
    message = "Duplicate field value entered";
    isOperational = true;
  }

  // Log error for debugging (in production, use proper logging service)
  console.error("Error Details:", {
    message: err.message,
    statusCode,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
  });

  // Prepare response object
  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  // In development, include stack trace for debugging
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  }

  // If this is a programming error (not operational),
  // don't expose internal details to the client
  if (!isOperational && process.env.NODE_ENV === "production") {
    errorResponse.error.message = "Something went wrong";
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
```

### Step 4: Register the Error Middleware in Your Main App

```javascript
// app.js or server.js

const express = require("express");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler"); // Import our error handler

const app = express();

// Regular middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api", userRoutes);

// 404 Handler - This runs if no route matches
app.all("*", (req, res, next) => {
  const CustomError = require("./utils/customError");
  const error = new CustomError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

// IMPORTANT: Error handling middleware must be registered LAST
// It needs to come after all routes and other middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

**⚠️ Critical Point**: Error handling middleware must be registered **last**, after all routes and other middleware!

## Handling Async Errors

One of the trickiest parts of Express.js error handling is dealing with async functions. If an async function throws an error and you don't catch it properly, it can crash your application.

### The Problem with Async Errors

```javascript
// ❌ PROBLEMATIC CODE - Don't do this!
app.get("/users", async (req, res) => {
  // If this async operation fails, Express won't catch it automatically
  const users = await User.find(); // This could throw an error
  res.json(users);
});
```

### Solution 1: Manual Try-Catch (What We've Been Doing)

```javascript
// ✅ SAFE - Manual try-catch
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error); // Pass error to middleware
  }
});
```

### Solution 2: Async Wrapper Function (More Elegant)

Create a wrapper function that automatically catches async errors:

```javascript
// utils/asyncHandler.js

/**
 * Async Error Handler Wrapper
 *
 * This function wraps async route handlers and automatically
 * catches any errors, passing them to Express error middleware
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
```

### Step 5: Using the Async Handler

```javascript
// routes/userRoutes.js

const express = require("express");
const CustomError = require("../utils/customError");
const asyncHandler = require("../utils/asyncHandler"); // Import our async handler
const router = express.Router();

/**
 * GET /users - Get all users
 * Using asyncHandler wrapper - no need for manual try-catch!
 */
router.get(
  "/users",
  asyncHandler(async (req, res, next) => {
    // If any of these async operations fail,
    // asyncHandler will automatically catch the error
    const users = await User.find();

    if (!users || users.length === 0) {
      throw new CustomError(404, "No users found");
    }

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  })
);

/**
 * POST /users - Create a user
 * Clean async route handler with automatic error catching
 */
router.post(
  "/users",
  asyncHandler(async (req, res, next) => {
    const { name, email, age } = req.body;

    // Validation
    if (!name || !email) {
      throw new CustomError(400, "Name and email are required");
    }

    if (age && (age < 0 || age > 150)) {
      throw new CustomError(400, "Age must be between 0 and 150");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError(409, "User with this email already exists");
    }

    // Create new user
    const newUser = await User.create({ name, email, age });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  })
);

module.exports = router;
```

### Benefits of the Async Handler:

- **No repetitive try-catch blocks**: Cleaner, more readable code
- **Automatic error catching**: Never forget to handle async errors
- **Consistent error flow**: All errors go through the same middleware

## Complete Example

Let's put it all together with a working example that demonstrates different types of errors:

### Complete Route Example

```javascript
// routes/productRoutes.js

const express = require("express");
const CustomError = require("../utils/customError");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

// Simulate a database
let products = [
  { id: 1, name: "Laptop", price: 999.99, inStock: true },
  { id: 2, name: "Phone", price: 699.99, inStock: false },
];

/**
 * GET /products - Get all products
 */
router.get(
  "/products",
  asyncHandler(async (req, res) => {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  })
);

/**
 * GET /products/:id - Get product by ID
 */
router.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      throw new CustomError(400, "Product ID must be a positive number");
    }

    // Simulate async database lookup
    await new Promise((resolve) => setTimeout(resolve, 50));

    const product = products.find((p) => p.id === id);

    if (!product) {
      throw new CustomError(404, `Product with ID ${id} not found`);
    }

    res.json({
      success: true,
      data: product,
    });
  })
);

/**
 * POST /products - Create a new product
 */
router.post(
  "/products",
  asyncHandler(async (req, res) => {
    const { name, price, inStock } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new CustomError(
        400,
        "Product name is required and must be a non-empty string"
      );
    }

    if (!price || typeof price !== "number" || price <= 0) {
      throw new CustomError(
        400,
        "Price is required and must be a positive number"
      );
    }

    // Check for duplicate names
    const existingProduct = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (existingProduct) {
      throw new CustomError(409, `Product with name "${name}" already exists`);
    }

    // Simulate async database save
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create new product
    const newProduct = {
      id: products.length + 1,
      name: name.trim(),
      price,
      inStock: inStock ?? true,
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  })
);

/**
 * DELETE /products/:id - Delete a product
 */
router.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new CustomError(400, "Invalid product ID");
    }

    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      throw new CustomError(404, `Product with ID ${id} not found`);
    }

    // Simulate async delete operation
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Remove product
    const deletedProduct = products.splice(productIndex, 1)[0];

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  })
);

/**
 * GET /products/error/demo - Demo endpoint to show error handling
 */
router.get(
  "/products/error/demo",
  asyncHandler(async (req, res) => {
    // Simulate different types of errors based on query parameter
    const errorType = req.query.type;

    switch (errorType) {
      case "validation":
        throw new CustomError(400, "This is a validation error demo");

      case "notfound":
        throw new CustomError(404, "This is a not found error demo");

      case "server":
        throw new CustomError(500, "This is a server error demo");

      case "async":
        // Simulate an async operation that fails
        await new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error("Async operation failed")), 100);
        });
        break;

      default:
        res.json({
          message:
            "Add ?type=validation, notfound, server, or async to see error demos",
        });
    }
  })
);

module.exports = router;
```

## Advanced Error Handling Middleware

Here's an enhanced version of our error handling middleware with more features:

```javascript
// middleware/errorHandler.js

const CustomError = require("../utils/customError");

/**
 * Enhanced Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.log("\n🚨 ERROR CAUGHT BY MIDDLEWARE 🚨");
  console.log("Time:", new Date().toISOString());
  console.log("URL:", req.method, req.originalUrl);
  console.log("Error:", err.message);

  let error = { ...err };
  error.message = err.message;

  // Handle different types of errors

  // 1. Our Custom Errors (already properly formatted)
  if (err instanceof CustomError) {
    // Use the error as-is
  }

  // 2. MongoDB CastError (invalid ObjectId)
  else if (err.name === "CastError") {
    const message = "Invalid ID format";
    error = new CustomError(400, message);
  }

  // 3. MongoDB Validation Error
  else if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = `Validation Error: ${messages.join(", ")}`;
    error = new CustomError(400, message);
  }

  // 4. MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new CustomError(400, message);
  }

  // 5. JWT Errors
  else if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new CustomError(401, message);
  } else if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new CustomError(401, message);
  }

  // 6. Generic Errors (programming errors, unexpected issues)
  else {
    console.error("Unexpected Error Stack:", err.stack);
    error = new CustomError(500, "Something went wrong");
  }

  // Prepare response
  const response = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode || 500,
    },
  };

  // Add extra info in development mode
  if (process.env.NODE_ENV === "development") {
    response.error.stack = err.stack;
    response.error.details = {
      originalMessage: err.message,
      name: err.name,
      code: err.code,
    };
  }

  // Send the error response
  res.status(error.statusCode || 500).json(response);
};

/**
 * 404 Handler - For routes that don't exist
 * This should be registered before the error handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new CustomError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
```

### Step 6: Complete App Setup

```javascript
// app.js

const express = require("express");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use("/api", productRoutes);
app.use("/api", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Handle 404 errors (must come before error handler)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🧪 Error demo: http://localhost:${PORT}/api/products/error/demo?type=validation`
  );
});

module.exports = app;
```

## Project Structure

Here's how to organize your files for clean, maintainable error handling:

```
my-express-app/
│
├── app.js                     # Main application file
├── package.json               # Dependencies
│
├── routes/                    # Route handlers
│   ├── userRoutes.js         # User-related routes
│   ├── productRoutes.js      # Product-related routes
│   └── authRoutes.js         # Authentication routes
│
├── middleware/                # Custom middleware
│   ├── errorHandler.js       # Global error handling
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Request validation middleware
│
├── utils/                     # Utility functions and classes
│   ├── customError.js        # Custom error class
│   ├── asyncHandler.js       # Async error wrapper
│   └── logger.js            # Logging utilities
│
├── models/                    # Database models (if using MongoDB/Mongoose)
│   ├── User.js
│   └── Product.js
│
└── controllers/               # Business logic (optional - for larger apps)
    ├── userController.js
    └── productController.js
```

## Testing Your Error Handling

Here are some URLs you can test with your setup:

### Successful Requests:

- `GET /api/products` - Get all products
- `GET /api/products/1` - Get product with ID 1
- `POST /api/products` with body `{"name": "Tablet", "price": 299.99}`

### Error Scenarios:

- `GET /api/products/abc` - Invalid ID format (400 error)
- `GET /api/products/999` - Product not found (404 error)
- `POST /api/products` with body `{"name": ""}` - Validation error (400 error)
- `GET /api/nonexistent` - Route not found (404 error)
- `GET /api/products/error/demo?type=validation` - Demo validation error

## Best Practices Summary

### ✅ Do:

1. **Use custom error classes** for consistent error structure
2. **Always use `next(error)`** to pass errors to middleware
3. **Wrap async functions** with try-catch or async handlers
4. **Register error middleware last** in your application
5. **Log errors** for debugging and monitoring
6. **Use appropriate HTTP status codes** (400, 404, 409, 500, etc.)
7. **Validate input data** and throw meaningful errors
8. **Hide sensitive error details** in production

### ❌ Don't:

1. **Don't let async errors go unhandled** - they can crash your app
2. **Don't expose internal error details** to users in production
3. **Don't forget to call `next(error)`** - errors won't be handled properly
4. **Don't put error middleware before routes** - it won't catch route errors
5. **Don't ignore error logging** - you need to know when things break

## Common HTTP Status Codes for APIs

| Code | Meaning               | When to Use                             |
| ---- | --------------------- | --------------------------------------- |
| 400  | Bad Request           | Invalid input, validation failures      |
| 401  | Unauthorized          | Authentication required                 |
| 403  | Forbidden             | User doesn't have permission            |
| 404  | Not Found             | Resource doesn't exist                  |
| 409  | Conflict              | Resource already exists, duplicate data |
| 422  | Unprocessable Entity  | Valid JSON but invalid data             |
| 500  | Internal Server Error | Unexpected server errors                |

## Conclusion

With this error handling setup, you now have:

- **Consistent error responses** across your entire application
- **Automatic async error handling** that prevents crashes
- **Centralized error processing** that's easy to maintain
- **Proper logging** for debugging issues
- **Security** by not exposing sensitive information

Remember: Good error handling makes your application more reliable, easier to debug, and provides a better user experience. Start with this foundation and expand it as your application grows!

## Next Steps

1. **Practice**: Try implementing this in a small Express project
2. **Logging**: Consider using libraries like Winston for production logging
3. **Monitoring**: Look into error tracking services like Sentry
4. **Testing**: Write tests for your error handling middleware
5. **Documentation**: Document your API's error responses for frontend developers
