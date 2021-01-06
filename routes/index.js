var express = require('express');
var router = express.Router();
const got = require('got');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.API_KEY;
console.log(apiKey);

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

router.use((req, res, next) => {
	res.locals.imageBaseUrl = imageBaseUrl;
	next();
});
router.use((req, res, next) => {
	res.set({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers':
			'Origin, X-Requested-With, Content-Type, Accept',
		'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
		'Content-Security-Policy': 'default-src *',
		'X-Content-Security-Policy': 'default-src *',
		'X-WebKit-CSP': 'default-src *',
	});
	next();
});

/* GET home page. */
router.get('/', async (req, res, next) => {
	try {
		const response = await got(nowPlayingUrl);
		const data = JSON.parse(response.body);

		res.render('index', { results: data.results });
		// res.json(data.results);
	} catch (error) {
		//=> 'Internal server error ...'
		res.json(JSON.parse(error.response.body).status_message);
	}
});

router.get('/movie/:id', async (req, res, next) => {
	// res.json(req.params.id);
	const movieId = req.params.id;
	const movieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;
	const response = await got(movieUrl);
	const data = JSON.parse(response.body);
	res.render('single-movie', { parsedData: data });
});

router.post('/search', async (req, res, next) => {
	const searchTerm = encodeURI(req.body.movieSearch);
	const cat = req.body.cat;
	const movieUrl = `${apiBaseUrl}/search/${cat}?query=${searchTerm}&api_key=${apiKey}`;

	const response = await got(movieUrl);
	let data = JSON.parse(response.body);
	if (cat === 'person') {
		data.results = data.results[0].known_for;
		console.log(data.results);
	}
	res.render('index', { results: data.results });
});

module.exports = router;
