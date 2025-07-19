const mongoose=require("mongoose");


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/test");
};

main().then(()=>{
    console.log("Mongodb server is connected");
}).catch((err)=>{
    console.log(err);
});

//SHORT HAND
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    age:Number,
});

//CORRECT FORMAT
const userSchema2=new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    age:{
        type:Number
    }
});

//MODEL TO CREATE COLLECTION
const User=mongoose.model("User",userSchema);

// NOTE THE DETAILS OF INSERTED DATA , IT DOESNT FOLLOW SCHWMA BUT WORKS FINELY

const user1=new User({
    name:"user1",
    email:"user1@gmail.com",
    age:18
});

user1.save();

User.insertMany([{
    name:"user2",
    email:"user2@gmail.com",
    age:18,
    password:"bhootnath"
},
{
    name:"user3",
    email:"user3@gmail.com",
    password:"bootcamp",
    age:19,
},
{
    name:"user4",
    passsword:"bothume",
    age:20,
    email:"user4@gmail.com",
}]);



function queryManager(query) {
  query
    .then((res) => console.log("✅", res))
    .catch((err) => console.error("❌", err));
}

queryManager(User.findOne({name:"user1"}));
//RETURNS AN ARRAY.


queryManager(User.find({age:18}));
// RETURNS AN OBJECT.

queryManager(User.findById("87b2e414a952a5fd7e6f600"));
//RETURNS AN OBJECT.

queryManager(User.updateOne({name:"user1"},{age:20}));
//UPDATES SIGLE DATA, BUT DONT RETURN THE DATA (OLDER/NEWER).

queryManager(User.updateMany({age:{$gt:18}},{age:18}));
//UPDATES MULTIPLE USERS, BUT DONT RETURN THE DATA (OLDER/NEWER).

queryManager(User.findOneAndUpdate({name:"user1"},{age:20}));
//RETURNS OLDER DATA  , findById is similar.

queryManager(User.findByIdAndUpdate("87b2e414a952a5fd7e6f600",{age:55},{new:true}));
//RETURNS UPDATED DATA , same for findOneAndUpdate.

queryManager(User.findOneAndDelete({name:"user1"}))
//RETURNS DATA OF DELETED USER.

