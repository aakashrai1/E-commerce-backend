var r = require("../utils/runtime");
const uuid = require("uuid/v4");


function bookHandler(req, res) {

	try{
		req.body = JSON.parse(req.body);
	} catch (e) {
		res.sendJson(400, {
			code: 400,
			message: "Failed to parse the input!"
		});
		return;
	}

    var bookId = uuid();
    var bookName = req.body.bookName;
    var bookCost = req.body.bookCost;
    var bookAuthor = req.body.bookAuthor;
    var bookISBN = req.body.bookISBN;
    var bookImage = req.body.bookImage;
    var bookCategory = req.body.bookCategory
    var bookDescription = req.body.bookDescription;

    //console.log(bookId,bookName, bookCost, bookAuthor, bookISBN, bookImage, bookCategory, bookDescription);

    var doc = {
        bookId,
        bookName,
        bookCost,
        bookAuthor,
        bookISBN,
        bookImage,
        bookCategory,
        bookDescription
    }

    if (bookId && bookName && bookCost && bookAuthor && bookISBN && bookImage && bookCategory && bookDescription) {
        r.getRuntimeKey("db").mongo.books.find({ "bookISBN": { $eq: bookISBN } }).toArray(function(err, items) {
			if (items.length != 0 || err) {
                res.sendJson(400, {
                    code: 400,
                    message: "Book already exists!"
                });
            } else {
                r.getRuntimeKey("db").mongo.books.insert(doc, function(err, result) {
                    if (err) {
                        res.sendJson(400, {
                            code: 400,
                            message: "Failed to add the book! Please try again!"
                        });
                    } else {
                        res.sendJson(200, {
                            code: 200,
                            message: "Book added successfully!"
                        });
                    }
                })
            }
        });
    } else {
        res.sendJson(400, {
            code: 400,
            message: "Please provide complete book details."
        });
    }

}

module.exports = {
    insertBooks: bookHandler
}
