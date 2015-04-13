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
  
  if (typeof successCb !== 'function'){
    successCb = false;
  }
  
  if ( typeof errorCb !== 'function'){
    errorCb = false;
  }
  
  this.handlerGroups.push(
    {
      successCb: successCb,
      errorCb: errorCb
    }    
  );

  this.callHandler();
}

$Promise.prototype.catch = function( func ) {
  this.then( null, func );
}

$Promise.prototype.callHandler = function() {
  
  // check if there are success or error handler
  // if yes, run function
  // else do nothing
/*
  if (this.handlerGroups.length > 0){
    if (this.state === 'resolved' || this.state === 'rejected'){
      //var cb = this.handlerGroups.pop();
      var cb = this.handlerGroups.splice(0, 1)[0];
      var data = this.value; 
      if (cb.successCb)
        cb.successCb( data );
      else if (cb.errorCb)
        cb.errorCb( data );
    }
  }
*/
  if (this.handlerGroups.length > 0){
    
    if (this.state === 'resolved' ){
      //var cb = this.handlerGroups.pop();
      var cb = this.handlerGroups.splice(0, 1)[0];
      var data = this.value; 

      if (cb.successCb)
        cb.successCb( data );
    }
    
    if (this.state === 'rejected'){
      var cb = this.handlerGroups.splice(0, 1)[0];
      var data = this.value; 

      if (cb.errorCb)
        cb.errorCb( data );

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
