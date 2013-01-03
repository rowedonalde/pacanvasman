/*
 * pacanvasman.js
 *
 * Scripting for the Pacanvasman game
 */

/*
 * Start the game:
 */

window.onload = function() {
  var gameCanvas = document.getElementById('game');
  var gameContext = gameCanvas.getContext('2d');
  
  // Start Pacanvasman facing to the right:
  drawPac(gameContext, gameCanvas.width / 2, gameCanvas.height / 2, 'right');
  
  /*
   * Handle keypresses:
   */
  
  window.onkeydown = function(event) {
    var keyCode = event.keyCode;
    
    // TODO: make this go by actual direction
    //switch (keyCode) {
    //  case 
    //}
    
    // Clear and redraw:
    // TODO: This should change the gamestate for the next frame instead
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawPac(gameContext, gameCanvas.width / 2, gameCanvas.height / 2, 'left');
  };
};






/*
 * Render the Pacanvasman character
 */
var drawPac = function(context, x, y, facing) {
  // Draw circle for body:
  context.fillStyle = 'yellow';
  var bodyRadius = 25;
  // Angle of facial orientation:
  var faceAngle, eyeX, eyeY;
  switch (facing) {
    case 'down':
      faceAngle = Math.PI / 2;
      eyeX = x + bodyRadius / 2;
      eyeY = y;
      break;
    case 'left':
      faceAngle = Math.PI;
      eyeX = x;
      eyeY = y - bodyRadius / 2;
      break;
    case 'up':
      faceAngle = Math.PI * 1.5;
      eyeX = x - bodyRadius / 2;
      eyeY = y;
      break;
    default: //including 'right'
      faceAngle = 0;
      eyeX = x;
      eyeY = y - bodyRadius / 2;
  }
  // TODO: start and end arc should be determined by frame to depict mouth moving
  var startAngle = Math.PI / 4 + faceAngle;
  var endAngle = Math.PI * 1.75 + faceAngle;
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
  context.arc(eyeX, eyeY, eyeRadius, startAngle, endAngle, isClockwise);
  context.fill();
};