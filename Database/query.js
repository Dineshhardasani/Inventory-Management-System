const query=`
DROP TABLE IF EXISTS orderdetail;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS customer;
CREATE TABLE IF NOT EXISTS product (
    warehouse varchar(256),
    name varchar(256),
    stock int(11) NOT NULL,
    INDEX warehouse (warehouse),
    PRIMARY KEY (name,warehouse)
);
CREATE TABLE IF NOT EXISTS customer (
    email varchar(256) NOT NULL,
    name varchar(256) NOT NULL,
    age int(11) NOT NULL,
    PRIMARY KEY (email)
);
CREATE TABLE IF NOT EXISTS orders (
    id int(11) NOT NULL AUTO_INCREMENT,
    customer_email varchar(256) NOT NULL,
    product_name varchar(256),
    quantity int(11) NOT NULL,
    status varchar(256) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_email) REFERENCES customer(email),
    CONSTRAINT FK1 FOREIGN KEY (product_name) REFERENCES product(name)
    ON DELETE CASCADE 
);
CREATE TABLE IF NOT EXISTS orderdetail (
    order_id int(11),
    warehouse varchar(256),
    quantity int(11) NOT NULL,
    PRIMARY KEY (order_id,warehouse),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse) REFERENCES product(warehouse) ON DELETE CASCADE
)`;
    
module.exports=query;