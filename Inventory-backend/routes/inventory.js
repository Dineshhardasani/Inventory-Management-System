const path=require('path');
const express=require('express');
const inventoryController=require('../controllers/inventory');
const router=express.Router();

router.post('/add/product',inventoryController.postAddProduct);

router.post('/update/stock',inventoryController.postUpdateStock);

router.post('/add/customer',inventoryController.postAddCustomer);

router.post('/book/order',inventoryController.postBookOrder);

router.post('/cancel/order',inventoryController.postCancelOrder);

router.get('/view/product',inventoryController.getProducts);

router.get('/view/orders',inventoryController.getOrders);

module.exports=router;