var r = require("../utils/runtime");
var uuidv4 = require("uuid/v4");


function checkoutHandler(req, res) {
	try {
		req.body = JSON.parse(req.body);
	} catch(e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse input!"
		});
	}

	var userId = req.body.userId;
	if (userId) {
		r.getRuntimeKey("db").mongo.cart.find({ "userId" : { $eq : userId }}).toArray(function(err, result) {
			if (err || result.length == 0) {
				res.sendJson(400, {
					code: 400,
					message: "User not found"
				}); 
			} else {
				var respObj = {
					code: 200,
					userId,
					totalPrice: 0,
					data: []
				}

				var bookIdarr = [];
				var bookJson = {};
				for(var i = 0; i < result[0].cart.length; i++) {
					bookIdarr.push(result[0].cart[i].bookId);
					bookJson[result[0].cart[i].bookId] = result[0].cart[i].quantity;
				}

				r.getRuntimeKey("db").mongo.books.find({"bookId" : {$in : bookIdarr}}).toArray(function(err1, bookResults) {
					if(err1) {
						res.sendJson(500, {
							code: 500,
							message: "Error occured, please try again later"
						}); 
					} else {
						for(var i = 0; i < bookResults.length; i++) {
							
							var obj = {
								bookId: bookResults[i].bookId,
								price: parseInt(bookResults[i].bookCost),
								name: bookResults[i].bookName,
								quantity: bookJson[bookResults[i].bookId],
								delivery: 5
							}
							respObj.totalPrice += obj.price * obj.quantity;
							respObj.data.push(obj);
						}
						res.sendJson(200, respObj);
					}
				});
			}
		});
	} else {
		res.sendJson(400, {
			code: 400,
			message: "Please provide valid input" 
		});
	}
}

function placeOrderHandler (req,res) {
	try {
		req.body = JSON.parse(req.body);
	} catch(e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse input!"
		});
	}

	var userId = req.body.userId;
	var totalPrice = req.body.totalPrice;
	var cartData = req.body.data;
	var payment = req.body.payment;

	if (userId && totalPrice && cartData.length != 0 && payment){
		var orderId = uuidv4();
		var doc = {
			orderId,
			userId,
			totalPrice,
			data: cartData,
			payment,
			status: "Confirmed"
		};

		r.getRuntimeKey("db").mongo.cart.deleteOne({ "userId" :  {$eq: userId} }, function(err1, res1) {
			if(err1) {
				res.sendJson(500, {
					"code": 500,
					"message": "Error occured. Order could not be placed"
				});
			} else {
				r.getRuntimeKey("db").mongo.orders.insert(doc, function(err, result) {
					if(err) {
						res.sendJson(500, {
							"code": 500,
							"message": "Error occured. Order could not be placed"
						});
					} else {
						res.sendJson(200,{
							code: 200,
							message: "Order is placed successfully.",
							orderId
						});
						
					}
				});
			}
		});


	} else {
		res.sendJson(400, {
			"code": 400,
			"message": "Please send a valid input"
		});
	}
	
}

function cancelOrderHandler(req,res) {
	try{
		req.body = JSON.parse(req.body);
	} catch(e) {
		res.sendJson(400, {
			code: 400,
			message: "Failed to parse the input"
		});
	} 

	var userId=req.body.userId;
	var orderId = req.body.orderId;

	if(userId && orderId) {
		r.getRuntimeKey("db").mongo.orders.find({"orderId" : {$eq: orderId}}).toArray(function(err2, res2) {
			//console.log(err2, res2);
			if(err2 || res2.length == 0) {
				res.sendJson(500, {
					code: 500,
					message: "Failed to cancel the order"
				});
			} else {
				r.getRuntimeKey("db").mongo.orders.updateOne({"orderId" : orderId}, 
				{
					$set : {
						status: "Cancelled"
					}
				}, function(err3, res3) {
					if(err3) {
						res.sendJson(500, {
							code: 500,
							message:"Failed to cancel the order"
						});
					} else {
						res.sendJson(200, {
							code: 200,
							message: "Order cancelled successfully"
						});
					}
				});
			}
		});
	} else {
		res.sendJson(400, {
			code: 400,
			message: "Please provide the correct input"
		});
	}
}

function viewOrderHandler(req,res) {
	try {
		req.body = JSON.parse(req.body);
	} catch(e) {
		res.sendJson(400, {
			code: 400,
			message: "Failed to parse the input"
		});
	}

	var userId = req.body.userId;

	if(userId) {
		r.getRuntimeKey("db").mongo.orders.find({"userId" : {$eq: userId}}).toArray(function(err, resp) {
			if(err) {
				res.sendJson(500, {
					code: 500,
					message: "Failed to parse the input"
				});
			} else {
				var respObject = {
					code : 200,
					userId,
					orders: []

				}
				for(var i = 0; i < resp.length; i++) {
					var temp = resp[i];
					delete temp._id;
					delete temp.userId;
					respObject.orders.push(temp);
				}
				res.sendJson(200, respObject);
			}
		});
	} else {
		res.sendJson(400, {
			code: 400,
			message: "Please provide a valid input"
		});
	}
}

module.exports = {
	checkout: checkoutHandler,
	placeOrder: placeOrderHandler,
	cancelOrder: cancelOrderHandler,
	viewOrder: viewOrderHandler
}