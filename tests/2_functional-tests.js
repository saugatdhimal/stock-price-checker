const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('/api/stock-prices', function() {

    test('Viewing one stock', function(done){
      chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog'})
          .end(function(err,res){
            let stockData = res.body.stockData;
            assert.equal(stockData['stock'],'GOOG')
            assert.isNumber(stockData['price'])
            assert.isNumber(stockData['likes'])
            done()
          })
    });

    test('Viewing one stock and liking it', function(done){
      chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog',like: 'true'})
          .end(function(err,res){
            let stockData = res.body.stockData;
            assert.equal(stockData['stock'],'GOOG')
            assert.isNumber(stockData['price'])
            assert.equal(stockData['likes'],1)
            done()
          })
    });

    test('Viewing the same stock and liking it again', function(done){
      chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog',like: 'true'})
          .end(function(err,res){
            assert.equal(
              res.body,
              'Error: Only 1 Like per IP Allowed'
            )
            done()
          })
    });

    test('Viewing two stocks', function(done){
      chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['aapl','msft']})
          .end(function(err,res){
            let stockData = res.body.stockData;
            assert.isArray(stockData)
            if(stockData[0]['stock'] === 'AAPL'){
            assert.equal(stockData[0]['stock'],'AAPL')
            assert.isNumber(stockData[0]['price'])
            assert.equal(stockData[0]['rel_likes'],0)
            assert.equal(stockData[1]['stock'],'MSFT')
            assert.isNumber(stockData[1]['price'])
            assert.equal(stockData[1]['rel_likes'],0)
            }else{
            assert.equal(stockData[1]['stock'],'AAPL')
            assert.isNumber(stockData[0]['price'])
            assert.equal(stockData[0]['rel_likes'],0)
            assert.equal(stockData[0]['stock'],'MSFT')
            assert.isNumber(stockData[1]['price'])
            assert.equal(stockData[1]['rel_likes'],0)
            }
            done()
          })
    });

    test('Viewing two stocks and liking them', function(done){
      chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['aapl','msft'],like: 'true'})
          .end(function(err,res){
            let stockData = res.body.stockData;
            assert.isArray(stockData)
            if(stockData[0]['stock'] === 'AAPL'){
            assert.equal(stockData[0]['stock'],'AAPL')
            assert.isNumber(stockData[0]['price'])
            assert.equal(stockData[0]['rel_likes'],0)
            assert.equal(stockData[1]['stock'],'MSFT')
            assert.isNumber(stockData[1]['price'])
            assert.equal(stockData[1]['rel_likes'],0)
            }else{
            assert.equal(stockData[1]['stock'],'AAPL')
            assert.isNumber(stockData[0]['price'])
            assert.equal(stockData[0]['rel_likes'],0)
            assert.equal(stockData[0]['stock'],'MSFT')
            assert.isNumber(stockData[1]['price'])
            assert.equal(stockData[1]['rel_likes'],0)
            }
            done()
          })
    });

   



  })
});
