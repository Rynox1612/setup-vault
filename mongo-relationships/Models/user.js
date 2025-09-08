const mongoose = require("mongoose");

main()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationDemo");
}

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
  },
  address: [{ location: String, city: String }],
});

// DONT WANT TO GENERATE ID OF A PARTICULAR ADDRESS USE (_id: false) as another key value pair

const User = mongoose.model("User", UserSchema);

async function data() {
  const user1 = new User({
    username: "Sherlock holmes",
    address: [{ location: "sharma galli", city: "london" }],
  });

  user1.address.push({ location: "Singham nagar", city: "New york" });

  let result = await user1.save();

  console.log(result);
}

data();
