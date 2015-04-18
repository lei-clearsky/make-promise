/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/

var HandlerGroup = function (successCb, errorCb) {
  this.successCb = (typeof successCb === 'function') ? successCb : null;
  this.errorCb = (typeof errorCb === 'function') ? errorCb : null;
  this.forwarder = new Deferral();
} 

var $Promise = function() {
  this.state = 'pending';
  this.value = null;
  this.handlerGroups = [];
}

$Promise.prototype.then = function( successCb, errorCb ) {
  
  var newGroup = new HandlerGroup ( successCb, errorCb );
  this.handlerGroups.push(newGroup);
  if ( this.state !== 'pending' ) this.callHandler();

  return newGroup.forwarder.$promise;
}

$Promise.prototype.catch = function( func ) {
  return this.then( null, func );
}

$Promise.prototype.callHandler = function() {

  var cb, handler, data,  output;
  
  data = this.value;

  while (this.handlerGroups.length) {
    cb = this.handlerGroups.shift();
    handler = (this.state === 'resolved') ? cb.successCb : cb.errorCb;
    
    if (handler) {
      try {
        output = cb( data );

        if (output instanceof $Promise) cb.forwarder.assimilate(output);
        else cb.forwarder.resolve( output );
        
      } catch ( err ){ 
        cb.forwarder.reject( 'err' );
      };
    }
    else if (this.state === 'resolved') cb.forwarder.resolve( data );
    else if (this.state === 'rejected') cb.forwarder.reject( data );
  }

}

var Deferral = function() {
  this.$promise = new $Promise();
}

Deferral.prototype.assimilate = function( returnedPromise ) {
  var forwarder = this;
  returnedPromise.then(
    function(data){ forwarder.resolve(data); };
    function(reason){ forwarder.reject(reason); };    
  );
}

Deferral.prototype.resolve = function( data ) {
  this.settle( 'resolved', data );  
}

Deferral.prototype.reject = function( reason ){
  this.settle( 'rejected', reason );
};

Deferral.prototype.settle = function( state, value ){
  var promise = this.$promise;
  if (promise.state === 'pending'){ 
    promise.state = state;
    promise.value = value;
    promise.callHandler();
  }
}

var defer = function() {
  return new Deferral();
}

/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
