var r = require("../utils/runtime");

function getBookHandler(req, res) {
	try{
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(500, {
			code: 500,
			message: "Failed to parse the input!"
		});
		return;
	}

	var bookId = req.body.bookId;

	if(bookId) {
		r.getRuntimeKey("db").mongo.books.find({ "bookId" : {$eq: bookId}}).toArray(function(err, item){
			if(err || item.length == 0) {
				res.sendJson(400, {
					code: 400,
					message: "Invalid bookId!"
				});
			} else {
				delete item[0].bookId;
				delete item[0]._id;
				res.sendJson(200,{
					code: 200,
					message: "Valid Book!",
					data: item[0]
				});
			}
		});
	} else {
		res.sendJson(400, {
			code: 400,
			message: "Please provide valid input!"
		});
	}
}


module.exports = {
	getBook: getBookHandler
}