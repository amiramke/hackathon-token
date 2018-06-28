App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('../TRRToken.json', function(data) {
      var ABIArtifact = data;
      App.contracts.TRRToken = TruffleContract(ABIArtifact);
    
      // Set the provider for our contract
      App.contracts.TRRToken.setProvider(App.web3Provider);
    
      return App.showTokens();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', 'button#mint-button', App.mint);

    $(document).on('click', 'button#buy-button', App.buy);
    $(document).on('click', 'button#preview-button', App.preview);
  },

  showTokens: function(adopters, account) {;
    App.contracts.TRRToken.deployed().then(function(instance) {
      App.tokenInstance = instance;

      var symbol = App.tokenInstance.symbol()
      web3.eth.getAccounts(function(err,res) { 
        accounts = res; 
        console.log(accounts)
        
        App.trr = accounts[0];
        App.consignor = accounts[1];
        App.buyer = accounts[2];
      });

      return App.tokenInstance.name()
    }).then(function(name){
      console.log(name)
      $('#title').text(name)
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  preview: function(event) {
    event.preventDefault();
    var id = $("#buy-id")[0].value
    App.displayUrl(id);
  },

  mint: function(event) {
    event.preventDefault()
    var id = $("#mint-id")[0].value
    var price = $("#mint-price")[0].value
    var url = $("#mint-url")[0].value
    url = "{url: " + url + "}"
    console.log(url)

    App.tokenInstance.mint(App.consignor, id, {from: App.trr})
    .then(function(res){
      return App.tokenInstance.setTokenPrice(id, web3._extend.utils.toWei(price, 'ether'), { from: App.trr });
    }).then(function(res){
      return App.tokenInstance.setData(id, url, { from: App.trr, gas: 300000 });
    }).then(function(_meh){
      App.displayUrl(id)
      App.refreshTokenCounts()
    })   
  },

  refreshTokenCounts: function() {
    App.tokenInstance.balanceOf(App.consignor)
      .then(function(data){
        $("#consignor-address").text(App.consignor)
        $("#consignor-token-count").text(data.toString())
      })

    App.tokenInstance.balanceOf(App.buyer)
    .then(function(data){
      $("#buyer-address").text(App.buyer)
      $("#buyer-token-count").text(data.toString())
    })
  },

  buy: function(event) {
    event.preventDefault();

    var id = $("#buy-id")[0].value
    var price = $("#buy-price")[0].value

    App.tokenInstance.buy(id, {from: App.buyer, value: web3._extend.utils.toWei(price, 'ether'), gas: 300000})
    .then(function(_meh){
      App.displayUrl(id)
      App.refreshTokenCounts()
    });
  },

  displayUrl: function(id) {
    App.tokenInstance.getData(id).then(function(data) {
      $("#preview-spot").text(data);
    }).catch(function(err) {
      $("#preview-spot").text("Product ID Not Found");
  });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
