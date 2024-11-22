const express = require("express");

const app = express();

app.get("/user", (req, res)=> {
    res.send({firstname: "shashank", lastname: "NV"});
});

app.post("/user", (req, res)=> {
    res.send("POST call called");
});

app.delete("/user", (req, res)=> {
    res.send("DELETED");
});

app.listen(7777, ()=> {
    console.log("server listening on port 7777...")
});