const mongoose = require("mongoose");

main()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationDemo");
}

const { Schema } = mongoose;

const OrderSchema = new Schema({
  item: String,
  price: Number,
});

const CustomerSchema = new Schema({
  name: String,
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

const Order = new mongoose.model("Order", OrderSchema);
const Customer = new mongoose.model("Customer", CustomerSchema);

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

// ItemData();

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

// CustomerData();

async function findData() {
  let result = await Customer.findOne().populate("orders");
  console.log(result.orders);
}

findData();
