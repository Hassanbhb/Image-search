const request = require('request');
const mongoose = require('mongoose');
const search_term = require('../models/searchModel.js');
mongoose.Promise = global.Promise;


const key = process.env.KEY;
const id = process.env.ID;
const db = process.env.DB_URI;

mongoose.connect(db);

//connecting to db
mongoose.connection.once('open', function(){
	console.log('Connection to database success');
}).on('error', function(error){
	console.log(error);
});

module.exports = function(app){
	//home page rout
	const path = process.cwd();
	app.get('/', function(req, res){
		res.sendFile(path +"/public/home.html");
	})

	//returns search results
	app.get('/api/:search', function(req, res){
		const searchTerm = req.params.search;
		const offset = req.query.offset;
		//save the searchTerm in the db
		const term = new search_term({
			search_term: req.params.search,
			date: getDate()
		});
		term.save(function(err, data){
			if (err) {return err.message};
		});
		//add the search term and offset or default offset=10
		let url = "";
		if (offset) {
			url = "https://www.googleapis.com/customsearch/v1?key="+key+"&cx="+id+"&searchType=image&q="+searchTerm+"&start="+offset;
		}else{
			url = "https://www.googleapis.com/customsearch/v1?key="+key+"&cx="+id+"&searchType=image&q="+searchTerm+"&start=10";
		}
		
		const requestObject = {
			uri: url,
			method: 'GET',
			timeout: 10000
		};
		let array = [];
		//request the url and return the results
		request(requestObject, function(err, response, body){
			if (err) {return console.log(err.message)};
			
			const result = JSON.parse(body);
			const imageList = result.items;
			//creating a json format for the results
			for (var i = 0; i < imageList.length; i++) {
				let image = {
					"url": imageList[i].link,
					"snippet": imageList[i].snippet,
					"thumbnail": imageList[i].image.thumbnailLink,
					"context": imageList[i].displayLink
				}
				//add each one to an array
				array.push(image);
			};
			//display the array to the user
			res.send(array)
		})
		
	});
	

	//returns search history
	app.get('/api/latest/imagesearch', function(req, res){
		//search for all terms in db
		const termsArray = [];
		search_term.find(function(err, terms){
			if (err) {return console.log(err)};
			terms.forEach(function print(term, i, a){
				const latestTerm = {
					"latest": term.search_term,
					"date": term.date
				};
				//push every term in the array
				termsArray.push(latestTerm);
				//when it reaches 10 
				if (termsArray.length === 10) {
					//display them
					res.send(termsArray);
				}
			})
		//query to display the newest 10 searches	
		}).sort({_id:-1}).limit(10);
	});
}
//return the date at the moment
function getDate(){
	const d = new Date();
	const n = d.toUTCString();
	return n;
}