/*
 * pacanvasman.js
 *
 * Scripting for the Pacanvasman game
 */

window.onload = (
  function() {
    var gameCanvas = document.getElementById('game');
    var gameContext = gameCanvas.getContext('2d');
    
    drawPac(gameContext, gameCanvas.width / 2, gameCanvas.height / 2);
  }
);

/*
 * Render the Pacanvasman character
 */
var drawPac = function(context, x, y) {
  // Draw circle for body:
  context.fillStyle = 'yellow';
  var bodyRadius = 25;
  // TODO: start and end arc should be determined by frame to depict mouth moving
  var startAngle = Math.PI / 4;
  var endAngle = Math.PI * 1.75;
  var isClockwise = false;
  // Fill the circle:
  context.beginPath();
  context.arc(x, y, bodyRadius, startAngle, endAngle, isClockwise);
  context.lineTo(x, y);
  context.fill();
  
  // Draw the eye:
  context.fillStyle = 'black';
  var eyeRadius = 2;
  startAngle = 0;
  endAngle = Math.PI * 2;
  // Fill the eye:
  context.beginPath();
  context.arc(x, y - bodyRadius / 2, eyeRadius, startAngle, endAngle, isClockwise);
  context.fill();
};