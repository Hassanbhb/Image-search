const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const termSchema = new Schema({
	search_term: String,
	date: String
});

const SearchTerm = mongoose.model('searchTerm', termSchema);

module.exports = SearchTerm;