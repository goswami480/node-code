const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const Users =require("../Models/sign")
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const app = express()
const bcrypt=require ("bcrypt")

app.get('/sign_user',async(req,res)=>{
  try{
    const saltRounds=10;
    const password=req.body.password;
    const salt=bcrypt.gensalt(saltRounds)
    const hashedpassword=bcrypt.hash(password,salt)
    const Users={
      name:req.body.name,
      email:req.body.email,
      password:hashedpassword,
      phone:req.body.phone,
    }
    const user = await user.save(Users); 
    
   
      res.send({message:"user created successfully",status:200})
      res.render('/login')
  }catch(err){
    res.send({message:"user not created",status:400})
  }
});
app.post('/login',async(req,res)=>{
  try{
    const user = await User.findOne({email:req.body.email})
    if(user.password==req.body.password){
      res.send({message:"user logged in successfully",status:200})
      res.render('/')
      }else{
        res.send({message:"user not logged in",status:400})
      }
        const token =jwt.sign({
          id:user._id,
          email:user.email

        }  ,"secretkeyappearshere", 
        { expiresIn: "1h" })
          
        console.log("generated toke",token);
        res.status(200).json({
          message: "user logged in successfully",
          data:{
            id:user_id,
            email:user.email,
            token:token
          }
        })

  
  
  
  
  
    }catch(err){
    res.send({message:"user not logged in",status:400})
  }
});

// Configure multer for file upload the logic goes here for the file upload
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
   // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null,  Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage }).single("image");

// Route for adding a user to the database
router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });
    await user.save();
    req.session.message = {
      type: "success",
      message: "User added successfully",
    };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: "Failed to add user",
    };
    res.status(500).redirect("/");
  }
});

// Route for rendering the index page
router.get("/", async (req, res) => {
  try {
    const users = await User.find().exec(); // Fetch users from the database
    const message = req.session.message; // Retrieve the message from the session
    delete req.session.message; // Remove the message from the session

    res.render("index", {
      title: "Home Page", 
      users: users, // Pass the users data to the view
      message: message, // Pass the message to the view
    });
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: "Failed to fetch users",
    };
    res.redirect("/");
  }
});

// Edit a user route
router.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (!user) {
      return res.redirect("/");
    }

    res.render("edit_user", {
      title: "Edit User",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

router.post("/update/:id", upload, async (req, res) => {
  const id = req.params.id;
  const newImage = req.file ? req.file.filename : req.body.old_image;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Remove the previous image file if a new image was uploaded
    if (req.file) {
      try {
        fs.unlinkSync(`./uploads/${req.body.old_image}`);
      } catch (err) {
        console.log(err);
      }
    }
 
    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };
    res.redirect("/");    
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: err.message,
    };
    res.redirect("/");
  }
});




// Delete user route functionality goes here
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  User.findOneAndDelete({ _id: id })
    .exec()
    .then((result) => {
      if (result && result.image !== "") {
        try {
          fs.unlinkSync("./uploads/" + result.image);
          console.log("Image deleted:", result.image);
        } catch (err) {
          console.log("Error deleting image:", err);
        }  
      }
      req.session.message = {
        type: "danger",
        message: "User deleted successfully",
      };

      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

// Route for rendering the add_users page
router.get("/add_user", (req, res) => {
  res.render("add_user", {
    title: "User Page",
  });
});


// Route for rendering the add_users page
router.get("/logout", (req, res) => {
  res.send("OK")
});

module.exports = router;
