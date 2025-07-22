const express=require("express");
const app=express();

app.use(express.urlencoded({extended:true})); //This is for express to know how to parse the urlencoded data 


//This will start the backend server on http://localhost:8080
app.listen("8080",()=>{
    console.log("Server is listening on port 8080");
});

//Thid will handle any get request on the path "/"

app.get("/",(req,res)=>{
    res.send("Add '/ghost' on your route or add '/$yourname' on the route");
})

app.get("/ghost",(req,res)=>{
    res.send("👻👻 I'm the ghost");
})

app.get("/:name",(req,res)=>{
    let {name}=req.params;
    res.send(`Have a warm welcome here ${name}`)
})