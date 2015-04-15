/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
var $Promise = function() {
  this.state = 'pending';
  this.value = null;
  this.handlerGroups = [];
}

$Promise.prototype.then = function( successCb, errorCb ) {
  
  var self = this;

  this.forwarder = defer();

  if (typeof successCb !== 'function'){
    successCb = false;
  }
  
  if ( typeof errorCb !== 'function'){
    errorCb = false;
  }

  if (arguments.length === 0) {
    this.forwarder.$promise = this;
  }

  this.handlerGroups.push(
    {
      successCb: successCb,
      errorCb: errorCb,
      forwarder: self.forwarder 
    }    
  );

  this.callHandler();

  return this.forwarder.$promise;
}

$Promise.prototype.catch = function( func ) {
  return this.then( null, func );
}

$Promise.prototype.callHandler = function() {
  
  // check if there are success or error handler
  // if yes, run function
  // else do nothing

  if (this.handlerGroups.length > 0){
    
    if (this.state === 'resolved' ){
      //var cb = this.handlerGroups.pop();
      var cb = this.handlerGroups.splice(0, 1)[0];
      var data = this.value; 

      if (cb.successCb) {
        try {
          var successValue = cb.successCb( data );

          if (successValue instanceof $Promise){
            console.log('$Promise');
            this.forwarder.resolve( successValue.value );
          }else{
            this.forwarder.resolve( successValue );
          }
        } catch ( e ){ 
          this.forwarder.reject( 'err' );
          // this.forwarder.$promise.state = 'rejected';
          // this.forwarder.$promise.value = 'err';
        };
      }
        
    }
    
    if (this.state === 'rejected'){
      var cb = this.handlerGroups.splice(0, 1)[0];
      var data = this.value; 

      if (cb.errorCb) {
        try {
          var errorValue = cb.errorCb( data );
          this.forwarder.resolve( errorValue );
          // this.forwarder.$promise.state = 'resolved';
          // this.forwarder.$promise.value = errorValue;
        } catch ( e ) {
          this.forwarder.reject( 'err' );
          // this.forwarder.$promise.state = 'rejected';
          // this.forwarder.$promise.value = 'err';
        }
      }
        

    } 

  }

}

var Deferral = function() {
  
  this.$promise = new $Promise();

}

Deferral.prototype.resolve = function( data ) {
    
  if (this.$promise.state === 'pending'){
    this.$promise.state = 'resolved';
    this.$promise.value = data;
    
    while(this.$promise.handlerGroups.length > 0){
      this.$promise.callHandler();
    }
  }
}

Deferral.prototype.reject = function( err ){
    
  if (this.$promise.state === 'pending'){ 
    this.$promise.state = 'rejected';
    this.$promise.value = err;

    while (this.$promise.handlerGroups.length > 0){
      this.$promise.callHandler();
    }
  }

};

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
