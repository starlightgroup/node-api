require("babel-register");
var app = require("./server.js");
app.listen(8000, function() {

});
process.title="myserver";
process.on('SIGINT', function() {
	process.exit();
});