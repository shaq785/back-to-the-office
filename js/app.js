var tileHeight = 83;
var tileWidth = 101;

var finalScore = 450;


//////General
var Global = function (x, y, sprite, animationIndex, blockWidth){
  this.x = x;
  this.y = y;
  this.sprite = sprite;
  this.animationIndex = animationIndex;
  if (animationIndex === undefined){
    this.animationIndex = 0;
  }
  this.blockWidth = blockWidth;
};


//Shuffle Sound Array
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


//////////// Enemies
var Enemy = function(x, y, sprite, blockWidth) {
    // console.log(x, y, sprite, animationIndex, blockWidth);
    var speed = Math.floor(((550 - y)/500) * 250);
    // console.log(speed,sprite);
    Global.call(this, x, y, sprite, 1, blockWidth);
    this.canvasrow = tileWidth;
    this.limit = this.canvasrow * 7;
    this.speed = speed; //Math.floor(Math.random() * 300);
    //this.blockWidth = Number(blockWidth);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// You should multiply any movement by the dt parameter
// which will ensure the game runs at the same speed for
// all computers.

Enemy.prototype.start = function(){
    this.canvasrow = tileWidth;
    this.limit = this.canvasrow * 7;
   // this.speed = Math.floor(Math.random() * 325);
};

Enemy.prototype.update = function(dt) {
  directionRow = this.y;
  if(directionRow % 2 == 0 ){

    if(this.x > - this.limit){
      this.x -= this.speed * dt;
    } else {
      this.x = 707;
    }

   
  }else{
    this.start();
    if(this.x < this.limit){
      this.x += this.speed * dt;
    } else {
      this.x = -707;
    }
  }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    //console.log(this.sprite,this.animationIndex)
    directionRow = this.y;
    if(directionRow % 2 == 0 ){
      //moving left
     ctx.drawImage(Resources.get(this.sprite[0]), this.x, this.y);
    } else {
       ctx.drawImage(Resources.get(this.sprite[1]), this.x, this.y);
      //moving right
      
    }
};

Enemy.prototype.animate = function(frames) {
  var timeouts = [];
  var i = 0;
  var orig = this;
  function doAnim(ind){
    orig.animationIndex = frames[ind][0];
  }
  for(var frame in frames) {
    timeouts[i] = setTimeout(doAnim, frames[frame][1], i);
    i++
  }
};
//////////// Player

var Player = function(x, y, sprite, animationIndex) {
  this.canvasrow = tileWidth;
  this.canvascol = tileHeight;
  Global.call(this,this.canvasrow * 3, (this.canvascol * 6) + 55, sprite, this.animationIndex, 1);
  this.win = false;
  this.deathAnimate = false;
  this.winAnimate = false;
  this.soundPlayed = false;
  this.score = 0;
  this.lives = 3;
  this.gameOver = false;   // new initially set to false
  $("#livescount").text(this.lives);
  $("#scoreBar").text(this.score);
};

Player.prototype.start = function(){
  this.x = 303;
  this.y = 553;
  this.lives = 3;
  this.score = 0;
  $("#livescount").text(this.lives);
  $("#scoreBar").text(this.score);
};

Player.prototype.render = function() {
  // console.log(this.animationIndex);
  ctx.drawImage(Resources.get(this.sprite[this.animationIndex]), this.x, this.y);
};

Player.prototype.animate = function(frames) {
    var timeouts = [];
    var i = 0;
    var orig = this;
    function doAnim(ind){
      orig.animationIndex = frames[ind][0];
    }
    for(var frame in frames) {
      timeouts[i] = setTimeout(doAnim, frames[frame][1], i);
      i++
    }
};

Player.prototype.update = function(){
  
    if (this.score >= finalScore && this.soundPlayed == false){
      this.soundPlayed = true;
      console.log(this.soundPlayed);
      var doorSound = document.getElementById('doorSound');
      doorSound.play();
    }

    if( this.y === -28 && this.x === tileWidth * 3 && this.score >= finalScore){
      this.winAnimate = true;
      this.x = 303;
      this.y = 55;
      this.animate([[0,0],[3,500],[5,1000],[4,1500],[5,2001]]);

      var themeSong = document.getElementById('themeSong');
      themeSong.pause();  
      var winSound = document.getElementById('winSound');
        winSound.play();

  
      setTimeout(() => {
        this.win = true;
        this.winAnimate = false;
        this.reset();

        this.score += 5;
        $("#scoreBar").text(this.score);
        // console.log("win!");
        this.gameOver = false;
        this.x = 303;
        this.y = 553;

        $("#winModal").modal("show");
        console.log(this.score, 'Score')
        this.gameOver = true;
        this.start();

      }, 4000);
    }
};

Player.prototype.checkCollisions = function (enemies){

  for( var enemy of allEnemies){
    //console.log(enemy.x, enemy.x * enemy.baseWidth, enemy.canvasrow);
    if(this.y === enemy.y && (
     enemy.x < this.x + this.canvasrow / 2 &&
     enemy.x + (enemy.canvasrow * enemy.blockWidth) / 2 > this.x)){

          
          // this.animate(1);
          // console.log("DEATH from", enemy);
          this.deathAnimate = true;
          this.animate([[1,0],[4,500],[1,1000],[4,1500],[0,2001]]);

          var collisionSoundId = ['collisionSound-1', 'collisionSound-2', 'collisionSound-3', 'collisionSound-4', 'collisionSound-5' ];
          shuffle(collisionSoundId);
          var sound = collisionSoundId[0];
          console.log(sound)
          var collisionSound = document.getElementById(sound);
          collisionSound.play();

          setTimeout(() => {

              this.deathAnimate = false;
          

              this.reset();
              // console.log("collide! test");

              this.score -= 5;
              this.lives -= 1;
              $("#livescount").text(this.lives);
              $("#scoreBar").text(this.score);
              if(this.lives === 0){
                $("#gameoverModal").modal("show");
                console.log(this.score, 'Score');
                $('.tw').attr('href','https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.millenniumweb.com%2F2021-holiday%2F&via=millennium&text=I%20just%20scored%20a%20' + this.score + '&hashtags=millhastag');
                this.gameOver = true;
                this.start();
              }
           }, 2000);
    } else {

      this.update();
    }
  }
};

Player.prototype.handleInput = function (input){
  switch (input) {
    case "left":
      this.animate([[2,0],[0,250]]);
      if(this.x > 0){
        this.x -= this.canvasrow;
      }
      break;
    case "right":
       this.animate([[3,0],[0,250]]);
      if(this.x < this.canvasrow * 6){
        this.x += this.canvasrow;
      }
      break;
    case "up":
      if(this.score < finalScore){
        if(this.y > this.canvascol * 1){
          this.y -= this.canvascol;
        } 
      }else if (this.y > 0){
        this.y -= this.canvascol;
      }
      break;
    case "down":
      this.animate([[4,0],[0,250]]);
      if(this.y < this.canvascol * 6){
        this.y += this.canvascol;
      }
      break;
  }
};

Player.prototype.reset = function (){
  this.x = this.canvasrow * 3;
  this.y = (this.canvascol * 6) + 55;
};


///////////////////////GEMS
var Gems = function(x, y, sprite, animationIndex) {
    Global.call(this, Math.floor(Math.random() * x), y, sprite, this.animationIndex, 1);
    this.posx = x;
    this.canvascol = tileHeight;
    this.canvasrow = tileWidth;
    this.limit = this.canvasrow * 7;
    this.speed = Math.floor(Math.random() * 150);
    this.animationClock = 10; 
    this.animationClockDefault = this.animationClock; 
};

Gems.prototype.restart = function(){
  this.x =Math.floor(Math.random() * this.posx);
};

Gems.prototype.start = function(){
    this.canvasrow = tileWidth;
    this.limit = this.canvasrow * 7;
    this.speed = Math.floor(Math.random() * 250);
};

Gems.prototype.update = function(dt) {
  directionRow = this.y;
  if(directionRow % 2 == 0 ){
    
    if(this.x > - this.limit){
      this.x -= this.speed * dt;
    } else {
      this.x = 707;
    }

  }else{
    this.start();
    if(this.x < this.limit){
      this.x += this.speed * dt;
    } else {
      this.x = -707;
    }

  }
};

Gems.prototype.checkGems = function (Player) {
    if(this.y === player.y && (
      player.x < this.x + this.canvasrow / 2 &&
      player.x + player.canvasrow / 2 > this.x
    )){
      //console.log("same row!");----- test
      player.animate([[5,0],[0,250]]);


      var gemSoundId = ['gemSound-1', 'gemSound-2', 'gemSound-3', 'gemSound-4', 'gemSound-5', 'gemSound-6'];
      shuffle(gemSoundId);
      var sound = gemSoundId[0];
      var gemSounds = document.getElementById(sound);
        gemSounds.play();

      if(this.sprite[0] === 'images/boost-coffee1.svg'){
        this.x = 900;
        player.score += 20;
        $("#scoreBar").text(player.score);
      } else if(this.sprite[0] === 'images/boost-mask1.svg'){
        this.x = 900;
        player.score += 30;
        $("#scoreBar").text(player.score);
      } else if(this.sprite[0] === 'images/boost-vaccine1.svg'){
        this.x = 900;
        player.score += 40;
        $("#scoreBar").text(player.score);
      } else if(this.sprite[0] === 'images/Rock.png'){
        this.x = 900;
        player.score -= 50;
        player.reset(); //TODO possibly change this to leaving charater in spot
        $("#scoreBar").text(player.score);
       }
     }
     // TEST console.log(this.y, player.y)
};

Gems.prototype.render = function() {

    this.animationClock -= 1;
    if (this.animationClock == 0){
      this.animationClock = this.animationClockDefault;
      this.animationIndex += 1;
      
      if(this.animationIndex > (this.sprite.length - 1)){
        this.animationIndex = 0;
      } 
    }
    ctx.drawImage(Resources.get(this.sprite[this.animationIndex]), this.x, this.y);
};


Gems.prototype.animate = function(frames) {
  var timeouts = [];
  var i = 0;
  var orig = this;
  function doAnim(ind){
    orig.animationIndex = frames[ind][0];
  }
  for(var frame in frames) {
    timeouts[i] = setTimeout(doAnim, frames[frame][1], i);
    i++
  }
};
/* explicação:no update é quando inserimos o collision porque será exatamente a função
que  terá que fazer a cada vez que se encontram.
do if (){} fórmula montada que foi substituida e que basicamente marca as extremidades
e os as dimensões de cada retângulo e o que fazer ao se encontrarem.
O ponto mais importante aqui é o enemy.x = eu não poderia colocar Enemy.x porque estaria
fora do escopo, ou seja qualquer atualização do fora do Player.prototype.update , não seria
dentro dele. Sendo assim, o  function () é como a porta de conexão com o mundo externo e o mundo interno
lá eu coloco um parametro , neste caso o enemy que eu Désirée determinei que irá se chamar dessa forma
e que se refere ao Enemy.x . Ou seja qualquer modifacação fora do Player.prototype.update, será atualizado
automaticamente. Agora a pergunta é: Como avisar ao programa que enemy é na verdade Enemy?
para fazer a ligação eu vou no engine.js( arquivo já criado pela Udacity) e na linha 94 function updateEntities
eu encontro a relação e é onde ele chama o update function é o player.update() que colocamos o parametro
enemy. o player.update(enemy) está dentro do allEnemies.  All enemies por sua vez está no app.js e linka
com Enemy. Voilà! Tudo conectado.
 */

// Now instantiate your objects.
// Enemies
var enemy1 = new Enemy(-100, 138, ['images/cars1.svg','images/cars1-right.svg'],1); //row 1 enemy
var enemy2 = new Enemy(-900, 138, ['images/bus.svg','images/bus-right.svg'],2);//row 1 enemy
var enemy3 = new Enemy(0, 221, ['images/cars2.svg','images/cars2-right.svg'],1);//row 2 enemy
var enemy4 = new Enemy(-450, 221, ['images/truck.svg','images/cars1-right.svg'],1);//row 2 enemy
var enemy5 = new Enemy(-404, 304, ['images/protestors1.svg','images/protestors1.svg'],2); //row 3 enemy
var enemy6 = new Enemy(-101, 304, ['images/protestors2.svg','images/protestors2.svg'],1); //row 3 enemy
var enemy7 = new Enemy(-350, 387, ['images/covid.svg','images/covid.svg'],1);//row 4 enemy
var enemy8 = new Enemy(0, 387, ['images/covid.svg','images/covid.svg'],1);//row 4 enemy
var enemy9 = new Enemy(-400, 470, ['images/clothes1.svg','images/clothes1.svg'],1);//row 5 enemy
var enemy10 = new Enemy(-100, 470, ['images/clothes2.svg','images/clothes2.svg'],1);//row 5 enemy
var enemy11 = new Enemy(-50, 55, ['images/mask-ordinance1.svg', 'images/mask-ordinance1.svg'],1);
var enemy12 = new Enemy(-600, 55, ['images/mask-ordinance2.svg', 'images/mask-ordinance2.svg'],1);

var allEnemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7, enemy8, enemy9, enemy10, enemy11, enemy12];
console.log(allEnemies);
//Player
var player = new Player(0,0,[
  'images/character-back.svg',
  'images/character-death.svg',
  'images/character-left.svg',
  'images/character-right.svg',  
  'images/character-default.svg',
  'images/character-win.svg'    
]);

//frame sets for Gems
var coffeeFrames = ['images/boost-coffee1.svg','images/boost-coffee2.svg','images/boost-coffee3.svg','images/boost-coffee4.svg'];
var maskFrames = ['images/boost-mask1.svg','images/boost-mask2.svg','images/boost-mask3.svg','images/boost-mask4.svg'];
var vaccineFrames= ['images/boost-vaccine1.svg','images/boost-vaccine2.svg','images/boost-vaccine3.svg','images/boost-vaccine4.svg'];


//Gems
var gem1 = new Gems(-50, 138, coffeeFrames);
var gem2 = new Gems(-200, 221, maskFrames);
var gem3 = new Gems(-350, 304, vaccineFrames);
var gem4 = new Gems(-450, 387, maskFrames);
var gem5 = new Gems(-500, 470, coffeeFrames);
// var gem6 = new Gems(-50, 55, ['images/mask-ordinance1.svg']);
// var gem7 = new Gems(-200, 55, ['images/mask-ordinance2.svg']);
var allGems = [gem1, gem2, gem3, gem4, gem5];



// Show Welcome Modal on Page Load
document.addEventListener('DOMContentLoaded', function(){
  //hiding start modal during development

  $("#welcomeModal").modal("show");

});

$("#btplay").click(function(){
  allGems.forEach(function(gem){
    gem.restart();
  })
  //console.log("clicked"); test
});

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };


    //console.log(e.keyCode)

    //ignore key preses while player is dead
    if(!player.deathAnimate){
      player.handleInput(allowedKeys[e.keyCode]);  
    }
    
});


var mobileBtn = document.getElementsByClassName("keys")
var mobileKeyQuery = document.querySelectorAll('[data-key]');

for(let i = 0; i < mobileBtn.length; i++) {
  mobileBtn[i].addEventListener("click", function(e) {
      var allowedKeys = {
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down'
      };
      var mobileKey = mobileKeyQuery[i].dataset.key;
      var mobileInt = parseInt(mobileKey);
      //console.log('Button Pressed', mobileInt);

      //ignore key preses while player is dead
      if(!player.deathAnimate){
        player.handleInput(allowedKeys[mobileInt]);
      }
  })
}



