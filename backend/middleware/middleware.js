const jwt=require('jsonwebtoken');

const protect=(req,res,next)=>{
    const authHeader=req.headers.authorization;

    if(authHeader && authHeader.startsWith('Bearer')){
        const token=authHeader.split(' ')[1];

        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            req.user=decode;
            next();
        }catch(err){
            return res.status(401).json({message:'Invalid token'});
        }
    }else{
        res.status(401).json({message:'No token provided'});
    }
};

module.exports=protect;