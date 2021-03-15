const db=require('../Configuration/config');
var async = require("async");
const router = require('../routes/inventory');

exports.postAddProduct=async (req,res,next)=>{
    console.log("Product Adding Started");
    console.log(req);
    const name=req.body.name;
    const stock=req.body.stock;
    const warehouse=req.body.warehouse;
    function validate(cb){
        db.query("SELECT * FROM product WHERE name=? AND warehouse=?",
        [name,warehouse],function(error,result,field){
            if(error||result.length>0){
                res.status(404).json({"error":"Product can not be added"});
            }
            else{
                cb();
            }
        });
    }
    function make(){
        db.query("INSERT INTO product(name,stock,warehouse) VALUES(?,?,?)",
        [name,stock,warehouse],function(err,result,field){
            console.log(err);
            if(err){
                res.status(404).json({"error":"Product can not be added"});
            }
            else{
                res.status(200).json({"message":"successfully added"});
            }
        });
    }
    validate(make);
};

exports.postAddCustomer=async (req,res,next)=>{
    console.log("Customer Adding Started");
    const email=req.body.email;
    const name=req.body.name;
    const age=req.body.age;
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
    function make(){
        db.query("INSERT INTO customer(email,name,age) VALUES(?,?,?)",
        [email,name,age],function(err,result,field){
            res.status(200).json({message:"successfully added"});
        });
    }
    validate(make);
};

exports.postBookOrder=async (req,res,next)=>{
    console.log("Order Booking Started");
    var customer_email=req.body.customer_email;
    var quantity=req.body.quantity;
    var product_name=req.body.product_name;
    var status="Confirmed";
    console.log(product_name);
    function validate(cb){
        db.query("SELECT SUM(stock) FROM product WHERE name=?",
        [product_name],function(error,result,field){
            if(error){
                res.status(404).json({message:"Order can not be Book"});
            }
            else{
                result = JSON.stringify(result);
                result=JSON.parse(result);
                console.log(result[0]['SUM(stock)']);
                if(result && result[0]['SUM(stock)']>=quantity){
                    cb();
                }
                else{
                    res.status(404).json({message:"Order is not Booked successfully"});
                }
            }
        });
    }
    async function make(){        
        db.beginTransaction(function(err1){
            console.log(err1);
            if(err1){ throw err1; }
            db.query("INSERT INTO orders(customer_email,product_name,quantity,status) VALUES(?,?,?,?)",
            [customer_email,product_name,quantity,status],async function(err,result){
                if(err){
                    db.rollback(function(){
                        throw err;
                    });
                }
                //order Id Retrival
                var order_id = JSON.stringify(result);
                order_id=JSON.parse(order_id)['insertId'];
                
                db.query("SELECT * FROM product WHERE stock>0 AND name=?",
                [product_name],function(err,result){
                    if(err){
                        db.rollback(function(){
                            throw err;
                        })
                    }
                    var results = JSON.stringify(result);
                    results=JSON.parse(results);
                    console.log("quantity");
                    console.log(quantity);
                    console.log(results);
                    async.forEach(results,function(result,callback) {
                        console.log(result);
                        if(quantity>0){
                            var UpdatedStock=0,takenStock=result['stock'];
                            if(result['stock']>quantity){
                                UpdatedStock=result['stock']-quantity;
                                takenStock=quantity;
                            }
                            quantity=quantity-takenStock;
                            db.query("UPDATE product SET stock=? WHERE name=? AND warehouse=?",[UpdatedStock,result['name'],result['warehouse']], function(error1, result1) {
                                console.log(result1);
                                if (error1) {
                                    return callback(error1)
                                }
                                db.query("INSERT INTO orderdetail(order_id,warehouse,quantity) VALUES(?,?,?)",[order_id,result['warehouse'],takenStock],function(error1,result1){
                                    console.log(result1);
                                    if(error1){
                                        return callback(error1)
                                    }
                                })
                            })
                        }
                    },function(err){
                        db.rollback(function(){
                            throw err;
                        });
                    });
                    db.commit(function(err){
                        if(err){
                            throw err;
                        }
                    });
            });
        });
        res.status(200).json({message:"Order Booked successfully added"});
    })};
    validate(make);
};

exports.postCancelOrder=(req,res,next)=>{
    console.log("Order Cancellation Started Please wait!");
    var order_id=parseInt(req.body.order_id);
    var status="Cancelled";

    function validate(cb){
        db.query("SELECT COUNT(*) FROM orders WHERE id=? AND status=?",
        [order_id,"Confirmed"],function(error,result,field){
            console.log(error);
            if(error){
                res.status(404).json({message:"Order can not be cancelled"});
            }
            else{
                cb();
            }
        });
    }
    async function make(){        
        db.beginTransaction(function(err1){
            console.log(err1);
            if(err1){ throw err1; } 
            db.query("SELECT od.quantity,o.product_name,od.warehouse FROM orderdetail as od INNER JOIN orders as o ON od.order_id=o.id WHERE od.order_id=?",
                [order_id],function(err,result){
                    if(err){
                        db.rollback(function(){
                            throw err;
                        })
                    }
        
                    var orderdetails = JSON.stringify(result);
                    orderdetails=JSON.parse(orderdetails);
            
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
                                throw err;
                            });
                        }
                    });
                    db.query("DELETE FROM orderdetail WHERE order_id=?",[order_id],function(error,result){
                        if(error){
                            db.rollback(function(){
                                throw err;
                            });
                        }
                    })
                    db.query("UPDATE orders SET status=? WHERE id=?",["Cancelled",order_id],function(error,result){
                        if(error){
                            db.rollback(function(){
                                throw error;
                            });
                        }
                    })
                    db.commit(function(err){
                        if(err){
                            throw err;
                        }
                    });
            });
        });
        res.status(200).json({message:"Order Cancelled successfully added"});
    };
    validate(make);
}

exports.postUpdateStock=(req,res,next)=>{
    console.log("Updating Stock Started....");
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
    console.log("Fetching All products .....");
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
    console.log("Fetching All orders .....");
    db.query("SELECT customer.name as name,orders.product_name as product_name,orders.quantity as quantity,orders.status as status,orders.id as id FROM orders INNER JOIN customer ON orders.customer_email=customer.email",function(err,result){
        if(err){
            res.status("404").json({message:"Product Fetching Failed!"});
        }
        else{
            console.log(result);
            result=JSON.stringify(result);
            result=JSON.parse(result);
            res.status(200).json(result);
        }
    })
}