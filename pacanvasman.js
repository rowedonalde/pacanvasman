/*
 * pacanvasman.js
 *
 * Scripting for the Pacanvasman game
 */

//FIXME: I need to modularize all of this into its own lambda

var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var ESC = 27
var FRAMELENGTH = 20; //20ms
var PACSPEED = 2; //1 pixel per frame
var PACRADIUS = 25;
var TURNTHRESHOLD = 5; //How close do you need to be to a grid junction to turn
var GRIDSIZE = 50; //The distance between grid junctions

// Global variables for maintaining game state:
var pacDirection = false,
isMoving = false,
frame = 0,
gameContext,
gameCanvas,
interval,
pacX,
pacY;


/*
 * Start the game:
 */
window.onload = function() {


  gameCanvas = document.getElementById('game');
  gameContext = gameCanvas.getContext('2d');
  
  // Start Pacanvasman facing to the right at the center of the canvas:
  pacX = gameCanvas.width / 2;
  pacY = gameCanvas.height / 2;
  drawPac(gameContext, pacX, pacY, 'right'); //if it's literally right, then pac doesn't
                                             //move until you hit an arrow
  
  /*
   * Handle keypresses:
   */
  
  window.onkeydown = function(event) {
    var keyCode = event.keyCode;
    
    switch (keyCode) {
      case LEFT:
        pacDirection = 'left';
        handleTurn();
        break;
      case RIGHT:
        pacDirection = 'right';
        handleTurn();
        break;
      case UP:
        pacDirection = 'up';
        handleTurn()
        break;
      case DOWN:
        pacDirection = 'down';
        handleTurn();
        break;
      case ESC:
        // Freeze to death
        clearInterval(interval);
        break;
      default:
        break;
    }
  };
  
  // Advance to the next frame:
  interval = window.setInterval(nextFrame, FRAMELENGTH);
  
};



/*
 * Resolve the gamestate for each frame:
 */
var nextFrame = function() {
  if (isMoving) {
    // Update pacanvasman coordinates if he can move:
    switch (pacDirection) {
      case 'left':
        pacX -= PACSPEED;
        break;
      case 'right':
        pacX += PACSPEED;
        break;
      case 'up':
        pacY -= PACSPEED;
        break;
      case 'down':
        pacY += PACSPEED;
        break;
      default:
        break;
    }
  }
  
  // Handle edge warps:
  while (pacX < 0) {
    pacX += gameCanvas.width;
  }
  while (pacY < 0) {
    pacY += gameCanvas.height;
  }
  pacX = pacX % gameCanvas.width;
  pacY = pacY % gameCanvas.height;

  // Clear before drawing:
  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  drawPac(gameContext, pacX, pacY, pacDirection);
  
  //console.log('next frame');
};


/*
 * Render the Pacanvasman character
 */
var drawPac = function(context, x, y, facing) {
  // Draw circle for body:
  context.fillStyle = 'yellow';
  var bodyRadius = PACRADIUS;
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


/*
 * When Pacanvasman wants to turn, determine whether he's close enough to the
 * movement grid junction. If he's close enough after turning, re-center him 
 * on the track and check to see whether there's a wall (TODO). If he's not
 * close enough to the junction, make him stop.
 */
var handleTurn = function() {
  // Distance since the last corner, will be dx or dy:
  var distanceSinceCorner;
  
  // Handle horizontal:
  if (pacDirection === 'left' || pacDirection === 'right') {
    distanceSinceCorner = pacY % GRIDSIZE;
    //console.log(distanceSinceCorner);
    
    // If you're slightly ahead of the corner:
    // TODO: These should also check for walls once I get those going
    if (distanceSinceCorner <= TURNTHRESHOLD) {
      // ...jump back to the last junction and make the turn:
      // (Note that if you're already on a horizontal track, this is
      // equivalent to staying on that track.)
      pacY -= distanceSinceCorner;
      isMoving = true;
    } else if (GRIDSIZE - distanceSinceCorner <= TURNTHRESHOLD) {
      // If you're slightly behind the next corner:
      pacY += GRIDSIZE - distanceSinceCorner;
      isMoving = true;
    } else {
      // If you're too far from either corner, just stop dead:
      isMoving = false;
    }
  } else {
    //Handle vertical:
    distanceSinceCorner = pacX % GRIDSIZE;
    //console.log(distanceSinceCorner);
    
    // If you're slightly ahead of the corner:
    // TODO: These should also check for walls once I get those going
    if (distanceSinceCorner <= TURNTHRESHOLD) {
      // ...jump back to the last junction and make the turn:
      // (Note that if you're already on a horizontal track, this is
      // equivalent to staying on that track.)
      pacX -= distanceSinceCorner;
      isMoving = true;
    } else if (GRIDSIZE - distanceSinceCorner <= TURNTHRESHOLD) {
      // If you're slightly behind the next corner:
      pacX += GRIDSIZE - distanceSinceCorner;
      isMoving = true;
    } else {
      // If you're too far from either corner, just stop dead:
      isMoving = false;
    }
  }
};