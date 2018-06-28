const TRRTokenContract = artifacts.require('./tokens/TRRToken.sol');

module.exports = function(deployer) {
  deployer.deploy(TRRTokenContract, 'TRRToken', 'TRR');
};
