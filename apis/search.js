var r = require("../utils/runtime");
function searchHandler(req,res){
	try {
		req.body = JSON.parse(req.body);
	} catch(e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse the input"
		});
	}

	var qs = req.body.query;
	if(qs) {
		// create indexes in the DB

		/*
			db.books.createIndex({ bookName: "text", bookDescription: "text"})
		*/
		r.getRuntimeKey("db").mongo.books.find({ "$text": {
			"$search": qs
		}}).toArray(function(err, resp) {
			if (err ||  resp.length == 0) {
				res.sendJson(400, {
					code: 400,
					message: "No result found"
				});
			} else {
				var respObj = {
					code: 200,
					data: []
				};

				for (var i = 0; i < resp.length; i++) {
					var temp = resp[i];
					delete temp._id;
					respObj.data.push(temp);
				}

				res.sendJson(200, respObj);
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
	search: searchHandler
}
