var r = require("../utils/runtime");
const uuid = require("uuid/v4");
var bcrypt = require("bcrypt-nodejs");

/*********
* Registration Code
*********/

function registrationHandler(req, res) {
	//console.log(typeof req.body);
	try {
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse input"
		});
		return;
	}

	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var zipcode = req.body.zipcode;
	var phone = req.body.phone;
	var email = req.body.email;
	var password = req.body.password;
	var role = req.body.role;

	if (firstName && lastName && address && city && state && zipcode && phone && email && password && role) {
		// all data receieved

		// check whether user exists

		r.getRuntimeKey("db").mongo.users.find({ "email" : { $eq: email} }).toArray(function(err, items) {
			if (items.length != 0 || err) {
				res.sendJson(400, {
					code: 400,
					message: "User already exists!"
				});
			} else {
				// insert into db == new user

				var userId = uuid();
				//hash password
				bcrypt.hash(password, null, null, function(err, hashPwd) {
					if (err) {
						// handle error
						console.log(err, "error occured");
					} else {
						// create a document to insert
						var doc = {
							userId,
							email,
							password: hashPwd,
							firstName,
							lastName,
							address,
							city,
							state,
							zipcode,
							phone,
							role
						};

						// insert into collection
						r.getRuntimeKey("db").mongo.users.insert(doc, function(err, result) {
							if (err) {
								res.sendJson(500, {
									code: 500,
									message: "Registration failed, Please try again."
								});
							} else {
								res.sendJson(200, {
									code: 200,
									message: "Successfully registered!"
								});
							}
						});
					}
				});

			}
		});

	} else {
		res.sendJson(400, {
			code: 400,
			message: "Input value missing! Please enter all the details."
		});
	}

}

/***********
* Login Code
***********/

function loginHandler(req, res) {
	//console.log(req.body);
	try {
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse Input!"
		});
		return;
	}

	var email = req.body.email;
	var password = req.body.password;

	if(email && password) {
		// get the user from users collection

		r.getRuntimeKey("db").mongo.users.find({"email" : {$eq : email} }).toArray(function(err,item){
			if(err || item.length == 0){
				res.sendJson(400,{
					code:400,
					message:"Invalid Credentials!"
				});
			} else {

				bcrypt.compare(password, item[0].password, function(err, resp) {

					if (resp) {
						delete item[0].password;
						delete item[0]._id;
						res.sendJson(200, {
							code: 200,
							message: "Successfully logged in",
							data : item[0]
						});
					} else {
						res.sendJson(400,{
							code:400,
							message:"Invalid Credentials!"
						});
					}
				})
			}
		});

		// if not found found, then return response that invalid creds
		// if found, use bcryot compare sync method to check whether password matches with the stored password,
		// if not, return creds invalid
		// if matches ,, return user json object

	} else {
		res.sendJson(400,{
			code: 400,
			message: "Input value missing! Please enter all the details."
		});
	}
}


/************
* Logout Code
*************/


function logoutHandler(req, res) {
	res.sendJson(200,
	{code: 200,
	message: "Logout Successfull!"});
}



module.exports = {
	registration: registrationHandler,
	login: loginHandler,
	logout: logoutHandler
}
