var mysql=require('mysql');

var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"inventory",
    multipleStatements:true
});

const db=con.connect(function(err){
    if (err) throw err;
    console.log("Database Connected!");
})

module.exports=con;