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
			crawlerTestingId: "Pyt5FfSoGCRRCNtqY",
			crawlerEndpoints: {
				get:"http://api.allevents.nyc/apify/v1/crawlerGet",
				update:"http://api.allevents.nyc/apify/v1/crawlerUpdateExecute"
			},
			crawler: {
				startUrls: [
					{
						key:"",
						value:""
					}
				],
				pageFunction: ""
			},
			scraped: {}
		};
		fetch(this.state.crawlerEndpoints.get+"?_id="+this.state.crawlerTestingId,{
			headers: {
				"Accept": "application/json, text/plain, */*",
				"Content-Type": "application/json"
			}
		})
		.then((response)=>{
			response.json().then((data)=>{
					// view
					this.setState({crawler: data.body});
			});
		});
	}
	updateExecuteCrawler=()=>{
		var crawler = {
			crawler: {
				startUrls: this.state.crawler.startUrls,
				pageFunction: this.state.crawler.pageFunction
			}
		};
		// initiate crawl
		fetch(this.state.crawlerEndpoints.update,
		{
			method: "post",
			headers: {
				"Accept": "application/json, text/plain, */*",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(crawler)
		})
		.then((response)=>{
			response.json().then((data)=>{
				// get crawl data
				var resultsInterval = setInterval(()=>{
					console.log("interval "+data.body.resultsUrl+"...");
					fetch(data.body.resultsUrl,{
						headers: {
							"Accept": "application/json, text/plain, */*",
							"Content-Type": "application/json"
						}
					})
					.then((response)=>{
						response.json().then((data)=>{
							if (resultsInterval && data[0] && data[0].pageFunctionResult) {
								// view
								this.setState({scraped:data[0].pageFunctionResult});
								console.log("new results:",data[0]);
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
			console.log("fetch error!",error);
		});
	}
	updatePageFunctionCodeMirror=(newCode)=>{
		var newCrawler = this.state.crawler;
		newCrawler.pageFunction = newCode;
		this.setState({
			crawler: newCrawler
		});
	}
	updatePageFunction=(event)=>{
		console.log("newPageFunction",event.target.value);
		var newCrawler = this.state.crawler;
		newCrawler.pageFunction = event.target.value;
		this.setState({
			crawler: newCrawler
		});
	}
	updateUrl=(event)=>{
		console.log("newUrl",event.target.value);
		var newCrawler = this.state.crawler;
		newCrawler.startUrls[0].value = event.target.value;
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
		return (
			<div>
				<div>
					<input value={this.state.crawler.startUrls[0].value} onChange={this.updateUrl} type="text" />
					<p><b>{this.state.crawler.pageFunction}</b></p>
					<CodeMirror  key={this.state.crawler.pageFunction} value={this.state.crawler.pageFunction} onChange={this.updatePageFunctionCodeMirror} options={{lineNumbers:true}} />
					<button type="button" onClick={this.updateExecuteCrawler}>Crawl</button>
				</div>
				<div>
					{this.state.scraped.title}
					{this.renderResults()}
				</div>
			</div>
		);
	}
}

export default App;
