const db=require('../Configuration/config');
var async = require("async");
const router = require('../routes/inventory');

//Add Products Function
exports.postAddProduct=async (req,res,next)=>{
    const name=req.body.name;
    const stock=req.body.stock;
    const warehouse=req.body.warehouse;
    //Validation
    let myPromise=new Promise(function(myResolve,myReject){
        function make(){
            db.query("INSERT INTO product(name,stock,warehouse) VALUES(?,?,?)",
            [name,stock,warehouse],function(err,result,field){
                if(err){
                    myReject("There is some error ! Please Try Again");
                }
                else{
                    myResolve("Product is added successfully");
                }
            });
        }
        function validate(cb){
            db.query("SELECT * FROM product WHERE name=? AND warehouse=?",
            [name,warehouse],function(error,result,field){
                if(error){
                    myReject("There is some error ! Please Try Again");
                }
                else if(result.length>0){
                    myReject("You Can Not Add Multiple Product with Same Name and Warehouse");
                }
                else{
                    cb();
                }
            });
        }
        validate(make);
    });
    
    myPromise.then(result=>{
        res.status(200).json({message:result});
    }).catch(err=>{
        res.status(404).json({message:err});
    })
    
};

//Add Customer Function
exports.postAddCustomer=async (req,res,next)=>{
    const email=req.body.email;
    const name=req.body.name;
    const age=req.body.age;
    //Validation
    function validate(cb){
        db.query("SELECT * FROM customer WHERE email=?",
        [email],function(error,result,field){
            if(error||result.length>0){
                res.status(404).json({message:"Customer can not be added"});
            }
            else{
                cb();
            }
        });
    }
    //Perform Required Operations After Validation Completed
    function make(){
        db.query("INSERT INTO customer(email,name,age) VALUES(?,?,?)",
        [email,name,age],function(err,result,field){
            res.status(200).json({message:"successfully added"});
        });
    }
    validate(make);
};

//Order Booking Function
exports.postBookOrder=async (req,res,next)=>{
    var customer_email=req.body.customer_email;
    var quantity=req.body.quantity;
    var product_name=req.body.product_name;
    var status="Confirmed";
    let myPromise=new Promise(function(myResolve,myReject){
        //Check Required Stock is Available or not
        function validate(cb){
            db.query("SELECT SUM(stock) FROM product WHERE name=?",
            [product_name],function(error,result,field){
                if(error){
                    myReject("There is some Error!");
                }
                else{
                    result = JSON.stringify(result);
                    result=JSON.parse(result);
                    if(result && result[0]['SUM(stock)']>=quantity){
                        cb();
                    }
                    else{
                        myReject("Please Try Again with Less Quantity");
                    }
                }
            });
        }
        //Perform Required Operations After Validation Completed
        async function make(){        
            db.beginTransaction(function(err1){
                if(err1){ 
                    myReject("There is some Error!");
                }
                //Inserting order information in order table
                db.query("INSERT INTO orders(customer_email,product_name,quantity,status) VALUES(?,?,?,?)",
                [customer_email,product_name,quantity,status],async function(err,result){
                    if(err){
                        db.rollback(function(){
                            myReject("There is some Error!");
                        });
                    }
                    //order Id Retrival
                    var order_id = JSON.stringify(result);
                    order_id=JSON.parse(order_id)['insertId'];
                    //Select All warehouse and stock of this product
                    db.query("SELECT * FROM product WHERE stock>0 AND name=?",
                    [product_name],function(error,result){
                        if(error){
                            db.rollback(function(error){
                                myReject("There is some Error!");
                            })
                        }

                        var results = JSON.stringify(result);
                        results=JSON.parse(results);
                        
                        //Taking Stock From Warehouse and inserting it to orderdetails
                        async.forEach(results,function(result,callback) {
                            if(quantity>0){
                                var UpdatedStock=0,takenStock=result['stock'];
                                if(result['stock']>quantity){
                                    UpdatedStock=result['stock']-quantity;
                                    takenStock=quantity;
                                }
                                quantity=quantity-takenStock;
                                db.query("UPDATE product SET stock=? WHERE name=? AND warehouse=?",[UpdatedStock,result['name'],result['warehouse']], function(error) {
                                    if (error) {
                                        return callback(error);
                                    }
                                    db.query("INSERT INTO orderdetail(order_id,warehouse,quantity) VALUES(?,?,?)",[order_id,result['warehouse'],takenStock],function(error){
                                        if(error){
                                            return callback(error);
                                        }
                                    })
                                })
                            }
                        },function(error){
                            db.rollback(function(){
                                myReject("There is some Error!");
                            });
                        });
                        //Commit All the changes.
                        db.commit(function(error){
                            if(error){
                                myReject("There is some Error!");
                            }
                            else{
                                myResolve("Order is Booked Successfully");
                            }
                        });
                });
            });
        })};
        validate(make);
    });
    myPromise.then(result=>{
        res.status(200).json({message:result});
    }).catch(err=>{
        res.status(400).json({message:err});
    })
};

//Order Cancellation Method
exports.postCancelOrder=(req,res,next)=>{
    var order_id=parseInt(req.body.order_id);
    var status="Cancelled";
    let myPromise=new Promise(function(myResolve,myReject){
        //Checking Order is Present or not
        function validate(cb){
            db.query("SELECT COUNT(*) FROM orders WHERE id=? AND status=?",
            [order_id,"Confirmed"],function(error,result,field){
                if(error){
                    myReject("There is some error");
                }
                result = JSON.stringify(result);
                result=JSON.parse(result);
                if(result[0]['COUNT(*)']==0){
                    myReject("Please Check Your Order id and try again");
                }
                cb();
            });
        }
        //Start Deleting Order step by step
        async function make(){        
            db.beginTransaction(function(err1){
                if(err1){ 
                    myReject("There is some error"); 
                } 
                //Perform join on order and orderdetail so that we get All details related to project like which warehouse supply how much quantity
                db.query("SELECT od.quantity,o.product_name,od.warehouse FROM orderdetail as od INNER JOIN orders as o ON od.order_id=o.id WHERE od.order_id=?",
                    [order_id],function(err,result){
                        if(err){
                            db.rollback(function(){
                                myReject("There is Some error");
                            })
                        }

                        var orderdetails = JSON.stringify(result);
                        orderdetails=JSON.parse(orderdetails);
                        
                        //Start Updating inventory according to orderdetail information
                        async.forEach(orderdetails,function(orderdetail,callback) {
                            db.query("SELECT * FROM product WHERE name=? AND warehouse=?",[orderdetail['product_name'],orderdetail['warehouse']], function(error1, result1) {
                                if (error1) {
                                    return callback(error1)
                                }
                                result1=JSON.stringify(result1);
                                result1=JSON.parse(result1);
                        
                                UpdatedStock=result1[0]['stock']+orderdetail['quantity'];
                        
                                db.query("UPDATE product SET stock=? WHERE name=? AND warehouse=?",[UpdatedStock,orderdetail['product_name'],orderdetail['warehouse']],function(error1,result1){
                    
                                    if(error1){
                                        return callback(error1)
                                    }
                                })
                            })
                        },function(err){
                            if(err){
                                db.rollback(function(){
                                    myReject("There is Some Error!");
                                });
                            }
                        });
                        //Delete All order detail related to order
                        db.query("DELETE FROM orderdetail WHERE order_id=?",[order_id],function(error,result){
                            if(error){
                                db.rollback(function(){
                                    myReject("There is Some Error!");
                                });
                            }
                        })
                        //Update status of order to "Cancelled"
                        db.query("UPDATE orders SET status=? WHERE id=?",["Cancelled",order_id],function(error,result){
                            if(error){
                                db.rollback(function(){
                                    myReject("There is Some Error!");
                                });
                            }
                        })
                        //Commit All the changes
                        db.commit(function(err){
                            if(err){
                                myReject("There is Some Error!");
                            }
                            else{
                                myResolve("Order Cancelled Successfully");
                            }
                        });
                });
            });
        };
        validate(make);
    });
    myPromise.then(result=>{
        res.status(200).json({message:result});
    }).catch(error=>{
        res.status(400).json({message:error});
    })
}

exports.postUpdateStock=(req,res,next)=>{
    var name=req.body.name;
    var stock=req.body.stock;
    var warehouse=req.body.warehouse;
    function validate(cb){
        db.query("SELECT COUNT(*) From product WHERE name=? AND warehouse=?",
            [name,warehouse],function(error,result){
                var result = JSON.stringify(result);
                result=JSON.parse(result);
                if(error || result[0]['COUNT(*)']==0){
                    res.status(404).json({message:"Product Updating Fail!"});
                }
                else{
                    cb();
                }
            })
    }
    function make(){
        db.query("UPDATE product SET stock=? WHERE name=? AND warehouse=?",
            [stock,name,warehouse],function(error,result){
                if(error){
                    res.status(404).json({message:"Product Updating Fail!"});
                }
                else{
                    res.status(200).json({message:"Product Updated Successfully"});
                }
            })
    }
    validate(make);
}

exports.getProducts=(req,res,next)=>{
    db.query("SELECT * FROM product",function(err,result){
        if(err){
            res.status("404").json({message:"Product Fetching Failed!"});
        }
        else{
            result=JSON.stringify(result);
            result=JSON.parse(result);
            res.status(200).json(result);
        }
    })
}
exports.getOrders=(req,res,next)=>{
    db.query("SELECT customer.name as name,orders.product_name as product_name,orders.quantity as quantity,orders.status as status,orders.id as id FROM orders INNER JOIN customer ON orders.customer_email=customer.email",function(err,result){
        if(err){
            res.status("404").json({message:"Product Fetching Failed!"});
        }
        else{
            result=JSON.stringify(result);
            result=JSON.parse(result);
            res.status(200).json(result);
        }
    })
}