const mongoose=require("mongoose");
const Chat=require("./models/chat");


main()
.then(()=>{
    console.log("Connection sucessful");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    mongoose.connect("mongodb://127.0.0.1:27017/whatsapp");
};

Chat.insertMany([
{
    from: "User1",
    message: "Hello chai!!",
    to: "User2",
    date: new Date()
},
{
    from: "User3",
    message: "Oyy sun chal free hai toh kahi jaakar aate hai",
    to: "User4",
    date: new Date()
},
{
    from: "User2",
    message: "Ayien!! Baigan.",
    to: "User6",
    date: new Date()
},
{
    from: "User4",
    message: "Berlin died in money hiest S1",
    to: "User7",
    date: new Date()
},
{
    from: "User5",
    message: "Free Palestine!!",
    to: "User3",
    date: new Date()
},
{
    from: "User8",
    message: "All eyes on Ukraine",
    to: "User1",
    date: new Date()
},
{
    from: "User5",
    message: "Once Putin said, Trump was a genius.",
    to: "User1",
    date: new Date()
},
{
    from: "User3",
    message: "Modi hai toh munkin hai.",
    to: "User8",
    date: new Date()
},
{
    from: "User7",
    message: "Pakisthan destroyed Rajasthan port",
    to: "User8",
    date: new Date()
},
{
    from: "User4",
    message: "Heyy !! Give me some notes too.. ",
    to: "User3",
    date: new Date()
},
{
    from: "User2",
    message: "Nahh , I'd never fell for something like that",
    to: "User1",
    date: new Date()
}
]);