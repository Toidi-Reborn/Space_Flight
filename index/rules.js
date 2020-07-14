


/////////////////////////////  Set-Up  /////////////////////////////


var w;
var topH, gameH, scoreH, gameW;
var running = true;
var shipLaunch = false;
var gamegoing = true;
var boostEnabled = false;
var spawnTimer = 1000;
var speedCountDown = 0;


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
        if (this.starX + this.canvas.width <= 0) {
            this.starX = this.star2 + this.canvas.width;
        }
        if (this.star2 + this.canvas.width <= 0) {
            this.star2 = this.starX + this.canvas.width;
        } 
    }
}


class scoreWindowClass {
    constructor() {
        this.canvas = document.getElementById("scoreArea");
        this.ctx = this.canvas.getContext("2d");

    }

    drawtext = function() {
        var mile = ship.travelDistance;
        mile = mile.toFixed(1);
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "white";
        this.f = ship.fuel.toFixed(0);
        this.ctx.fillText("Fuel: " + this.f + "%", 5, 20);
        this.ctx.fillText("Distance Traveled: " + mile + " Miles", 5, 50 );
        this.ctx.fillText("list: " + objectList.length, 5, 80 );
    }
}


class shipClass extends gameWindowClass{
    constructor() {
        super();
        this.firePath = 'index/images/launcher.png';
        this.fireImage = new Image();
        this.fireImage.src = this.firePath;
        this.path = 'index/images/ship.png';
        this.image = new Image();
        this.fuel = 100;
        this.image.src = this.path;
        this.go = false;
        this.travelDistance = 0;
        this.difficulty = 1;
        this.speed = 2;
        this.x = 20;
        this.y = this.canvas.height - (this.canvas.height * 0.2);
        this.w = 30;
        this.h = 30;
        this.fireX = this.x
        this.fireY = this.y + this.h;
    }

    drawShip = function() {
        /*
        this.ctx.save();
        //ctx.setTransform(scale, 0, 0, scale, x, y); //sets scale and origin
        this.ctx.translate(canvas.width / 2 + this.center, canvas.height - gameAreaBottom - 20);
        this.ctx.rotate(this.angleR);
        this.ctx.drawImage(launcherIMG, -this.width / 2, -this.height, this.width, this.height);
        this.ctx.restore();
        */

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


class boostMasterClass {
    constructor() {
        this.x = gameWindow.canvas.width;
        this.y = Math.random() * (gameWindow.canvas.height - 50);
        this.w = 10;
        this.h = 10;
    }

    isHit = function(i) {
        if (ship.x < this.x + this.w && ship.x + ship.w > this.x && ship.y < this.y + this.h && ship.y + ship.h > this.y ) {
            console.log('hit');
            this.hit(i);
        }

    }
}


class speedBoost extends boostMasterClass {
    constructor(){
        super()
        this.path = 'index/images/wall3.jpg';
        this.image = new Image();
        this.image.src = this.path;
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }

    hit = function() {
        speedCountDown = 200;
        ship.speed = 3;
    }

}

class garbageClass extends boostMasterClass {
    constructor(){
        super()
        this.path = 'index/images/wall.jpg';
        this.image = new Image();
        this.image.src = this.path;
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
    
    hit = function() {
    
    }
}

class fuelClass extends boostMasterClass {
    constructor(){
        super()
        this.path = 'index/images/launch.png';
        this.image = new Image();
        this.image.src = this.path;
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
    
    hit = function(i) {
        console.log(i);
        ship.fuel += 20;
        delete objectList[i];
        objectList.splice(i, 1);
    }

}




var topWindow = new topWindowClass();
var gameWindow = new gameWindowClass();
var scoreWindow = new scoreWindowClass();
var ship = new shipClass();




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

var objectList = [];

function draw() {
    gameWindow.ctx.clearRect(0,0, gameWindow.canvas.width, gameWindow.canvas.height);
    scoreWindow.ctx.clearRect(0,0, gameWindow.canvas.width, gameWindow.canvas.height);
    gameWindow.drawBack();
    var trigger = Math.random() * 1000;
    trigger = trigger.toFixed(0);
    


    if (speedCountDown != 0){
        speedCountDown -= 1;
    } else {
        ship.speed = 2;
    }

    if (boostEnabled) {
        spawnTimer -= 50;
        if (spawnTimer == 0) {
            spawnTimer = 1000;
        } else if (spawnTimer == 500 || spawnTimer == 250) {

            if (trigger < 100 / ship.difficulty) {
                a = new speedBoost;
                objectList.push(a);
            }

            else if (trigger < 200 / ship.difficulty) {
                a = new fuelClass;
                objectList.push(a);
            }

            else if (trigger < 400 / ship.difficulty) {
                a = new garbageClass;
                objectList.push(a);
                
            }
        }


        if (objectList.length > 0) {
            for (var i = 0; i < objectList.length; i++){
                objectList[i].draw();
                objectList[i].x -= 1 * ship.speed;
        
                if (objectList[i].x < -20) {
                    delete objectList[i];
                    objectList.splice(i, 1);
                }
            }
        }
    }


    if (ship.fuel <= 0.1){
        ship.go = false;
        ship.fuel = 0;
    }
    
    if (shipLaunch){
  
        if (ship.x < gameWindow.canvas.width / 3) {
            ship.x += ship.speed;
            ship.fireX += ship.speed;
            ship.travelDistance += ship.speed / 1000;
        } else {
            gameWindow.starX -= ship.speed;
            gameWindow.star2 -= ship.speed;
            ship.travelDistance += ship.speed / 1000;
            boostEnabled = true;
        }
        
        ship.fuel -= 0.1;

        if (ship.go == false) {
            ship.y += ship.speed / 2;
            ship.fireY += ship.speed / 2;
            if (ship.y > gameWindow.canvas.height){
                ship.fuel = 0;
                console.log("game over");
                shipLaunch = false;
                boostEnabled = false;
            }
        }
    }

    for (var i = 0; i < objectList.length; i++){
        objectList[i].isHit(i);
        //objectList.splice(i, 1);
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
