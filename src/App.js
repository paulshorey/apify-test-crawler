import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
// import logo from './logo.svg';
import './App.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

class App extends Component {
	constructor(){
		super();
		this.state = {
			crawler: {
				"crawler": {
					"customId": "My_crawler_paulshorey_05",
					"comments": "My testing crawler",
					startUrls: [
						{
						"key": "START",
						"value": "http://paulshorey.com"
						}
					],
					pageFunction: "function(context) { return context.finish({title:document.title,items:[{title:'Hello2',body:'<p>Whatever2</p>'}]});}"
				}
			},
			scraped: {}
		};
		this.testCrawler();
	}
	testCrawler=()=>{
		/*
			POST JSON to API to update crawler and get back response.body.resultsUrl
		*/
		var crawlerApiEndpoint = 'http://api.allevents.nyc/apify/v1/crawler';
		// initiate crawl
		fetch(crawlerApiEndpoint,
		{
			method: 'post',
			headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.crawler)
		})
		.then((response)=>{
			response.json().then((data)=>{
				// get crawl data
				var resultsInterval = setInterval(()=>{
					console.log('interval '+data.body.resultsUrl+'...');
					fetch(data.body.resultsUrl,{
						headers: {
							'Accept': 'application/json, text/plain, */*',
							'Content-Type': 'application/json'
						}
					})
					.then((response)=>{
						response.json().then((data)=>{
							if (resultsInterval && data[0] && data[0].pageFunctionResult) {
								// view
								this.setState({scraped:data[0].pageFunctionResult});
								console.log('new results:',data[0]);
								// cleanup
								clearInterval(resultsInterval);
								resultsInterval = null;
							}
						});
					});
				},1000);

			});
		})
		.catch(function(error) {
			console.log('fetch error!',error);
		});
	}
	updateCode=(newCode)=>{
		var newCrawler = this.state.crawler;
		newCrawler.crawler.pageFunction = newCode;
		this.setState({
			crawler: newCrawler
		});
	}
	renderResults=()=>{
		const ScrapedItems = [];
		if (Array.isArray(this.state.scraped.items)) {
			this.state.scraped.items.forEach(function(result, i){
				ScrapedItems.push(<p key={i}>Item{i}</p>);
			});
		}
		return ScrapedItems;
	}
	render() {
		var options = {
			lineNumbers: true,
		};
		return ([
			<div>
				<CodeMirror value={this.state.crawler.crawler.pageFunction} onChange={this.updateCode} options={options} />
			</div>,
			<div>
				{this.state.scraped.title}
				{this.renderResults()}
			</div>
		]);
	}
}

export default App;
