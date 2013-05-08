//code to generate the background music
myAudio = new Audio('Superman-MainTheme.wav'); 
myAudio.addEventListener('ended', function() {
this.currentTime = 0;
this.play();
}, false);
myAudio.play();

//getting all canvases from the index with their ids
            
var canvasBg = document.getElementById('canvasBg');
var canvasPlane = document.getElementById('canvasPlane');
var canvasEnemy = document.getElementById('canvasEnemy');
var score = document.getElementById('score');
var menus = document.getElementById('menus');

//get canvas context
//context is how we manipulate the canvas
//to get them in 2 dimensions
var ctxBg = canvasBg.getContext('2d');
var ctxPlane = canvasPlane.getContext('2d');
var ctxEnemy = canvasEnemy.getContext('2d');
var ctxScore = score.getContext('2d');
var ctxMenu = menus.getContext('2d');

//score canvas is used for writing so we add it's font and fill style
ctxScore.fillStyle= "rgba(255,0,0,1)";
ctxScore.font="bold 20px Impact";


//load the sprite and call init function when it's done
var imgSprite = new Image();
imgSprite.src='images/sprite.png';
imgSprite.addEventListener('load',init,false);


//some initializations
var gamewidth=canvasBg.width ;
var gameheight=canvasBg.height;
var mouseX= 0;
var mouseY= 0;
//enemy hp originally
var h=1;


//boolean variables throughout the game
var isLevelOne=true;
var isLevelTwo=false;
var isPlaying = false;
var isPaused = false;
var isDead=false;
var mute=false;

//requesting animation frames from different kinds of browsers
var requestAnimFrame = window.requestAnimationFrame || 
                       window.webKitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.msRequestAnimationFrame ;


//enemy control variables
var totalEnemies = 0;
var enemies = [];
var spawnAmount = 4;

//main character ,1UP and indicator variables
var mainPlane=new Plane();
var extra=new extraLife();
var muteIndicator=new muteButton();
var pauseInd=new pauseButton();

//initializing the different buttons
var menuButton=new Button(0,152,347,401);
var multiButton=new Button(0,162,400,451);
var deadButton=new Button(400,500,450,550);
var winButton=new Button(375,466,0,88);
var level2Button=new Button(132,366,330,401);
var playerOneDied=new Button(250,350,50,200);
var playerTwoDied=new Button(400,400,490,540);

//score counters
var finalScore=0;
var levelOneScore=30;
var levelTwoScore=60


//event listeners for mouse or keyboard play
  document.addEventListener('keydown',checkKeyDown,false);
  document.addEventListener('keyup',checkKeyUp,false);
  document.addEventListener('mousemove',mouseMoved,false);
  document.addEventListener('mousedown',mouseDown,false);
  document.addEventListener('mouseup'  ,mouseUp  ,false);


  //multiplayer related variables
  var isSinglePlayer=true;
  var playerOneScore=0;
  var playerTwoScore=0;
  var isPlayer1;

//intializations for moving background
var bgDrawY1=0;
var bgDrawY2=-550;
var bgSrc1=0;
var bgSrc2=0;

//actual movement of background to make the motion look smoother
function moveBg()
{
  bgDrawY1+=5;
  bgDrawY2+=5;
  if(bgDrawY1 >=550 )
  {
     bgDrawY1=-550;
  }
  if(bgDrawY2 >=550 )
  {
     bgDrawY2=-550;
  }
  drawBg();
}

//returns most variables to their initial states
function clearAll()
{
   bgDrawY1=0;
   bgDrawY2=-550;
   bgSrc1=0;
   bgSrc2=0;
   mute=false;
   totalEnemies = 0;
   bgDrawY1=0;
   bgDrawY2=-550;
   mainPlane.updateScore(0);
   menuButton=new Button(50,500,250,520);
   extra=new extraLife();
   enemies = [];
   mute=false;
   isPlaying = false;
   isPaused = false;
}

//clears main plane 
//creates a new one instead
function clearMain()
{
mainPlane=new Plane();
}


//initialization function for every new game
function init()

{ clearCTXMenu()
  isLevelOne=true;
  isLevelTwo=false;
  bgSrc1=0;
  bgSrc2=0;
  isDead=false;  clearAll();
  clearMain();
  clearCTXEnemy();
  clearCTXplane();
  clearHUD();
  clearCTXHud();
  document.removeEventListener('click',mouseClickedLevel2,false);
  document.removeEventListener('click',mouseClickedDead,false);
  document.removeEventListener('click',mouseClickedWon,false);
  document.removeEventListener('click',mouseClickedOnePlayer,false);
  document.removeEventListener('click',mouseClickedTwoPlayer,false);
  spawnEnemy(spawnAmount,h);
  mainMenu();
  document.addEventListener('click',mouseClicked,false);
}

//show mainMenu
function mainMenu()
{
  ctxMenu.drawImage(imgSprite,0,550,gamewidth,gameheight,0,0,gamewidth,gameheight);
}

//begin level1
function level1()
{
  clearCTXMenu();
  document.removeEventListener('click',mouseClicked,false);
  document.removeEventListener('click',mouseClickedOnePlayer,false);
  updateHUD();
  drawBg();
  startLoop();
}

//begin level2 with different enemy types
function level2()
{
  clearCTXMenu();
  clearAll();
  clearHUD();
  updateHUD();
  document.removeEventListener('click',mouseClickedLevel2,false);
  spawnEnemy(spawnAmount,2*h);
  bgSrc1=500;
  bgSrc2=500;
  drawBg();
  startLoop();

}

////////////////////////////////////////////////////////
//menu handling functions (transitions between modes)
///////////////////////////////////////////////////////

///////////////////multiplayer cases///////////////////


//transition from player 1 to 2
function playerOneLoses()
{ stopLoop();
  isDead=false;
  playerOneScore=mainPlane.score;
  clearAll();
  clearMain();
  clearCTXEnemy();
  clearCTXplane();
  ctxMenu.drawImage(imgSprite,0,1100,gamewidth,gameheight,0,0,gamewidth,gameheight);
  document.addEventListener('click',mouseClickedOnePlayer,false);
}

//ending player 2 and calculating score
function playerTwoLoses()
{  stopLoop();
  isDead=true;
  playerTwoScore=mainPlane.score;
  clearAll();
  clearMain();
  clearCTXEnemy();
  clearCTXplane();
  ctxMenu.drawImage(imgSprite,1000,1100,gamewidth,gameheight,0,0,gamewidth,gameheight);
  res();
  document.addEventListener('click',mouseClickedDead,false);
}
//revealing result of the tournament
function res()
{
  
  ctxScore.clearRect(0,0,gamewidth,gameheight);
  ctxScore.fillText(playerOneScore ,80 ,420);
  ctxScore.fillText(playerTwoScore ,370 ,420);
  if(playerOneScore>playerTwoScore)
    {ctxScore.fillText( "1",255 ,495);alert("player one wins");}
  if(playerOneScore<playerTwoScore)
    {ctxScore.fillText( "2",255 ,495);alert("player two wins");}
  if(playerOneScore==playerTwoScore)
   {ctxScore.fillText( "TIE",230 ,495);alert("Tie");}
}

///////////////////////////////////////end multiplayer cases////////////////////

/////////////////////////////////single player cases/////////////////////////////
function youWin()
{
  //first level win
finalScore=mainPlane.score;
clearMain();
stopLoop();
clearCTXEnemy();
clearCTXplane();
ctxMenu.drawImage(imgSprite,1000,550,gamewidth,gameheight,0,0,gamewidth,gameheight);
displayResult();
document.addEventListener('click',mouseClickedWon,false);
}

function level2Win()
{ 
  //second level win
  finalScore=mainPlane.score;
  clearAll();
  stopLoop();
  clearCTXEnemy();
  clearCTXplane();
  ctxMenu.drawImage(imgSprite,1500,550,gamewidth,gameheight,0,0,gamewidth,gameheight);
  displayResult();

  document.addEventListener('click',mouseClickedLevel2,false);
}

function youLose()
{
finalScore=mainPlane.score;
isDead=true;
clearAll();
clearMain();
stopLoop();
clearCTXEnemy();
clearCTXplane();
ctxMenu.drawImage(imgSprite,500,550,gamewidth,gameheight,0,0,gamewidth,gameheight);
displayResult();
document.addEventListener('click',mouseClickedDead,false);
}
///////////////////////////////////////end single player/////////////////////////////




//animation function or loop
function loop()
{if(isPlaying)
  {
  if(!isPaused)
        {
          moveBg();
          mainPlane.draw();
          extra.draw();
          drawEnemies();
         }
  requestAnimFrame(loop);
}
}

function startLoop()
{
  isPlaying=true;
  loop();
}

function stopLoop()
{
  isPlaying=false;
}

function drawBg()
{
  ctxBg.clearRect(0,0,gamewidth,gameheight);
  var srcX=0;
	var srcY=0;
	var drawX=0;
	var drawY=0;
	ctxBg.drawImage(imgSprite,bgSrc1,0,gamewidth,gameheight,0,bgDrawY1,gamewidth,gameheight);
  ctxBg.drawImage(imgSprite,bgSrc2,0,gamewidth,gameheight,0,bgDrawY2,gamewidth,gameheight);

}

/////////////////////////////////////////
//making a Plane object
////////////////////////////////////////

function Plane()
{
	this.srcX=1003;
	this.srcY=0;
	this.planeWidth=35;
	this.planeHeight=75;
	this.drawX=(gamewidth-this.planeWidth)/2;
	this.drawY=gameheight-this.planeHeight;
	this.speed=2;
  this.hp=3;
  this.score=0;
  //where the bullets will spawn
  this.noseX =this.drawX+17.5 ;
  this.noseY = this.drawY;
	this.isUpKey=false;
	this.isRightKey=false;
	this.isLeftKey=false;
	this.isDownKey=false;
  this.isSpacebar=false;
  this.isShooting=false;
  this.rockets= [];
  this.currentRocket=0;
  this.mainExplosion=new Explosion();
  for(var i=0;i<8;i++)
    this.rockets[this.rockets.length]= new Rocket();

}

//draw the plane object

Plane.prototype.draw=function()
{
	clearCTXplane();
	this.checkDirection();
  this.noseX =this.drawX+17.5 ;
  this.noseY = this.drawY;
  this.checkShooting();
  this.drawRockets();
  //check enemy collision and explosion of enemies 
  this.checkCollision();
  if(this.mainExplosion.hasHit)
  {
    if(this.hp!=0)
      this.mainExplosion.draw();
    }
  else
      ctxPlane.drawImage(imgSprite,this.srcX,this.srcY,this.planeWidth,this.planeHeight,this.drawX,this.drawY,this.planeWidth,this.planeHeight);
};

//for key controls check direction of input and move accordingly

Plane.prototype.checkDirection=function()
{

if(this.isUpKey)
{
	if(this.drawY-this.speed>=0)
    this.drawY-=this.speed;
}
if(this.isRightKey)
{
	if(this.drawX+this.speed<465)
    this.drawX+=this.speed;
}
if(this.isLeftKey)
{
	if(this.drawX-this.speed>=0)
    this.drawX-=this.speed;
}
if(this.isDownKey)
{
  if(this.drawY-this.speed<=475)
	this.drawY+=this.speed;
}
};



Plane.prototype.drawRockets = function()
{
  for(var i=0;i<this.rockets.length;i++)
  {
    if(this.rockets[i].drawY >=0)
    {
      this.rockets[i].draw();
    }
    if(this.rockets[i].explosion.hasHit)
    {
      this.rockets[i].explosion.draw();
    }

  }
};

//increas main score and check winning conditions
Plane.prototype.updateScore = function(points,enemy)
{
  this.score+=points;
  updateHUD();
  if(this.score==levelOneScore && isLevelOne && isSinglePlayer)
    {isLevelOne=false;isLevelTwo=true;level2Win();}
  else if(this.score==levelTwoScore && isLevelTwo)
    {enemy.destructor();youWin();}
};


Plane.prototype.checkShooting = function()
{
  //to see if space bar down or not
 if(this.isSpacebar && !this.isShooting)
 { this.isShooting=true;
   this.rockets[this.currentRocket].fire(this.noseX,this.noseY);
   this.currentRocket++; 
   if(this.currentRocket >=this.rockets.length)
    this.currentRocket=0; 
 }
 else if(!this.isSpacebar)
 {
  this.isShooting=false;
 }
};


//check collision with enemies
Plane.prototype.checkCollision= function()
{
  for(var i=0;i<enemies.length;i++)
  { if(this.drawX>=enemies[i].drawX && this.drawX<=enemies[i].drawX+enemies[i].enemyWidth 
    && this.drawY>=enemies[i].drawY && this.drawY<=enemies[i].drawY+enemies[i].enemyHeight )
    {
      this.collision(enemies[i]);
    }
   else if(this.drawX+mainPlane.planeWidth>=enemies[i].drawX && this.drawX+mainPlane.planeWidth<=enemies[i].drawX+enemies[i].enemyWidth 
    && this.drawY>=enemies[i].drawY && this.drawY<=enemies[i].drawY+enemies[i].enemyHeight )
    {
      this.collision(enemies[i]);
    }
   else if(this.drawX>=enemies[i].drawX && this.drawX<=enemies[i].drawX+enemies[i].enemyWidth 
    && this.drawY+mainPlane.planeHeight>=enemies[i].drawY && this.drawY+mainPlane.planeHeight<=enemies[i].drawY+enemies[i].enemyHeight )
   {
      this.collision(enemies[i]);
    }
   else if(this.drawX+mainPlane.planeWidth>=enemies[i].drawX && this.drawX+mainPlane.planeWidth<enemies[i].drawX+enemies[i].enemyWidth 
    && this.drawY+mainPlane.planeHeight>=enemies[i].drawY && this.drawY+mainPlane.planeHeight<enemies[i].drawY+enemies[i].enemyHeight )
    {
     this.collision(enemies[i]);
    }
  }
}

//responsible for generating the explosion destroing the enemy and decreasing the hp 
Plane.prototype.collision= function(enemy)
{
  this.mainExplosion.drawX=enemy.drawX;
  this.mainExplosion.drawY=enemy.drawY+30;
  this.mainExplosion.hasHit=true;
  enemy.destructor();
  this.decreaseHp();
}

Plane.prototype.decreaseHp=function()
{
  this.hp--;
  if(this.hp==0)
    {//clearCTXplane;
    if(isSinglePlayer)
    youLose();
   else if(!isSinglePlayer && isPlayer1)
    playerOneLoses();
  else
    playerTwoLoses();}
     updateHUD();
}

//increas HP in case of 1UPs
Plane.prototype.updateHp=function()
{
  this.hp++;
  updateHUD();
}




//////////////////////////////////
//end plane object
/////////////////////////////////



////////////////////////////////////
//Enemy
//////////////////////////////////

function Enemy(hp)
{
  //enemies spawning in level 1
  if(isLevelOne){
  this.srcX=1000;
  this.srcY=77;
  this.enemyWidth=125;
  this.enemyHeight=133;
  this.speed=3;}
  //enemies spawning in level2
  else if(isLevelTwo)
  {
  this.srcX=1130;
  this.srcY=75;
  this.enemyWidth=150;
  this.enemyHeight=185;
  this.speed=2;
  } 

  this.drawX=Math.floor(Math.random()*gamewidth-this.enemywidth);
  this.drawY=-1*Math.floor(Math.random()*gameheight);
  this.rewardPoints = 5;
  this.hp=hp;
  this.maxHp=hp;
}

Enemy.prototype.draw=function()
{
  this.drawY+=this.speed;
  ctxEnemy.drawImage(imgSprite,this.srcX,this.srcY,this.enemyWidth,this.enemyHeight,this.drawX,this.drawY,this.enemyWidth,this.enemyHeight);
  this.checkOutBounds();
};

Enemy.prototype.checkOutBounds=function()
{
  if(this.drawY>=canvasBg.height)
    this.destructor();
    //delete the enemy
};
Enemy.prototype.destructor = function()
{
  //remove items from lists ,first param tells us what item to remove
  //second param tells us how many items to 
  //for LATER set speed=0 and don't draw
  //enemies.splice(enemies.indexOf(this),1);
  //totalEnemies--;
  this.hp=this.maxHp;
  this.drawX=Math.floor(Math.random()*gamewidth-this.enemyWidth);
  this.drawY=-1*Math.floor(Math.random()*gameheight);

};

///////////////////////////
//enemy helper functions
///////////////////////////

//spawn n enemies with h hp each
function spawnEnemy(n,h)
{
  for(var i=0 ; i<n ;i++)
  {
    enemies[enemies.length]=new Enemy(h);
  }
}

function drawEnemies()
{ //clear canvas context for enemies
  clearCTXEnemy();
  for(var i=0 ; i<enemies.length ;i++)
  {
    enemies[i].draw();
  }

}

//////////////////////////////////////
//rockects
///////////////////////////////////////

//all rockets are generated and put in outside drawing canvas 
//on firing a rocket is chosen then it is given a starting position and direction
function Rocket()
{
  this.srcX=1015;
  this.srcY=210;
  this.drawX=0;
  this.drawY=-30;
  this.width= 13;
  this.height= 34;
  this.speed=2;
  this.explosion = new Explosion();
}

Rocket.prototype.draw=function()
{
  this.drawY-=this.speed;
  ctxPlane.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
  this.checkHitEnemy();
  if(this.drawY<=0) 
  {
   this.recycle();
  }
};

//starts firing the rockets
Rocket.prototype.fire=function(startX,startY)
{
  //set starting position of a rocket
  this.drawX = startX;
  this.drawY = startY;
};


Rocket.prototype.recycle=function()
{
  //move the bullet out of canvas range
  this.drawY=-30;
};

Rocket.prototype.checkHitEnemy=function()
{
  for(var i=0;i<enemies.length;i++)
  { if(this.drawX>=enemies[i].drawX && this.drawX<enemies[i].drawX+enemies[i].enemyWidth 
    && this.drawY>=enemies[i].drawY && this.drawY<=enemies[i].drawY+enemies[i].enemyHeight )
    {  enemies[i].hp--;
      this.recycle();
      if(enemies[i].hp==0)
      {
      this.explosion.drawX=enemies[i].drawX;
      this.explosion.drawY=enemies[i].drawY+30;
      this.explosion.hasHit=true;
      mainPlane.updateScore(enemies[i].rewardPoints,enemies[i]);
      enemies[i].destructor();
     }
      }
      else if(this.drawX+this.width>=enemies[i].drawX && this.drawX+this.width<enemies[i].drawX+enemies[i].enemyWidth 
    && this.drawY+this.height>=enemies[i].drawY && this.drawY+this.height<=enemies[i].drawY+enemies[i].enemyHeight )
     {
      enemies[i].hp--;
      this.recycle();
      if(enemies[i].hp==0)
      {
      this.explosion.drawX=enemies[i].drawX;
      this.explosion.drawY=enemies[i].drawY+30;
      this.explosion.hasHit=true;
      mainPlane.updateScore(enemies[i].rewardPoints,enemies[i]);
      enemies[i].destructor();
      }
    }
    
    }
  
};
/////////////////////////
//explosion stuff
////////////////////////

function Explosion()
{
  this.srcX=1003;
  this.srcY=257;
  this.drawX=0;
  this.drawY=-30;
  this.width= 54;
  this.height= 53;
  this.currentFrame=0;
  this.totalFrames=10;
  this.hasHit=false;
}

Explosion.prototype.draw=function()
{
  if(this.currentFrame<=this.totalFrames){
    //draw explosion
    ctxPlane.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
    this.currentFrame++;
  }
  else
  {
  this.hasHit=false;
  this.currentFrame=0;
  }
};

/////////////////////////////////////
//End explosion
/////////////////////////////////////



//////////////////////////////////////
//1UP
//////////////////////////////////////
//similar to rockets a 1up is generated then looped through the drawing canvas
function extraLife()
{
  this.srcX=1070;
  this.srcY=260;
  this.width= 68;
  this.height=35;
  this.drawX= Math.floor(Math.random()*gamewidth);
  this.drawY=-1*Math.floor(Math.random()*gamewidth-this.height)-2000;
  this.speed=4;
}


extraLife.prototype.draw=function()
{
  this.drawY+=this.speed;
  ctxPlane.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
  this.checkOutBounds();
  this.collision();
};

extraLife.prototype.checkOutBounds=function()
{
  if(this.drawY>=canvasBg.height)
    this.destructor();
    //delete the 1up
};
extraLife.prototype.destructor = function()
{ 
  this.drawX=Math.floor(Math.random()*gamewidth);
  this.drawY=-1*Math.floor(Math.random()*gamewidth-this.height)-2000;
};
extraLife.prototype.collision = function()
{
  if(this.drawX<=mainPlane.drawX && this.drawX+this.width>=mainPlane.drawX 
    && this.drawY<=mainPlane.drawY && this.drawY+this.height>=mainPlane.drawY)
    {  mainPlane.updateHp();
      this.destructor();
      }
      else if(this.drawX<=mainPlane.drawX +mainPlane.planeWidth&& this.drawX+this.width>=mainPlane.drawX+mainPlane.planeWidth 
    && this.drawY+this.height>=mainPlane.drawY && this.drawY+this.height<=mainPlane.drawY+mainPlane.planeHeight )
     {
      mainPlane.updateHp();
      this.destructor();      
      }
}

///////////////////////////////////////////
// END 1UP
///////////////////////////////////////////


////////////////////////////////////////////
//Mute Button
///////////////////////////////////////////
function muteButton()
{
  this.srcX=1038;
  this.srcY=335;
  this.width= 35;
  this.height=28;
  this.isMute=false;
}
muteButton.prototype.draw=function()
{   if(!this.isMute)
    ctxScore.drawImage(imgSprite,1038,335,this.width,this.height,400,510,this.width,this.height);
    else
    ctxScore.drawImage(imgSprite,1144,335,this.width,this.height,400,510,this.width,this.height);
}

////////////////////////////////////////////
//END Mute Button
////////////////////////////////////////////


////////////////////////////////////////////
//Pause Button
///////////////////////////////////////////
function pauseButton()
{
  this.srcX=1038;
  this.srcY=365;
  this.width=42;
  this.height=32;
  this.isPaused=false;
}
pauseButton.prototype.draw=function()
{   if(!this.isPaused)
    ctxScore.drawImage(imgSprite,1039,364,this.width,this.height,500,550,this.width,this.height);
    else
    ctxScore.drawImage(imgSprite,1039,364,this.width,this.height,450,510,this.width,this.height);
}


////////////////////////////////////////////
//END Pause Button
////////////////////////////////////////////


/////////////////////////////////////


function clearCTXplane() {
    ctxPlane.clearRect(0,0,gamewidth,gameheight);
}

function clearCTXEnemy() {
    ctxEnemy.clearRect(0,0,gamewidth,gameheight);
}

function clearCTXMenu() {
    ctxMenu.clearRect(0,0,gamewidth,gameheight);
}
function clearCTXHud() {
    ctxScore.clearRect(0,0,gamewidth,gameheight);
}


/////////////////////////////////////////////
//HUD control
/////////////////////////////////////////////

function clearHUD()
{
  ctxScore.fillStyle= "rgba(255,0,0,1)";
  ctxScore.font="bold 20px Impact";
}

function updateHUD()
{
      ctxScore.fillStyle= "rgba(255,0,0,1)";
      ctxScore.font="bold 20px Impact";
      ctxScore.clearRect(0,0,gamewidth,gameheight);
      ctxScore.fillText("Score: " + mainPlane.score ,400 ,30);
      ctxScore.fillText("Health: "+ mainPlane.hp ,10 ,30);
      muteIndicator.draw();
      pauseInd.draw();
}

function displayResult()
{
   ctxScore.fillStyle= "rgba(255,0,0,1)";
   ctxScore.font="bold 50px Impact";
   ctxScore.clearRect(0,0,gamewidth,gameheight);
   ctxScore.fillText("Score: " + finalScore ,150 ,250);
   }

//////////////////////////////////////////
//End HUD control
/////////////////////////////////////////


//button object
function Button(xL,xR,yt,yb)
{
  this.xLeft=xL;
  this.xRight=xR;
  this.yTop=yt;
  this.yBot=yb;
}

Button.prototype.detectClick=function()
{
  if(mouseX>=this.xLeft && mouseX<=this.xRight
   && mouseY>=this.yTop && mouseY<=this.yBot)
    return true;
    else return false;

}

//end button
////////////////////////////////////////////
//user input
////////////////////////////////////////////

function checkKeyDown(e)
  {
      var keyUsed = e.keyCode || e.which ;
      if(keyUsed === 38 || keyUsed === 87){
          //UP and W 
          mainPlane.isUpKey=true;
          e.preventDefault();
      }
      if(keyUsed === 39 || keyUsed === 68){
          //right and D 
          mainPlane.isRightKey=true;
          e.preventDefault();
      }
      if(keyUsed === 40 || keyUsed === 83){
          //down and S 
          mainPlane.isDownKey=true;
          e.preventDefault();
      }
      if(keyUsed === 37 || keyUsed === 65){
          //left and A 
          mainPlane.isLeftKey=true;
          e.preventDefault();
      } 
      if(keyUsed === 32){
          //space 
          mainPlane.isSpacebar=true;
          e.preventDefault();
      } 
       if(keyUsed === 80){
          //P
          if(isPaused) 
               {isPaused=false;pauseInd.isPaused=false;updateHUD();}
          else {isPaused=true;pauseInd.isPaused=true;updateHUD();}
      } 
      if(keyUsed === 81){
          //Q
          window.location.href = "index.html";
      } 
      if(keyUsed === 77){
          //M
          if(mute) 
          { 
            myAudio.muted = false;
            mute=false;muteIndicator.isMute=false;
            updateHUD();
          }
          else
          {
            myAudio.muted = true;
            mute=true;muteIndicator.isMute=true;
            updateHUD();
          }

      } 


  }



  function checkKeyUp(e)
  {
      var keyUsed = e.keyCode || e.which ;
      if(keyUsed === 38 || keyUsed === 87){
          //UP and W 
          mainPlane.isUpKey=false;
          e.preventDefault();
      }
      if(keyUsed === 39 || keyUsed === 68){
          //right and D 
          mainPlane.isRightKey=false;
          e.preventDefault();
      }
      if(keyUsed === 40 || keyUsed === 83){
          //down and S 
          mainPlane.isDownKey=false;
          e.preventDefault();
      }
      if(keyUsed === 37 || keyUsed === 65){
          //lleft and A 
          mainPlane.isLeftKey=false;
          e.preventDefault();
      } 
      if(keyUsed === 32){
          //space 
          mainPlane.isSpacebar=false;
          e.preventDefault();
      } 

  }


 function mouseMoved(e)
{
  if(e.pageX-canvasBg.offsetLeft<=0)
      mainPlane.drawX=0;
   else if(e.pageX-canvasBg.offsetLeft>=465)
      mainPlane.drawX=465;
    else{if(mainPlane.drawX<e.pageX-canvasBg.offsetLeft)
            mainPlane.srcX=1040;
         else if(mainPlane.drawX>e.pageX-canvasBg.offsetLeft)
            mainPlane.srcX=1080;
          else
            mainPlane.srcX=1000;
      mainPlane.drawX=e.pageX-canvasBg.offsetLeft;
        }
  if(e.pageY-canvasBg.offsetTop <=0)
    mainPlane.drawY=0;
  else if(e.pageY-canvasBg.offsetTop>=475)
    mainPlane.drawY=475;
 else
 mainPlane.drawY=e.pageY-canvasBg.offsetTop;
}

  function mouseDown(e)
  {
   mainPlane.isSpacebar=true; 
  }
  function mouseUp(e)
  {
  mainPlane.isSpacebar=false;
  }

  function mouseClicked(e)
  {
    //var menuButton=new Button(0,152,347,401);
    mouseX = e.pageX-canvasBg.offsetLeft;
    mouseY = e.pageY-canvasBg.offsetTop;
    if(mouseX>=0 && mouseX<=152
   && mouseY>=347 && mouseY<=401 && isDead==false )
      {isSinglePlayer=true;level1();}
    else if(mouseX>=0 && mouseX<=160
   && mouseY>=400 && mouseY<=450 && isDead==false )
      {isSinglePlayer=false;isPlayer1=true;level1();}
  }
  function mouseClickedDead(e)
  {
    mouseX = e.pageX-canvasBg.offsetLeft;
    mouseY = e.pageY-canvasBg.offsetTop;
    if(deadButton.detectClick() && isDead==true )
      {isDead=true;startLoop();init();}

  }
  function mouseClickedWon(e)
  {
    mouseX = e.pageX-canvasBg.offsetLeft;
    mouseY = e.pageY-canvasBg.offsetTop;
    if(winButton.detectClick() )
      {isDead=true;startLoop();init();}

  }
  function mouseClickedLevel2(e)
  {
     mouseX = e.pageX-canvasBg.offsetLeft;
     mouseY = e.pageY-canvasBg.offsetTop;
     if(level2Button.detectClick() )
      {startLoop();level2();}
  }

  function mouseClickedOnePlayer(e)
  {
    mouseX = e.pageX-canvasBg.offsetLeft;
    mouseY = e.pageY-canvasBg.offsetTop;
      if(playerOneDied.detectClick() && isPlayer1 )
      {isPlayer1=false;startLoop();spawnEnemy(spawnAmount,h);level1();}
 }
 function mouseClickedTwoPlayer(e)
 {
  mouseX = e.pageX-canvasBg.offsetLeft;
    mouseY = e.pageY-canvasBg.offsetTop;
      if(playerTwoDied.detectClick() && !isPlayer1 )
      {isPlayer1=true;isDead=true;startLoop();init();}
 }