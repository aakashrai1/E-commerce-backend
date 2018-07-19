var r = require ("../utils/runtime");

function profileHandler(req, res) {
	try{
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse input!"
		});
	}

	var userId = req.body.userId;

	if(userId) {
		r.getRuntimeKey("db").mongo.users.find({ "userId" : { $eq : userId } }).toArray(function(err,item) {
			if(err || item.length == 0) {
				res.sendJson(400,{
					code: 400,
					message: "Invalid UserID"
				});
			} else {
				delete item[0].password;
				delete item[0]._id;
				res.sendJson(200, {
					code: 200,
					message: "Valid User!",
					data : item[0]
				});
			}
		})
	} else {
		res.sendJson(400, {
			code: 400,
			message: "Please provide valid input"
		});
	}

}

function editProfileHandler(req,res) {
	try {
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse input!"
		});
	}

	var userId = req.body.userId;

	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var zipcode = req.body.zipcode;
	var phone = req.body.phone;


	if(userId && firstName && lastName && address && city && state && zipcode && phone) {
		r.getRuntimeKey("db").mongo.users.find({"userId" : {$eq: userId}}).toArray(function(err,results) {
			if(err || results.length == 0) {
				res.sendJson(400, {
					code: 400,
					message: "User ID does not exist"
				});
			} else {
				r.getRuntimeKey("db").mongo.users.updateOne({"userId" : userId} , { $set: {
					"firstName" : firstName,
					"lastName" : lastName,
					"address" : address,
					"city" : city,
					"state" : state,
					"zipcode": zipcode,
					"phone" : phone
				}}, function(err, result) {
					if(err) {
						res.sendJson(500, {
							code: 500,
							message: "Unable to update the profile"
						});
					} else {
						res.sendJson(200, {
							code: 200,
							message:"Profile updated successfully."
						});
					}
				});
			}
		})
	} else {
		res.sendJson(400, {
			code: 400,
			message: "Please provide a valid input"
		});
	}

}


module.exports = {
	profile : profileHandler,
	editProfile : editProfileHandler
}
