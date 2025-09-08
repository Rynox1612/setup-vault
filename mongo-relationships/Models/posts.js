const mongoose = require("mongoose");

main()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationDemo");
}

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: String,
  email: String,
});

const User = new mongoose.model("User", UserSchema);

const PostSchema = new Schema({
  content: String,
  likes: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Post = new mongoose.model("Post", PostSchema);

async function addUser() {
  const user1 = new User({
    username: "rahulgandhi",
    email: "rahulofficial@gmail.com",
  });

  let result = await user1.save();
  console.log(result);
}

async function addPost() {
  let user1 = await User.find({ name: "rahulgandhi" });
  let result = await Post.insertMany([
    {
      content: "Reservation ko badhaya jayega",
      likes: 533,
      user: user1[0],
    },
    {
      content: "BJP is stealing votes",
      likes: 953443,
      user: user1[0],
    },
  ]);
  console.log(result);
}

addUser();
addPost();
