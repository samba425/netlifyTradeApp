const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
const request = require('request-promise').defaults({ strictSSL: false });
var cors = require('cors');
app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get("/", (req, res) => {
    res.send("App is running..");
});
 

async function fetchTradeData(indexType) {
	let query = []
	if (indexType && indexType['index']) {
		query = [
			{
				"type": "index",
				"values": [
					`NSE:${indexType['index']}`
				]
			}

		]
	}
	var reqObj = {
		'method': 'POST',
		'json': true,
		'url': 'https://scanner.tradingview.com/india/scan',
		'body': {
			"filter": [
				{
					"left": "exchange",
					"operation": "equal",
					"right": "NSE"
				},
				{
					"left": "is_primary",
					"operation": "equal",
					"right": true
				},
				{
					"left": "active_symbol",
					"operation": "equal",
					"right": true
				}
			],
			"options": {
				"lang": "en"
			},
			"markets": [
				"india"
			],
			"symbols": {
				"query": {
					"types": []
				},
				"tickers": [],
				"groups": query
			},
			"columns": [
				"name",
				"open",
				"high",
				"low",
				"close",
				"change",
				"change_abs",
				"volume",
				"Value.Traded",
				"change_from_open",
				"change_from_open_abs",
				"SMA20",
				"SMA20|5",
				"SMA50|5",
				"SMA200",
				"average_volume_10d_calc",
				"average_volume_30d_calc",
				"VWAP",
				"sector",
				"change_abs|5",
				"change|5"
			],
			"sort": {
				"sortBy": "close",
				"sortOrder": "desc"
			},
			"price_conversion": {
				"to_symbol": false
			},
			"range": [
				0, 6500
			]
		}
	}
	if (indexType && indexType['sector']) {
		reqObj['body']['filter'].push(
			{
				"left": "sector",
				"operation": "in_range",
				"right": [indexType['sector']]
			})
	}

 
	let result = await request(reqObj); 
	return result
}
app.get('/getData', async (req, res) => {
	// res.send('hello...')
	console.log('-req.query', req.query, req.params)
	let result = await fetchTradeData(req.query);
	res.send(result)
})

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);