const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true })); //MIDDLEWARE

// SIMPLE MIDDLEWARE

// app.use((req, res) => {
//   console.log("I am middleware.");
//   res.send("i am middleware");
// });

app.use("/api", (req, res, next) => {
  let { token } = req.query;
  if (token == "giveAccess") {
    next();
  } else {
    res.send("Access Denied");
  }
});

// USEFUL MIDDLEWARE
app.use((req, res, next) => {
  req.time = new Date(Date.now()).toString();
  console.log(req.time);
  return next();
});

app.listen("8080", () => {
  console.log("Server is listening on port 8080");
});

app.get("/", (req, res) => {
  res.send("Add '/ghost' on your route or add '/$yourname' on the route");
});

app.get("/ghost", (req, res) => {
  res.send("👻👻 I'm the ghost");
});

app.get("/:name", (req, res) => {
  let { name } = req.params;
  res.send(`Have a warm welcome here ${name}`);
});
