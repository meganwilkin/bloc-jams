// Write a function named forEach in the utilities.js file. For educational purposes, DO NOT use the built-in
// Array.prototype.forEach function mentioned in the callback resource. The goal is to write your own function

// Use a loop to go through all elements in the points array.
// Execute a callback for each element.


function forEach(array, callback) {
  for(var i = 0; i < array.length; i++) {
    callback(array[i]);
  }
}

//forEach(pointsArray, function(param){
//  console.log(param);
//});