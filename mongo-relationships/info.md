# MongoDB Data Relationships Guide

A comprehensive guide to modeling relationships in MongoDB, covering different approaches and best practices with practical examples.

## Table of Contents

- [SQL vs MongoDB Relationships](#sql-vs-mongodb-relationships)
- [MongoDB Relationship Patterns](#mongodb-relationship-patterns)
- [The 6 Rules of Thumb](#the-6-rules-of-thumb)
- [Practical Examples](#practical-examples)
- [When to Use Each Approach](#when-to-use-each-approach)
- [Best Practices](#best-practices)

---

## SQL vs MongoDB Relationships

### SQL Relationships (via Foreign Keys)

- **One-to-One**: President of a country
- **One-to-Many**: Instagram user and posts
- **Many-to-Many**: Teachers and students

### MongoDB Relationships (Document-Based)

MongoDB offers more flexibility in modeling relationships through three main patterns:

- **Embedding** (One-to-Few)
- **Referencing** (One-to-Many)
- **Parent Referencing** (One-to-Squillions)

---

## MongoDB Relationship Patterns

### 1. One-to-Few (Embedding)

**Use Case**: Store a small number of related documents (addresses for a user)

**Example**: Delivery app storing user addresses

```javascript
{
    _id: ObjectId("4574hw9344yeudeyr"),
    username: "Ashish Chanchalani",
    addresses: [
        {location: "Sharma Galli", city: "London"},
        {location: "Singham Nagar", city: "New York"}
    ]
}
```

**Advantages**:

- Single query retrieval
- Atomic updates
- Better performance for small datasets

**Disadvantages**:

- Cannot query embedded documents independently
- Document size limitations (16MB)

### 2. One-to-Many (Array of References)

**Use Case**: Product with replacement parts, user with orders

**Example**: Customer orders system

```javascript
// Order Collection
{
    _id: ObjectId("AAAA"),
    item: "Samosa",
    price: 15
}

// Customer Collection
{
    _id: ObjectId("BBBB"),
    name: "Anuj Gupta",
    orders: [ObjectId("AAAA"), ObjectId("CCCC")]
}
```

**Implementation**:

```javascript
async function ItemData() {
  const result = await Order.insertMany([
    { item: "Samosa", price: 15 },
    { item: "Coke", price: 40 },
    { item: "Dosa", price: 30 },
  ]);
  console.log(result);
}

async function CustomerData() {
  let item1 = await Order.findOne({ item: "Samosa" });
  let item2 = await Order.findOne({ item: "Dosa" });

  let customer = new Customer({
    name: "Anuj Gupta",
    orders: [item1, item2],
  });

  let result = await customer.save();
  console.log(result);
}
```

**Using Populate**:

```javascript
// Instead of getting just ObjectIds, get full order details
const customerWithOrders = await Customer.find().populate("orders");
```

### 3. One-to-Squillions (Parent Referencing)

**Use Case**: Event logging system, social media posts, comments

**Example**: Blog posts and comments

```javascript
// Post Collection
{
    _id: ObjectId("POST123"),
    title: "MongoDB Guide",
    content: "Complete guide to MongoDB relationships...",
    author: "John Doe"
}

// Comments Collection (stores parent reference)
{
    _id: ObjectId("COMMENT456"),
    text: "Great article!",
    author: "Jane Smith",
    postId: ObjectId("POST123") // Reference to parent
}
```

**Query Pattern**:

```javascript
// Find all comments for a specific post
const comments = await Comment.find({ postId: ObjectId("POST123") });
```

---

## The 6 Rules of Thumb

MongoDB's official guidelines for schema design:

### Rule 1: Favor Embedding Unless There's a Compelling Reason Not To

**When to embed**:

- Small, finite number of subdocuments
- Data that's always accessed together
- Atomic updates are important

**Example**: User profile with contact information

```javascript
{
    _id: ObjectId("USER123"),
    name: "Alice Johnson",
    profile: {
        email: "alice@example.com",
        phone: "+1-555-0123",
        address: {
            street: "123 Main St",
            city: "Boston",
            zipcode: "02101"
        }
    }
}
```

### Rule 2: Needing to Access an Object on Its Own Is a Compelling Reason Not to Embed

**When to reference**:

- Objects need to be queried independently
- Objects are shared across multiple documents
- Objects have their own lifecycle

**Example**: Products and categories (categories used by multiple products)

```javascript
// Categories Collection
{ _id: ObjectId("CAT123"), name: "Electronics", description: "..." }

// Products Collection
{ _id: ObjectId("PROD456"), name: "Laptop", categoryId: ObjectId("CAT123") }
```

### Rule 3: Arrays Should Not Grow Without Bound

**Limits to consider**:

- **Few hundred documents**: Don't embed them
- **Few thousand documents**: Don't use ObjectID references in arrays
- **High-cardinality arrays**: Compelling reason not to embed

**Problem Example** (What NOT to do):

```javascript
// BAD: Unbounded array growth
{
    _id: ObjectId("USER123"),
    name: "Popular Blogger",
    followers: [ObjectId("F1"), ObjectId("F2"), ..., ObjectId("F100000")] // Too many!
}
```

**Better Approach**:

```javascript
// Followers Collection (parent referencing)
{
    _id: ObjectId("FOLLOW123"),
    followerId: ObjectId("F1"),
    followingId: ObjectId("USER123"),
    createdAt: Date()
}
```

### Rule 4: Don't Be Afraid of Application-Level Joins

**Benefits**:

- More flexibility than server-side joins
- Better performance with proper indexing
- Use projection to minimize network overhead

**Example**:

```javascript
// Efficient application-level join with projection
const product = await Product.findOne(
  { catalog_number: 1234 },
  { _id: 1, parts: 1 } // Only return necessary fields
);

const productParts = await Parts.find({ _id: { $in: product.parts } });
```

### Rule 5: Consider the Read-to-Write Ratio When Denormalizing

**When to denormalize**:

- High read-to-write ratio
- Frequently accessed data
- Performance is critical

**Example**: Denormalizing frequently accessed user data

```javascript
// Without denormalization (requires join)
// Orders Collection
{ _id: ObjectId("ORDER123"), userId: ObjectId("USER456"), total: 100 }
// Users Collection
{ _id: ObjectId("USER456"), name: "John Doe", email: "john@example.com" }

// With denormalization (single query)
// Orders Collection
{
    _id: ObjectId("ORDER123"),
    userId: ObjectId("USER456"),
    userName: "John Doe", // Denormalized
    total: 100
}
```

### Rule 6: Structure Your Data to Match Your Application's Access Patterns

**Key considerations**:

- How does your application query data?
- What are the most common operations?
- What queries need to be optimized?

**Example**: E-commerce product catalog

```javascript
// If you frequently need product info with category details:
{
    _id: ObjectId("PROD123"),
    name: "Gaming Laptop",
    price: 1299,
    category: {
        _id: ObjectId("CAT456"),
        name: "Electronics",
        department: "Computing"
    },
    // Other product fields...
}
```

---

## Practical Examples

### Example 1: Blog System

```javascript
// Posts Collection (One-to-Squillions with comments)
{
    _id: ObjectId("POST123"),
    title: "MongoDB Best Practices",
    content: "...",
    author: "Tech Writer",
    tags: ["mongodb", "database", "nosql"], // One-to-few embedded
    metadata: {
        views: 1250,
        likes: 89,
        publishedAt: ISODate("2023-12-01")
    }
}

// Comments Collection (Parent referencing)
{
    _id: ObjectId("COMMENT456"),
    postId: ObjectId("POST123"),
    author: "Reader Name",
    text: "Great article!",
    createdAt: ISODate("2023-12-02")
}
```

### Example 2: E-commerce System

```javascript
// Users Collection
{
    _id: ObjectId("USER123"),
    username: "john_doe",
    profile: { // One-to-one embedded
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com"
    },
    addresses: [ // One-to-few embedded
        {
            type: "home",
            street: "123 Main St",
            city: "Boston",
            zipcode: "02101"
        }
    ]
}

// Orders Collection (One-to-many with products)
{
    _id: ObjectId("ORDER789"),
    userId: ObjectId("USER123"),
    userName: "John Doe", // Denormalized for quick access
    items: [
        {
            productId: ObjectId("PROD456"),
            productName: "Laptop", // Denormalized
            quantity: 1,
            price: 999
        }
    ],
    total: 999,
    orderDate: ISODate("2023-12-01")
}
```

---

## When to Use Each Approach

### Choose Embedding When:

- ✅ Small number of subdocuments (< 100)
- ✅ Data is always accessed together
- ✅ Subdocuments don't need independent access
- ✅ Atomic updates are required
- ✅ Strong consistency is needed

### Choose Referencing When:

- ✅ Large number of related documents
- ✅ Documents need independent access
- ✅ Many-to-many relationships
- ✅ Documents are shared across collections
- ✅ Flexible querying is needed

### Choose Parent Referencing When:

- ✅ One-to-squillions relationship
- ✅ Unbounded growth expected
- ✅ Child documents accessed more frequently
- ✅ Need to query children independently

---

## Best Practices

### Performance Optimization

1. **Index Strategy**: Create indexes on frequently queried fields

```javascript
// Index on foreign key for efficient lookups
db.comments.createIndex({ postId: 1 });
db.orders.createIndex({ userId: 1 });
```

2. **Projection**: Limit returned fields to reduce network overhead

```javascript
// Only return necessary fields
const users = await User.find({}, { name: 1, email: 1 });
```

3. **Aggregation Pipeline**: Use for complex queries

```javascript
// Get user with order count
const result = await User.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders",
    },
  },
  {
    $project: {
      name: 1,
      email: 1,
      orderCount: { $size: "$orders" },
    },
  },
]);
```

### Data Modeling Guidelines

1. **Start Simple**: Begin with embedding, refactor if needed
2. **Document Size**: Keep documents under 16MB limit
3. **Array Limits**: Monitor array growth, consider alternatives for large arrays
4. **Consistency**: Choose consistency level based on requirements
5. **Testing**: Test with realistic data volumes and access patterns

### Common Pitfalls to Avoid

❌ **Don't embed unbounded arrays**

```javascript
// Bad: Unlimited growth
{ userId: "123", notifications: [...thousands of items] }
```

❌ **Don't over-normalize**

```javascript
// Unnecessary: Separate collection for simple data
{ userId: "123", profileId: "456" } // Just embed the profile
```

❌ **Don't ignore access patterns**

```javascript
// Bad: Structure doesn't match queries
// If you always need user info with orders, consider denormalization
```

✅ **Do consider hybrid approaches**

```javascript
// Good: Combine techniques as needed
{
    userId: ObjectId("123"),
    userEmail: "john@example.com", // Denormalized for quick access
    items: [ObjectId("456"), ObjectId("789")], // Referenced for flexibility
    metadata: { total: 150, tax: 15 } // Embedded for atomicity
}
```

---

## Conclusion

MongoDB's flexible document model allows for various relationship modeling approaches. The key is understanding your application's data access patterns and choosing the right combination of embedding, referencing, and denormalization techniques. Remember the 6 rules of thumb, but always test with realistic data and usage patterns to validate your design decisions.

For more detailed information, refer to the [Official MongoDB Documentation](https://docs.mongodb.com/manual/data-modeling/) and consider your specific use case requirements when making design choices.

> I am sure that this documentation will help me, thanks to claude.
