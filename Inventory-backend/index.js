const path=require('path');
const express=require('express');
const app=express();
const db=require('./Configuration/config');
const query=require('./Database/query');
const inverntoryRoutes=require('./routes/inventory');
const bodyParser=require('body-parser');
const cors=require('cors');

app.use(bodyParser.json());

app.use(cors());

app.use((req,res,next)=>{
    console.log(req.body);
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','OPTIONS,GET,POST,PUT,PATCH,DELETE');
    next();
  });

app.use(inverntoryRoutes);

app.use((error,req,res,next)=>{
    console.log(error);
    const status=error.statusCode || 500;
    const message=error.message;
    const data=error.data;
    return res.status(status).json({message:message,data:data});
  });

app.listen(process.env.PORT || 5000, ()=>{
    db.query(query,function(err,result){
        if (err){ 
            const error=new Error("Data base connection Failed");
            throw error;
        }
    });
    console.log("Server Started!");    
});

