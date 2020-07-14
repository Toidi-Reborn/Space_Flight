


/////////////////////////////  Set-Up  /////////////////////////////


var w;
var topH, gameH, scoreH, gameW;
var running = true;
var shipLaunch = false;
var gamegoing = true;


///////////////////////////// Functions /////////////////////////////
function resizeTrigger() {
    var windowW = window.innerWidth
    var windowH = window.innerHeight
    w = windowW - 50

    topH = windowH * 0.15;
    gameH = windowH * 0.6;
    gameHmid = gameH / 2;
    scoreH = windowH * 0.20;
    gameWmid = w / 2;
    console.log(gameWmid);

    topWindow.canvas.style.height = topH + "px";
    topWindow.canvas.style.width = w + "px";

    gameWindow.canvas.style.cssText = "height: " + gameH + "px; width: " + w + "px;";
    scoreWindow.canvas.style.cssText = "height: " + scoreH + "px; width: " + w + "px";
    console.log(w)
}

var ship = 'index/images/controls.png'
var shipIMG = new Image();
shipIMG.src = ship;

/////////////////////////////  Classes  /////////////////////////////

class topWindowClass {
    constructor() {
        this.canvas = document.getElementById("top");
    }
}

class gameWindowClass {
    constructor() {
        this.canvas = document.getElementById("gameArea");
        this.ctx = this.canvas.getContext("2d");
        this.shipStartX = 100;
        this.shipStartY = gameH * 0.80;
        this.starPath = 'index/images/stars.jpg';
        this.starImage = new Image();
        this.starImage.src = this.starPath;
        this.starX = 0;
        this.star2 = this.canvas.width;
    }

    drawBack = function(){
        this.ctx.drawImage(this.starImage, this.starX, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.starImage, this.star2, 0, this.canvas.width, this.canvas.height);
        if (this.starX + this.canvas.width == 0) {
            this.starX = this.canvas.width;
        }
        if (this.star2 + this.canvas.width == 0) {
            this.star2 = this.canvas.width;
        } 
    }
}


class scoreWindowClass {
    constructor() {
        this.canvas = document.getElementById("scoreArea");
        this.ctx = this.canvas.getContext("2d");
        this.fuel = 100;
    }

    drawtext = function() {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "white";
        this.f = this.fuel.toFixed(0);
        this.ctx.fillText("Fuel: " + this.f + "%", 5, 20);
    }
}


class shipClass extends gameWindowClass{
    constructor() {
        super();
        this.firePath = 'index/images/launcher.png';
        this.fireImage = new Image();
        this.fireImage.src = this.firePath;
        this.path = 'index/images/peg.png';
        this.image = new Image();
        this.image.src = this.path;
        this.go = false;
        this.speed = 2;
        this.x = 20;
        this.y = this.canvas.height - (this.canvas.height * 0.2);
        this.w = 10;
        this.h = 10;
        this.fireX = this.x
        this.fireY = this.y + this.h;
    }

    drawShip = function() {
        this.ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }

    drawFire = function() {
        shipLaunch = true;
        this.ctx.drawImage(this.fireImage, this.fireX, this.fireY, this.w, this.h);
        if (ship.go) {
            this.y -= this.speed / 2;
            this.fireY -= this.speed / 2;
        } 
    }
}


class speedBoost {
    constructor(){
        this.path = 'index/images/wall3.jpg';
        this.image = new Image();
        this.image.src = this.path;
        this.x = gameWindow.canvas.width;
        this.y = Math.random() * gameWindow.canvas.height;
    }

    drawBoost = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y);
    }
}


var topWindow = new topWindowClass();
var gameWindow = new gameWindowClass();
var scoreWindow = new scoreWindowClass();
var ship = new shipClass();
var thisthing = new speedBoost();

/////////////////////////////  Events Listen  /////////////////////////////

window.addEventListener('resize', resizeTrigger);

// Keyboard Listen
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
resizeTrigger();


//////////////////////////// KEY INPUT ///////////////////////////////////


function keyDownHandler(e) {
    //console.log(e.key);
  
    if(e.key == " ") {
      ship.go = true;
    }
  }

  function keyUpHandler(e) {
    if(e.key == " ") {
      ship.go = false;
    }
  }


/////////////////////////////  Main Loop  /////////////////////////////

var speedBoostList = [];

function draw() {
    gameWindow.ctx.clearRect(0,0, gameWindow.canvas.width, gameWindow.canvas.height);
    scoreWindow.ctx.clearRect(0,0, gameWindow.canvas.width, gameWindow.canvas.height);
    gameWindow.drawBack();

    if (scoreWindow.fuel > 50 && scoreWindow.fuel < 52){
        console.log("trigger")
        a = new speedBoost;
        speedBoostList.push(a);
    }
    
    
    if (speedBoostList.length > 0) {
        console.log("kill me");   
    }

    if (scoreWindow.fuel <= 0.1){
        ship.go = false;
        scoreWindow.fuel = 0;
    }
    
    if (shipLaunch){
        if (ship.x < gameWindow.canvas.width / 3) {
            ship.x += ship.speed;
            ship.fireX += ship.speed;
        } else {
            gameWindow.starX -= ship.speed;
            gameWindow.star2 -= ship.speed;
        }
        
        scoreWindow.fuel -= 0.1;
        if (ship.go == false) {
            ship.y += ship.speed / 2;
            ship.fireY += ship.speed / 2;
            if (ship.y > gameWindow.canvas.height){
                scoreWindow.fuel = 0;
                console.log("game over");
                shipLaunch = false;
            }
        }
    }

    scoreWindow.drawtext();

    if (ship.go) {
        ship.drawFire();
    } 

    ship.drawShip();
    
    if (running) {
        requestAnimationFrame(draw);
    }
}


draw()
