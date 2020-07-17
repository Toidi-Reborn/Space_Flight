






/////////////////////////////  To-Do  /////////////////////////////
/*
DONE >  Boost images
>  better images
DONE >  Speed Boost
>  Fix boost image shifting
>  Fix font
>  Explosion on Hit
>  Game Over
>  Logo Open
>  Menu
>  Instructions
>  TOUCH
>  Flame on/off
>  Ship rotate
>  Warning low fuel / high damage
>  Gallon(s)

>  FIX canvas align
>  FIX game canvas stretch issue






*/



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

    topH = windowH * 0.14;
    gameH = windowH * 0.65;
    gameHmid = gameH / 2;
    scoreH = windowH * 0.14;
    gameWmid = w / 20

    topWindow.canvas.style.height = topH + "px";
    topWindow.canvas.style.width = w + "px";
    

    gameWindow.canvas.style.cssText = "height: " + gameH + "px; width: " + w + "px";
    
    scoreWindow.canvas.style.cssText = "left: " + 10 + "px; height: " + scoreH + "px";
    scoreWindowParent.canvas.style.cssText = "left: " + 10 + "px;height: " + scoreH + "px; width: " + w + "px";
    
    //scoreWindow.canvas.width = scoreWindow.canvas.height * (scoreWindow.canvas.clientWidth / scoreWindow.canvas.clientHeight);
    //scoreWindow.canvas.height = scoreWindow.canvas.width * (scoreWindow.canvas.clientHeight / scoreWindow.canvas.clientWidth);
    //scoreWindow.canvas.style.cssText = "height: " + scoreH + "px; width: " + w + "px:";

}



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
        this.starPath = 'index/images/stars2.png';
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

class scoreWindowParentClass {
    constructor() {
        this.canvas = document.getElementById("scoreAreaParent");

    }

}


class scoreWindowClass {
    constructor() {
        this.canvas = document.getElementById("scoreArea");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.canvas.height * (this.canvas.clientWidth / this.canvas.clientHeight);
        this.canvas.height = this.canvas.width * (this.canvas.clientHeight / this.canvas.clientWidth);

    }

    drawtext = function() {
        var mile = ship.travelDistance;
        mile = mile.toFixed(1);
        this.ctx.font = "21px Arial";
        this.ctx.fillStyle = "white";
        this.f = ship.fuel.toFixed(0);
        this.d = ship.dam.toFixed(0);

        // add 1 for gal vs gals

        this.ctx.fillText("Fuel: " + this.f + " Gallons", 5, 20);
        this.ctx.fillText("Distance Traveled: " + mile + " Miles", 5, 50 );
        this.ctx.fillText("Damage: " + this.d + "%", 5, 80 );
    }
}


class shipClass extends gameWindowClass{
    constructor() {
        super();
        this.firePath = 'index/images/wall.jpg';
        this.fireImage = new Image();
        this.fireImage.src = this.firePath;
        this.path = 'index/images/ship.png';
        this.image = new Image();
        this.fuel = 100;
        this.dam = 100;
        this.image.src = this.path;
        this.go = false;
        this.travelDistance = 0;
        this.difficulty = 1;
        this.speed = 4;
        this.speedBoost = 7;
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
            this.hit(i);
        }
    }

    kill = function(i) {        
        delete objectList[i];
        objectList.splice(i, 1);
    }  
}


class speedBoost extends boostMasterClass {
    constructor(){
        super()
        this.path = 'index/images/speed.png';
        this.image = new Image();
        this.image.src = this.path;
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w * 2, this.h);
    }

    hit = function(i) {
        speedCountDown = 200;
        ship.speed = 3;
        this.kill(i);
    }

}

class garbageClass extends boostMasterClass {
    constructor(){
        super()
        this.path = 'index/images/m1.png';
        this.image = new Image();
        this.image.src = this.path;
        this.path = 'index/images/m2.png';
        this.image2 = new Image();
        this.image2.src = this.path;
        this.sizes = Array(0.45, 0.5, 0.75, 1, 2, 3);
        this.sizer = this.sizes[Math.floor(Math.random() * this.sizes.length)];
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w * this.sizer, this.h * this.sizer);
    }
    
    hit = function(i) {
        ship.dam -= 1;
        this.kill(i);
        
        gameWindow.ctx.drawImage(this.image2, this.x, this.y, this.w * (this.sizer * 2), this.h * (this.sizer * 2));
    }



}

class fuelClass extends boostMasterClass {
    constructor(){
        super()
        this.path = 'index/images/gas.png';
        this.image = new Image();
        this.image.src = this.path;
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w * 2, this.h * 2);
    }
    
    hit = function(i) {
        ship.fuel += 5;
        this.kill(i);;
    }
}


var topWindow = new topWindowClass();
var gameWindow = new gameWindowClass();
var scoreWindow = new scoreWindowClass();
var scoreWindowParent = new scoreWindowParentClass();
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
        ship.speed = ship.speedBoost;
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


    if (ship.fuel <= 0.5){
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
            ship.y += ship.speed / 5;
            ship.fireY += ship.speed / 5;
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



    if (ship.go) {
        ship.drawFire();
    } 

    ship.drawShip();
    
    if (running) {
        scoreWindow.drawtext();
        requestAnimationFrame(draw);
        
    }
}


draw()
