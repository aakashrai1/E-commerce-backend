var login = require("../apis/login");
var insertBook = require("../apis/insertBooks");
var profile = require("../apis/user");
var books = require("../apis/books");
var cart = require("../apis/cart");
var orders = require("../apis/orders");
var search = require("../apis/search");

module.exports = {
	login,
	insertBook: insertBook,
	user: profile,
	books,
	cart,
	orders,
	search
}
