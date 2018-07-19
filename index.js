var http = require("http");
var dispatcher1 = require("httpdispatcher");
var route = require("./routes/route");
var dispatcher = new dispatcher1();
var MongoClient = require("mongodb").MongoClient;

const port = process.argv[2] || 7000;
const url = "mongodb://localhost:27017";
const dbName = "ShoppingCart";
var runtime = require("./utils/runtime");

init();

function init() {
	console.log("Starting on port:", port);
	MongoClient.connect(url, function(err, client) {
		console.log("Connected to mongodb");
		var obj = {
			mongo: {
				users: client.db(dbName).collection('users'),
				cart: client.db(dbName).collection('cart'),
				books: client.db(dbName).collection('books'),
				orders: client.db(dbName).collection('orders')
			}
		};
		runtime.setRuntime("db", obj);

	});
}

/*
** Send response in JSON
*/

function sendJson(code, obj) {
	var resp = JSON.stringify(obj);
	this.writeHeader(code, { "Content-Type" : "application/json" });
	console.log(resp, code);
	this.end(resp);
}

function handler(request, response) {
	response.sendJson = sendJson;
	dispatcher.dispatch(request, response);
}

var server = http.createServer(handler);

dispatcher.onPost("/apis/registration", route.login.registration);
dispatcher.onPost("/apis/login", route.login.login);
dispatcher.onPost("/apis/logout", route.login.logout);
dispatcher.onPost("/apis/insertbooks", route.insertBook.insertBooks);
dispatcher.onPost("/apis/getprofile", route.user.profile);
dispatcher.onPost("/apis/editprofile" , route.user.editProfile);
dispatcher.onPost("/apis/getbook", route.books.getBook);
dispatcher.onPost("/apis/addtocart", route.cart.addToCart);
dispatcher.onPost("/apis/getcart", route.cart.getCart);
dispatcher.onPost("/apis/removefromcart", route.cart.removeFromCart);
dispatcher.onPost("/apis/checkout", route.orders.checkout);
dispatcher.onPost("/apis/placeorder", route.orders.placeOrder);
dispatcher.onPost("/apis/cancelorder", route.orders.cancelOrder);
dispatcher.onPost("/apis/vieworder", route.orders.viewOrder);
dispatcher.onPost("/apis/search", route.search.search);

server.listen(port);
