const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation")
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    //Validation of data
    validateSignUpData(req);

    const {firstName, lastName, emailId, password} = req.body;
    //Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //Creating a new instance of the user model
    const user = new User({
      firstName, 
      lastName, 
      emailId, 
      password: passwordHash,
    });

    await user.save();
    res.send("Usser added successfully");
  } catch (err) {
    res.status(400).send("ERROR :" +err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password} = req.body;

    const user = await User.findOne({emailId: emailId});
    if (!user) {
      throw new Error("Invalid Credentials!");
    }
    const isPasswordValid = await user.validatePassword(password);

    if(isPasswordValid) {

      const token = await user.getJWT();
      console.log(token);

      //Add the token to cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.mow() + 8 * 3600000),
      });
      res.send("Login successful!!");
    } else {
      throw new Error("Invalid Credentials!");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
})

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR :" +err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  //Sending a connection request
  console.log("Sending connection request");

  res.send(user.firstName + " sent the connection request!");
});

//Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try{
    const users = await User.find({emailId: userEmail});
    if (users.length === 0){
      res.status(404).send("User not found");
    } else{
      res.send(users);
    }    
  } catch(err) {
    res.status(400).send("Something went wrong");
  }
});

//Feed API - GET /feed - get all the users from the database
  app.get("/feed", async (req, res) => {
    try {
      const users = await User.find({});
      res.send(users)
    } catch(err) {
      res.status(400).send("Something went wrong");
    }
  });

  //Delete a user from the database
  app.delete("/user", async(req, res) => {
    const userId = req.body.userId;
    try {
      const user = await User.findByIdAndDelete(userId);

      res.send("User deleted successfully");
    } catch(err) {
      res.status(400).send("Something went wrong");
    }
  });

//Update data of the user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try{
    const ALLOWED_UPDATES = [
      "photoUrl", "about", "gender", "age","gender", "skills",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if(!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if(data?.skills.length > 10){
      throw new Error("Skills cannot be more than 10");
    }

    const user = await User.findByIdAndUpdate({_id: userId}, data,{
      returnDocument: "after",
      runValidators: true,
    });
    consile.log(user);
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("UPDATE FAILED:" +err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established..");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });