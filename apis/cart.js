
var r = require("../utils/runtime");
var _ = require("lodash");

/*********
* Add items to cart code
*********/
function addtocartHandler(req,res){

	try {
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse the input!"
		});
	}

	var userId = req.body.userId;
	var bookId = req.body.bookId;
	var quantity = req.body.quantity;

	if(userId && bookId && quantity) {
		r.getRuntimeKey("db").mongo.cart.find ({"userId" : { $eq: userId}}).toArray(function(err,results) {
			if(err) {
				res.sendJson(500, {
					code: 500,
					message : "Invalid User ID"
				});
			} else {
				if(results.length == 0) {
					var obj = {
						userId,
						cart: []
					};

					var item = {
						bookId,
						quantity
					};

					obj.cart.push(item);

					r.getRuntimeKey("db").mongo.cart.insert(obj, function(err,resu) {
						if (err) {
							res.sendJson(500, {
								code: 500,
								message : "Failed to add book in the cart."
							});
						} else {
							res.sendJson(200, {
								code: 200,
								message: "Book added succssfully in the cart."
							});
						}
					});
				} else {

					// user found, append the item in the cart
					var flag = true;

					for (var i = 0; i < results[0].cart.length; i++) {
						var item = results[0].cart[i];
						if (item.bookId == bookId) {
							flag = false;
							item.quantity += quantity;
						}
					}

					if(flag) {
						var item1 = {
							bookId,
							quantity
						};
						results[0].cart.push(item1);
					}

					r.getRuntimeKey("db").mongo.cart.updateOne({ "userId" : userId},
					{
						$set: {
							"cart": results[0].cart
						}
					}, function(err1, resu1) {
						if(err1){
							res.sendJson(500, {
								code: 500,
								message : "Failed to add book in the cart."
							});
						} else {
							res.sendJson(200, {
								code: 200,
								message : "Book added succssfully in the cart."
							});
						}
					});

				}
			}
		});


	} else {
		res.sendJson (400, {
			code: 400,
			message: "Please enter the details correctly!"
		})
	}
}


/*********
* View the cart code
*********/

function getCartHandler(req,res) {
	try{
		req.body = JSON.parse(req.body);
	} catch(e) {
		res.sendJson(400, {
			code:400,
			message: "Failed to parse the input"
		});
	}

	var userId = req.body.userId;

	if(userId) {
		r.getRuntimeKey("db").mongo.cart.find({"userId" : {$eq : userId}}).toArray(function(err,results) {
			if(err) {
				res.sendJson(400, {
					code: 400,
					message: "Invalid user ID"
				});
			} else {
				//delete results[0]._id;
				//delete results[0].userId;
				res.sendJson(200, {
					code: 200,
					message: "Cart Details displayed successfully",
					data: results[0].cart
				});
			}
		});
	} else {
		res.sendJson(400, {
			code: 400,
			message : "Please provide a valid input"
		});
	}
}



/*********
* Remove items from the cart Code
*********/

function removefromCartHandler(req,res) {

	try {
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse the input!"
		});
	}

	var userId = req.body.userId;
	var bookId = req.body.bookId;

	//console.log(userId, bookId);

	if(userId && bookId) {
		r.getRuntimeKey("db").mongo.cart.find({"userId" : {$eq: userId}}).toArray(function(err, results) {
			//check if the user has any items added in the cart collection
			if(err || results.length == 0) {
				res.sendJson(500, {
					code: 500,
					message: "Invalid user ID"
				});
			} else {
				var arr = results[0].cart;
				var len = arr.length;
				_.remove(arr, function(o) {
					return o.bookId === bookId;
				});

				if(arr.length === len) {
					// no element was removed
					res.sendJson(400, {
						code: 400,
						message: "Book can't be removed since it's not in the cart"
					});
				} else {
					// update the db
					r.getRuntime().db.mongo.cart.updateOne({ "userId" : userId},
					{
						$set: {
							"cart": arr
						}
					}, function(err1, resu1) {
						if(err1){
							res.sendJson(500, {
								code: 500,
								message : "Failed to remove book from the cart."
							});
						} else {
							res.sendJson(200, {
								code: 200,
								message : "Book removed successfully from the cart."
							});
						}
					});
				}
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
	addToCart: addtocartHandler,
	getCart: getCartHandler,
	removeFromCart: removefromCartHandler
}
