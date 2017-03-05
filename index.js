const express = require('express');
const search = require('./controllers/controller.js');
const app = express();

//search imgs and search history
search(app);

const port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log('Server running at '+port);
});