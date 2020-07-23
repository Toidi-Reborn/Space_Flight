


/////////////////////////////  To-Do  /////////////////////////////
/*
DONE >  Boost images
>  better images
DONE > Different images based on damage
>  again, better images?
DONE >  Speed Boost
>  Fix boost image shifting
DONE >  Fix font
DONE >  Explosion on Hit - done but could be better
>  Game Over
>  Logo Open
>  Menu, started
>  Instructions
>  TOUCH
DONE >  Flame on/off
>  Ship rotate
DONE >  Fuel and Life bars
DONE >  Warning low fuel / high damage  - Bars flash when low
DONE >  Gallon(s) - No longer needed
DONE >  Align text center
DONE >  FIX canvas align
DONE >  FIX game canvas stretch issue

> Try pixel perfect collison


*/



/////////////////////////////  Set-Up  /////////////////////////////

var debugMode = false;
var w;
var topH, gameH, scoreH, gameW;
var running = true;
var gameRunning = false;
var shipLaunch = false;
var gamegoing = true;
var boostEnabled = false;
var spawnTimer = 1000;
var speedCountDown = 0;
var expList = [];
var mouseX, mouseY, bSelected, bTrigger;


///////////////////////////// Functions /////////////////////////////
function resizeTrigger() {
    var windowW = window.innerWidth
    var windowH = window.innerHeight
    w = windowW - 50

    topH = windowH * 0.14;
    gameH = windowH * 0.65;    
    scoreH = windowH * 0.14;
    gameHmid = gameH / 2;
    gameWmid = w / 20

    topWindow.canvas.width = w;
    topWindow.canvas.height = topH;
    topWindow.bW = ( w - (topWindow.buttonNum * topWindow.bGap) - topWindow.bGap) / topWindow.buttonNum;
    topWindow.midY = (topH - (topWindow.bH)) / 2;


    gameWindow.canvas.width = w;
    gameWindow.canvas.height = gameH;

    scoreWindow.canvas.width = w;
    scoreWindow.canvas.height = scoreH;

    ship.y = gameH * 0.75;
    ship.fireY = ship.y;
    
}


/////////////////////////////  Classes  /////////////////////////////

class topWindowClass {
    constructor() {
        this.canvas = document.getElementById("top");
        this.ctx = this.canvas.getContext("2d");
        this.buttonNum = 5;
        this.bGap = 10;
        this.bW;
        this.bH = 50;
        this.bX = this.bGap;
        this.midY;
        this.buttonNames = ["New / Start", "Instructions - Disabled", "HighScores - Disabled", "Menu 4 - Disabled", "Menu 5 - Disabled"];
        this.buttons = [];
    }

    startText = function(){
        this.ctx.font = "35px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Press Space to apply Fuel!!", 15, 50);
    }

    menu = function(i) {
        for (var i = 0; i < topWindow.buttonNum; i++) {

            var newX = this.bX + (i * (this.bGap + this.bW));
            this.text = this.buttonNames[i];
            var a = new buttonClass(newX , this.midY, this.bW, this.bH, this.text );  // x, y, w, h, t\
            topWindow.buttons.push(a);
        }

    }

}


class buttonClass {
    constructor(x, y, w, h, text) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.color = "silver";
        this.enabled = true;
        this.mid = (this.x + (this.x + this.w)) / 2;
    }

    draw = function() {
        this.canvas = document.getElementById("top");
        this.ctx = this.canvas.getContext("2d");       
        
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, this.w, this.h);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(this.text, this.mid, 50)
        this.ctx.closePath();
        
    }

    hover = function() {
        if (this.enabled) {
            if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
                this.color = "red";
                bSelected = this.text;
                bTrigger = true;
            } else {
                this.color = "silver";
            }
        }
    }
}

class gameWindowClass {
    constructor() {
        this.canvas = document.getElementById("gameArea");
        this.ctx = this.canvas.getContext("2d"); 
        //this.ctx.font = "25px Arial";
        //this.ctx.fillStyle = "white";  Not sure why this doesnt apply to drawback debug....
        this.shipStartX = 100;
        this.shipStartY = gameH * 0.80;
        this.starPath = 'index/images/stars2.png';
        this.starImage = new Image();
        this.starImage.src = this.starPath;
        this.starX = 0;
        this.scrollStart = this.canvas.width * 0.45;
    }


    drawBack = function(){
        this.ctx.drawImage(this.starImage, this.starX, 0);
        this.ctx.drawImage(this.starImage, this.starX + this.starImage.width, 0);
        
        if (this.starX <= 0 - this.starImage.width) {
            this.starX = 0;
        }
        
        if (debugMode) {        
            this.ctx.font = "25px Arial";
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Speed: " + ship.speed, 5, 50);
            this.ctx.fillText("Objects: " + objectList.length, 5, 90 );
            this.ctx.fillText("Level: " + ship.difficulty, 5, 140 );
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
    }

    drawtext = function() {
        var mile = ship.travelDistance;
        mile = mile.toFixed(1);
        this.ctx.font = "21px Arial";
        this.ctx.fillStyle = "white";
        this.f = ship.fuel.toFixed(0);
        this.d = ship.dam.toFixed(0);

        // add 1 for gal vs gals
        this.ctx.fillText("Fuel: " + this.f + "%", 5, 20);
        this.ctx.fillText("Life:  " + this.d + "%", 5, 50 );
        this.ctx.fillText("Distance Traveled: " + mile + " Miles", 5, 80 );

    }

}

class damageBarClass extends scoreWindowClass {
    constructor() {
        super();
        this.canvas = document.getElementById("scoreArea");
        this.ctx = this.canvas.getContext("2d");
        this.barSize = 500;
        this.barBackColor = "white";
        this.fuel = 500;
        this.life = 500;
        this.fCountDown = 20;
        this.dCountDown = 20;
        this.change = this.barSize / 100;
    }

    drawBar = function() {
        this.life2 = ship.fuel * this.change;
        this.ctx.fillStyle = this.barBackColor;
        this.ctx.fillRect(115, 5, this.barSize, 20);
        this.colorChange();
        this.ctx.fillRect(115, 5, this.life2, 20);
        
        this.life = ship.dam * this.change;
        this.ctx.fillStyle = this.barBackColor;
        this.ctx.fillRect(115, 35, this.barSize, 20);
        this.colorChange2();
        this.ctx.fillRect(115, 35, this.life, 20);

    }

    colorChange = function() {

        if (ship.fuel < 10) {
            this.fCountDown -= 1;      
            if (this.fCountDown < 1) {
                this.fCountDown = 20;
            }         
            if (this.fCountDown < 15) {
                this.ctx.fillStyle = "red"
            } else {
                this.ctx.fillStyle = this.barBackColor;
            }
        } else if (ship.fuel < 20) {
            this.ctx.fillStyle = "red";
        } else if (ship.fuel < 60) {
            this.ctx.fillStyle = "yellow";
        } else {
            this.ctx.fillStyle = "blue";
        }
    }
    colorChange2 = function() {
        
        if (ship.dam < 10) {
            this.dCountDown -= 1;      
            if (this.dCountDown < 1) {
                this.dCountDown = 20;
            }         
            if (this.dCountDown < 15) {
                this.ctx.fillStyle = "red"
            } else {
                this.ctx.fillStyle = this.barBackColor;
            }
        } else if (ship.dam < 20) {
            this.ctx.fillStyle = "red";
        } else if (ship.dam < 60) {
            this.ctx.fillStyle = "yellow";
        } else {
            this.ctx.fillStyle = "blue";
        }
    }


}

class explosionSprite extends gameWindowClass {
    constructor(i){
        super();
        this.image = new Image();
        this.image.src = 'index/images/explosion.png';
        this.frameX = 0;
        this.frameY = 3;
        this.moveX = 128;        
        this.moveY = 126;
        this.trigger = true;
        this.object = objectList[i];
        this.x = this.object.x;
        this.y = this.object.y;
    }


    drawExplosion = function(){
        if (this.trigger){   
            this.ctx.drawImage(this.image, this.moveX * this.frameX, this.moveY * this.frameY, this.moveX, this.moveY, this.x-50, this.y-50, 100 , 100);
            this.frameX += 1;
            if (this.frameX == 6){
                this.frameX = 0;
                this.frameY += 1;
                if (this.frameY == 5){
                    this.frameY = 3;
                    this.trigger = false;
                }
            }
        }

    }
}


///////////////// Ship

class shipClass extends gameWindowClass{
    constructor() {
        super();
        this.firePath = 'index/images/fire.png';
        this.fireImage = new Image();
        this.fireImage.src = this.firePath;
        this.path2 = 'index/images/ship2.png';
        this.path3 = 'index/images/ship3.png';
        this.path4 = 'index/images/ship4.png';
        this.path5 = 'index/images/ship5.png';
        this.path6 = 'index/images/ship6.png';
        this.path7 = 'index/images/ship7.png';
        this.image = new Image();
        this.image.src = this.path2;
        this.fuel = 100;
        this.dam = 100;
        this.go = false;
        this.travelDistance = 0;
        this.difficulty = 1;
        this.speedNormal = 10;
        this.speedBoost = 15;
        this.speed = this.speedNormal;
        this.x = 20;
        this.w = 150;
        this.fireW = this.w * 0.33;
        this.h = 100;
        this.fireX = this.x;
        this.fireY = this.y + this.h;
        this.level2 = false;
        this.level3= false;
        this.level4 = false;
        this.level5 = false;
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

        if (ship.dam < 0.5) {
            this.image.src = this.path7;
        } else if (ship.dam < 15) {
            this.image.src = this.path6;
        } else if (ship.dam < 30) {
            this.image.src = this.path5;
        } else if (ship.dam < 45) {
            this.image.src = this.path4;
        } else if (ship.dam < 65) {
            this.image.src = this.path3;
        }

        this.ctx.drawImage(this.image, this.x, this.y, this.w, this.h);

    }

    drawFire = function() {
        this.ctx.drawImage(this.fireImage, this.fireX - this.fireW, this.fireY, this.fireW, this.h);
        console.log(this.fireImage.width)
    
    }

    levelCheck = function() {
        if (this.level2 == false) {
            if (this.travelDistance > 5) {
                this.difficulty = 2;
                this.level2 = true;
            }
        }
        if (this.level3 == false) {
            if (this.travelDistance > 10) {
                this.difficulty = 3;
                this.level3 = true;
            }
        }
        if (this.level4 == false) {
            if (this.travelDistance > 15) {
                this.difficulty = 4;
                this.level4 = true;
            }
        }
        if (this.level5 == false) {
            if (this.travelDistance > 20) {
                this.difficulty = 5;
                this.level5 = true;
            }
        }
    }
}

class boostMasterClass {
    constructor() {
        this.x = gameWindow.canvas.width;
        this.y = Math.random() * (gameWindow.canvas.height - 50);
        this.w = 20;
        this.h = 20;
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
        this.sizes = Array(1, 2, 3);
        this.sizer = this.sizes[Math.floor(Math.random() * this.sizes.length)];
    }

    draw = function() {
        gameWindow.ctx.drawImage(this.image, this.x, this.y, this.w * this.sizer, this.h * this.sizer);
    }
    
    hit = function(i) {
        if (ship.go) {
            ship.dam -= 1;
        }            
        var boom = new explosionSprite(i);
        expList.push(boom);
        this.kill(i);
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
var damageBar = new damageBarClass();
var scoreWindowParent = new scoreWindowParentClass();
var ship = new shipClass();

/////////////////////////////  Events Listen  /////////////////////////////

window.addEventListener('resize', resizeTrigger);

// Keyboard Listen
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Mouse Listen
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("click", mouseClickHandler, false);

resizeTrigger();
topWindow.menu();
topWindow.buttons[1].enabled = false;
topWindow.buttons[2].enabled = false;
topWindow.buttons[3].enabled = false;
topWindow.buttons[4].enabled = false;

//////////////////////////// KEY INPUT ///////////////////////////////////


function keyDownHandler(e) {
    //console.log(e.key);
  
    if(e.key == " " && gameRunning) {
      ship.go = true;
      shipLaunch = true;
    }
    else if (e.key == "t") {
        console.log(topWindow.buttons[2].text);
    }
  }

function keyUpHandler(e) {
    if(e.key == " ") {
      ship.go = false;
    }
}

//////////////////////////// Mouse Move ///////////////////////////////////


function mouseMoveHandler(e) {
    mouseX =  e.clientX - topWindow.canvas.offsetLeft;
    mouseY =  e.clientY - topWindow.canvas.offsetTop;
}


//////////////////////////// Mouse Click ///////////////////////////////////

function mouseClickHandler(e) {
    console.log(bSelected);
    if (bSelected == topWindow.buttons[0].text) {
        gameRunning = true;
    }   
}


/////////////////////////////  Main Loop  /////////////////////////////

var objectList = [];

function draw() {
    gameWindow.ctx.clearRect(0,0, gameWindow.canvas.width, gameWindow.canvas.height);
    scoreWindow.ctx.clearRect(0,0, gameWindow.canvas.width, gameWindow.canvas.height);

    bTrigger = false;    
    for (var i = 0; i < topWindow.buttonNum; i++) {
        topWindow.buttons[i].draw();
        topWindow.buttons[i].hover();
    }
    if (bTrigger == false) {
        bSelected = "none";    
    }


    gameWindow.drawBack();
    damageBar.drawBar();
    
    if (gameRunning){
        var trigger = Math.random() * 1000;
        trigger = trigger.toFixed(0);
    
        if (speedCountDown > 0){
            speedCountDown -= 1;
            ship.speed = ship.speedBoost;
        } else {
            ship.speed = ship.speedNormal;
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

                else if (trigger < 400 * ship.difficulty) {
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


        if (expList.length > 0){
            for (var i = 0; i < expList.length; i++){
                expList[i].drawExplosion();
            }

        }


        if (ship.fuel <= 0.5 || ship.dam <= 0.5){
            ship.go = false;
            ship.fuel = 0;
        }

        if (ship.y > gameWindow.canvas.height - (ship.h * 0.75)){
            ship.image.src = ship.path7;
            ship.fuel = 0;
            ship.dam = 0;
            shipLaunch = false;
            boostEnabled = false;
            ship.go = false;
        }

        ship.drawShip();

        if (shipLaunch){
    
            if (ship.x < gameWindow.scrollStart) {
                ship.x += ship.speed;
                ship.fireX += ship.speed;
                ship.travelDistance += ship.speed / 1000;
            } else {
                gameWindow.starX -= ship.speed;
                gameWindow.star2 -= ship.speed;
                ship.travelDistance += ship.speed / 1000;
                boostEnabled = true;
            }
                        
            if (ship.go){
                ship.drawFire();
                if (ship.y > 0.5) {
                    ship.y -= ship.speed / 4;
                    ship.fireY -= ship.speed / 4;
                }
                ship.fuel -= (0.05 * (ship.speed / 25));
            } else {
                ship.y += ship.speed / 5;
                ship.fireY += ship.speed / 5;
            }
            ship.levelCheck();
        }

        for (var i = 0; i < objectList.length; i++){
            objectList[i].isHit(i);
            //objectList.splice(i, 1);
        }
        
    }





    if (running) {
        scoreWindow.drawtext();
        requestAnimationFrame(draw);
        
    }
}


draw();
