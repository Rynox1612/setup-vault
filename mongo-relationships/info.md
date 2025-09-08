# First sql relationships

## works via foreign keys

- one to one (predident of a country)
- one to many (instagram user and post)
- many to many (teacher and students)

# Mongo db data relationships

(majorly focusing on one to many)

- Approach 1- one to few (storing addresses for an delivery app either office or home)
  > we store the child document inside the parent

```Javascript
{
    _id:  Objectid("4574hw9344yeudeyr")
    username: "Ashish chanchalani"
    addresses: [
       {location: "sharma galli", city:"london"}
       {location: "Singham nagar", city: "New york"}
    ]
}
```

- Approach 2-

```Javascript
async function ItemData() {
  const result = await Order.insertMany([
    {
      item: "Samosa",
      price: 15,
    },
    {
      item: "Coke",
      price: 40,
    },
    {
      item: "Dosa",
      price: 30,
    },
  ]);
  console.log(result);
}

ItemData();

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

### Using populate

- As you can see the above code can only store id as the orders and give only id when using find method, So to get the name of the item ordered we use Populate

example customer.find().populate("orders")

- Approach 3: One to squillions

* Here you can't put every data in array to pass the parent(the one connected to many data), so instead add the parent in the children data for example see this

[Posts](./Models/posts.js)
