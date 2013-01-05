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
var PACSPEED = 2; //2 pixel per frame
var PACRADIUS = 25;
var DOTRADIUS = 5;
var TURNTHRESHOLD = 10; //How close do you need to be to a grid junction to turn
var EATTHRESHOLD = 10; //How close do you need to be to eat something
var GRIDSIZE = 25; //The distance between grid junctions
var WALLTHICKNESS = 5;

// Global variables for maintaining game state:
var pacDirection = false,
isMoving = false,
frame = 0,
gameContext,
gameCanvas,
interval,
pacX,
pacY,
i,
j;

// These are the walls that make the maze. They should built along the same
// tracks that the characters follow. Also, if a wall is built on the
// perimeter, a corresponding wall should be built on the opposite edge.
var walls = [
  //{ startX: 0, startY: 50, endX: 500, endY: 50 },
  //{ startX: 100, startY: 100, endX: 100, endY: 400 },
  //{ startX: 0, startY: 0, endX: 500, endY: 0 }
  // Edge walls:
  { startX: 0, startY: 0, endX: 50, endY: 0 },
  { startX: 100, startY: 0, endX: 400, endY: 0 },
  { startX: 450, startY: 0, endX: 500, endY: 0 },
  
  { startX: 0, startY: 500, endX: 50, endY: 500 },
  { startX: 100, startY: 500, endX: 400, endY: 500 },
  { startX: 450, startY: 500, endX: 500, endY: 500 },
  
  { startX: 0, startY: 0, endX: 0, endY: 50 },
  { startX: 0, startY: 100, endX: 0, endY: 400 },
  { startX: 0, startY: 450, endX: 0, endY: 500 },
  
  { startX: 500, startY: 0, endX: 500, endY: 50 },
  { startX: 500, startY: 100, endX: 500, endY: 400 },
  { startX: 500, startY: 450, endX: 500, endY: 500 },
  
  // Internal walls (gonna keep it simple at first):
  { startX: 0, startY: 50, endX: 50, endY: 50 },
  { startX: 100, startY: 50, endX: 400, endY: 50 },
  { startX: 450, startY: 50, endX: 500, endY: 50 },
  
  { startX: 0, startY: 100, endX: 50, endY: 100 },
  { startX: 100, startY: 100, endX: 400, endY: 100 },
  { startX: 450, startY: 100, endX: 500, endY: 100 },
  
  { startX: 0, startY: 150, endX: 50, endY: 150 },
  { startX: 100, startY: 150, endX: 400, endY: 150 },
  { startX: 450, startY: 150, endX: 500, endY: 150 },
  
  { startX: 0, startY: 200, endX: 50, endY: 200 },
  { startX: 100, startY: 200, endX: 400, endY: 200 },
  { startX: 450, startY: 200, endX: 500, endY: 200 },
  
  { startX: 0, startY: 250, endX: 50, endY: 250 },
  { startX: 100, startY: 250, endX: 400, endY: 250 },
  { startX: 450, startY: 250, endX: 500, endY: 250 },
  
  { startX: 0, startY: 300, endX: 50, endY: 300 },
  { startX: 100, startY: 300, endX: 400, endY: 300 },
  { startX: 450, startY: 300, endX: 500, endY: 300 },
  
  { startX: 0, startY: 350, endX: 50, endY: 350 },
  { startX: 100, startY: 350, endX: 400, endY: 350 },
  { startX: 450, startY: 350, endX: 500, endY: 350 },
  
  { startX: 0, startY: 400, endX: 50, endY: 400 },
  { startX: 100, startY: 400, endX: 400, endY: 400 },
  { startX: 450, startY: 400, endX: 500, endY: 400 },
  
  { startX: 0, startY: 450, endX: 50, endY: 450 },
  { startX: 100, startY: 450, endX: 400, endY: 450 },
  { startX: 450, startY: 450, endX: 500, endY: 450 },
];

// Decide whether each wall is horizontal or vertical:
var horizontalWalls = [];
var verticalWalls = [];
for (i = 0; i < walls.length; i += 1) {
  // If both X coordinates are the same, the wall is vertical:
  if (walls[i].startX === walls[i].endX) {
    verticalWalls.push(walls[i]);
  } else {
    horizontalWalls.push(walls[i]);
  }
}

// These are the dots that pacanvasman eats. For right now, they'll just
// start at every walkable junction (the "odd" ones).
var dots = [];



/*
 * Start the game:
 */
window.onload = function() {


  gameCanvas = document.getElementById('game');
  gameContext = gameCanvas.getContext('2d');
  
  // Spawn the dots:
  for (i = GRIDSIZE; i < gameCanvas.height; i += GRIDSIZE * 2) {
    for (j = GRIDSIZE; j < gameCanvas.width; j += GRIDSIZE * 2) {
      dots.push({x: j, y: i});
    }
  }
  
  // Start Pacanvasman facing to the right near the center of the canvas:
  //pacX = gameCanvas.width / 2;
  //pacY = gameCanvas.height / 2;
  pacX = 250;
  pacY = 225;
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
  if (isMoving && !(hasCollided(pacX, pacY, pacDirection))) {
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
  } else {
    // Even if isMoving was true, if hasCollided is true, we want to
    // make isMoving be false:
    isMoving = false;
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
  
  // Try to eat a dot where pacanvasman ends up:
  //eatDot(25, 25);
  if (eatDot(pacX, pacY)) {
    console.log('nom');
  }
  
  // Clear before drawing:
  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  // Render the background and walls (probably should put this in another layer:
  drawBackground();
  drawWalls();
  
  // Render the dots:
  for (var i = 0; i < dots.length; i += 1) {
    drawDot(gameContext, dots[i]);
  }
  
  drawPac(gameContext, pacX, pacY, pacDirection, isMoving);
};


/*
 * Render the Pacanvasman character
 */
var drawPac = function(context, x, y, facing, isMoving) {
  // Draw circle for body:
  context.fillStyle = 'yellow';
  var bodyRadius = PACRADIUS;
  // Angle of facial orientation:
  var faceAngle, eyeX, eyeY, startAngle, endAngle;
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
  
  if (facing === 'left' || facing === 'right') {
    // We want the range to be [0, PI/4] and the wavelength to be
    // GRIDSIZE*2 pixels:
    if (isMoving) {
      startAngle = faceAngle + Math.PI / 8 * (Math.cos(x * Math.PI / 25) + 1);
      endAngle = 2 * Math.PI + faceAngle - Math.PI / 8 * (Math.cos(x * Math.PI / 25) + 1);
    } else {
      startAngle = faceAngle + Math.PI / 4;
      endAngle = 2 * Math.PI + faceAngle - Math.PI / 4;
    }
  } else {
    if (isMoving) {
      startAngle = faceAngle + Math.PI / 8 * (Math.cos(y * Math.PI / 25) + 1);
      endAngle = 2 * Math.PI + faceAngle - Math.PI / 8 * (Math.cos(y * Math.PI / 25) + 1);
    } else {
      startAngle = faceAngle + Math.PI / 4;
      endAngle = faceAngle - Math.PI / 4;
    }
  }
  
  // Fixes bug where Pacanvasman would disappear when his mouth was closed
  // since startAngle was equal to endAngle according to the sine function:
  if (startAngle === endAngle) {
    startAngle = 0;
    endAngle = Math.PI * 2;
  }
  
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
 * Render a dot
 */
var drawDot = function(context, dot) {
  context.fillStyle = 'orange';
  var startAngle = 0;
  var endAngle = Math.PI * 2;
  context.beginPath();
  context.arc(dot.x, dot.y, DOTRADIUS, startAngle, endAngle, true);
  context.fill();
};


/*
 * Render the background (not including walls)
 */
var drawBackground = function() {
  // Just draw a black rectangle:
  gameContext.fillStyle = 'black';
  gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
};


/*
 * Render the walls
 */
var drawWalls = function() {
  gameContext.strokeStyle = 'dodgerblue';
  
  // The current wall;
  var wall;
  
  // Vertical walls:
  for (var i = 0; i < verticalWalls.length; i += 1) {
    wall = verticalWalls[i];
    
    // Edge walls should be twice as thick:
    if (wall.startX === 0 || wall.startX === gameCanvas.width) {
      gameContext.lineWidth = WALLTHICKNESS * 2;
    } else {
      gameContext.lineWidth = WALLTHICKNESS;
    }
    gameContext.beginPath();
    gameContext.moveTo(wall.startX, wall.startY);
    gameContext.lineTo(wall.endX, wall.endY);
    gameContext.stroke();
  }
  
  // Horizontal walls:
  for (i = 0; i < horizontalWalls.length; i += 1) {
    wall = horizontalWalls[i];
    
    // Edge walls should be twice as thick:
    if (wall.startY === 0 || wall.startY === gameCanvas.width) {
      gameContext.lineWidth = WALLTHICKNESS * 2;
    } else {
      gameContext.lineWidth = WALLTHICKNESS;
    }
    gameContext.beginPath();
    gameContext.moveTo(wall.startX, wall.startY);
    gameContext.lineTo(wall.endX, wall.endY);
    gameContext.stroke();
  }
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
      //isMoving = !(hasCollided(pacX, pacY, pacDirection));
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
      // (Note that if you're already on a vertical track, this is
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


/*
 * Return true if a character is facing close to a wall and needs to stop.
 * Return false if he can keep going.
 * This function assumes that all walls are either horizontal or vertical.
 */
// FIXME: This code is cramped and the formatting is shit
// FIXME: This doesn't work when warping over an edge: pacanvasman just warps
// in over the wall if there's a wall at the edge. Decide whether you want to
// handle this case or only validate walls that have a corresponding wall on
// the opposite edge (probably the latter).
var hasCollided = function(x, y, facing) {
  
  if (facing === 'left') {
    // Look for vertical walls to the left of the character and that are within
    // the minimum distance:
    for (var i = 0; i < verticalWalls.length; i += 1) {
      if (verticalWalls[i].startX < x
      && x - verticalWalls[i].startX <= GRIDSIZE
      && y <= Math.max(verticalWalls[i].startY, verticalWalls[i].endY)
      && y >= Math.min(verticalWalls[i].startY, verticalWalls[i].endY)) {
        return true;
      }
    }
    // Look for horizontal walls to the left of the character whose right point
    // has the same y-coordinate as the character and is within the minimum
    // distance:
    for (i = 0; i < horizontalWalls.length; i += 1) {
      // The first condition needs to be < and not <= in case the character is
      // adjacent to the wall.
      if (Math.abs(y - horizontalWalls[i].startY) < GRIDSIZE
      && x - Math.max(horizontalWalls[i].startX, horizontalWalls[i].endX) <= GRIDSIZE) {
        return true;
      }
    }
  } else if (facing === 'right') {
    // Vice-versa of above
    for (i = 0; i < verticalWalls.length; i += 1) {
      if (verticalWalls[i].startX > x
      && verticalWalls[i].startX - x <= GRIDSIZE
      && y <= Math.max(verticalWalls[i].startY, verticalWalls[i].endY)
      && y >= Math.min(verticalWalls[i].startY, verticalWalls[i].endY)) {
        return true;
      } 
    }
    for (i = 0; i < horizontalWalls.length; i += 1) {
      if (Math.abs(y - horizontalWalls[i].startY) < GRIDSIZE
      && Math.min(horizontalWalls[i].startX, horizontalWalls[i].endX) - x <= GRIDSIZE) {
        return true;
      }
    }
  } else if (facing === 'up') {
    // Remember that down is positive and up is negative.
    // Look for horizontal walls above the character within the minimum Y
    // distance and whose right and left X values the character is in between:
    for (i = 0; i < horizontalWalls.length; i += 1) {
      if (horizontalWalls[i].startY < y
      && y - horizontalWalls[i].startY <= GRIDSIZE
      && x <= Math.max(horizontalWalls[i].startX, horizontalWalls[i].endX)
      && x >= Math.min(horizontalWalls[i].startX, horizontalWalls[i].endX)) {
        return true;
      }
    }
    for (i = 0; i < verticalWalls.length; i += 1) {
      if (Math.abs(x - verticalWalls[i].startX) < GRIDSIZE
      && y - Math.max(verticalWalls[i].startY, verticalWalls[i].endY) <= GRIDSIZE) {
        return true;
      }
    }
  } else if (facing === 'down') {
    for (i = 0; i < horizontalWalls.length; i += 1) {
      if (horizontalWalls[i].startY > y
      && horizontalWalls[i].startY - y <= GRIDSIZE
      && x <= Math.max(horizontalWalls[i].startX, horizontalWalls[i].endX)
      && x >= Math.min(horizontalWalls[i].startX, horizontalWalls[i].endX)) {
        return true;
      }      
    }
    for (i = 0; i < verticalWalls.length; i += 1) {
      if (Math.abs(x - verticalWalls[i].startX) < GRIDSIZE
      && Math.min(verticalWalls[i].startY, verticalWalls[i].endY) - y <= GRIDSIZE) {
        return true;
      }
    }
  }
  
  // If you're here, the character hasn't hit anything:
  return false;
};


/*
 * Checks to see if a dot is at a given location.
 * If there is a dot there, make the dot disappear and return true.
 * If there is not a dot there, return false.
 */
var eatDot = function(x, y) {
  for (var i = 0; i < dots.length; i += 1) {
    var dot = dots[i];
    if (Math.abs(dot.x - x) <= EATTHRESHOLD
    && Math.abs(dot.y - y) <= EATTHRESHOLD) {
      dots.splice(i, 1);
      return true;
    }
  }
  // Go through the whole list of dots;
  return false;
}