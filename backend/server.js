//this is for connecting to allt he server and datbase 
const express=require('express');
const connectDB = require('./config/db');
const cors=require('cors');
require('dotenv').config();

const app=express();


//middleware
app.use(express.json());
app.use(cors());

//connected to mongDB
connectDB();

//test route
app.get('/',(req,res)=>{
    res.send('API is running');
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);



const PORT=process.env.PORT || 5000;
//start server
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`)//always use backtick
});