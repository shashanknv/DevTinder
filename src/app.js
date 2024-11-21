const express = require("express");

const app = express();

app.get("/", (req, res)=> {
    res.send("Hello Home");
});

app.get("/admin", (req, res)=> {
    res.send("Hello Admin");
});

app.listen(7777, ()=> {
    console.log("server listening on port 7777...")
});