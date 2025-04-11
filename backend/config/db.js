const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        await mongoose.connect('mongodb://localhost:27017/online-learning');
        console.log('MongoDb connected locally');
    }catch(err){
        console.log('MongoDB connection error',err.message);
        process.exit(1);
    }
};

module.exports=connectDB