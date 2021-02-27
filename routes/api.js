'use strict';
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
module.exports = function (app) {
mongoose.connect(process.env.DB,{ useNewUrlParser: true, 
useUnifiedTopology: true,
useFindAndModify: false })
  
  let stockSchema = new mongoose.Schema({
    name: {type: String, required: true},
    likes: {type: Number, default: 0},
    ips: [String]
  });
  let Stock = mongoose.model('Stock', stockSchema);
  app.route('/api/stock-prices')
    .get(function (req, res){
      console.log(req.query)
      let likeStock = (stockName,findOrUpdateData) => {
        Stock.findOne(
          {name: stockName},
          (err,data)=>{
            if(err){
              console.log(error)
            }else if(data && data['ips'] && data['ips'].includes(req.ip) ){
              return res.json('Error: Only 1 Like per IP Allowed')
            }else{
              let updateData = {$inc: {likes: 1}, $push: {ips: req.ip}};
              findOrUpdateData(stockName,updateData,getPrice)
            }
          }
      )};

      let findOrUpdateData = (stockName,updateData,getPrice) => {
        Stock.findOneAndUpdate(
          {name: stockName},
          updateData,
          {new: true, upsert: true},
          (err,data)=>{
            if(err){
              console.log(err)
            }else if(!err && data){
              getPrice(data)
            }
          }
          )
      };

      let getPrice = (data) => {
        let uri = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${data['name']}/quote`;
        fetch(uri)
          .then(response => response.json())
          .then(resData => {
            data['price'] = resData.latestPrice;
            data['symbol'] = resData.symbol;
            processData(data)
          })
          .catch(error => console.log(error.message))
      };

      let stocksArr = [];
      let likesArr = [];
      let processData = (data) => {
        if(singleStock === true){
          return res.json({
            stockData: {
              'stock': data.symbol,
              'price': parseFloat(data.price),
              'likes': data.likes
            }
          })
        }
        if(singleStock === false){
          let stockObj = {
            'stock': data.symbol,
            'price': parseFloat(data.price)
          };
          stocksArr.push(stockObj);
          likesArr.push(data.likes);
          if(stocksArr.length === 2){
            stocksArr[0]['rel_likes'] = likesArr[0] - likesArr[1]
            stocksArr[1]['rel_likes'] = likesArr[1] - likesArr[0]
            return res.json({
              stockData: stocksArr
            })
          }else{return}
        }
      }

      let stockType = typeof req.query.stock;
      let like = req.query.like;
      let singleStock = true;


      if(stockType === 'string'){
        let stockName = req.query.stock;
        if(like){
          likeStock(stockName,findOrUpdateData)
        }else{
          findOrUpdateData(stockName,{},getPrice)
        }
      }

      if(stockType === 'object'){
        singleStock = false
        let stockName1 = req.query.stock[0];
        if(like){
          likeStock(stockName1,findOrUpdateData)
        }else{
          findOrUpdateData(stockName1,{},getPrice)
        }

        let stockName2 = req.query.stock[1];
        if(like){
          likeStock(stockName2,findOrUpdateData)
        }else{
          findOrUpdateData(stockName2,{},getPrice)
        }

      }
    });
    
};
