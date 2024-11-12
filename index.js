
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const router=require("./Routes/routes");

const app = express();
const PORT =5000 || 5500;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "complex-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/User", { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('Error connecting to MongoDB:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Set template engine
app.set("view engine", "ejs");

//Routes
const routes = require("./Routes/routes");
app.use("/", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Serve static files
app.use(express.static("uploads"));

// Start the server
// app.listen(PORT, () => {
//   console.log(`App is listening on http://localhost:${PORT}`);
// });
module.exports=app