image_path = "./img/";
player_right_sprite = "ryu_right_1.png";
player_left_sprite = "ryu_left_1.png";
ai_right_sprite = "ryu_right_2.png";
ai_left_sprite = "ryu_left_2.png";
const frame_width = 150;
const frame_height = 150;
const punch_width = 130;
const kick_width = 150;
const offset = 0;
const offsetHit = 80;
const offsetPunch = 130
const offsetKick = 150;
const punchPenalty = 10;
const kickPenalty = 5;
var entities_list = [];

//global var of sound
var backgroundMusic;
var isBackgroundMusicPlaying;
var isGameOver;

window.onload = function () {
	document.getElementById("gameWorld").focus();
};

function sleep(milliseconds) {
	var start = new Date().getTime();
	while ((start + milliseconds) > new Date().getTime()) {
	}
}

function distance(offsetCaller, offsetOpponent) {
	return (Math.abs(entities_list[0].x - entities_list[1].x) - Math.abs(offsetCaller - offsetOpponent));
}

// Added by Travis
function distance_abs() {
	// Player is to the left of AI
	if ((entities_list[0].x - entities_list[1].x) > 0) {
		return -1;
		// Player is to the right of AI
	} else if ((entities_list[0].x - entities_list[1].x) < 0) {
		return 1;
		// Players at same X coordinate or some error condition
	} else {
		return 0;
	}
}
// End Added by Travis

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop) {
	this.spriteSheet = spriteSheet;
	this.startX = startX;
	this.startY = startY;
	this.frameWidth = frameWidth;
	this.frameDuration = frameDuration;
	this.frameHeight = frameHeight;
	this.frames = frames;
	this.totalTime = frameDuration * frames;
	this.elapsedTime = 0;
	this.loop = loop;
	this.reverse;// = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
	var scaleBy = scaleBy || 1;
	this.elapsedTime += tick;
	if (this.loop) {
		if (this.isDone()) {
			this.elapsedTime = 0;
		}
	} else if (this.isDone()) {
		return;
	}
	var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
	var vindex = 0;
	if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
		index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
		vindex++;
	}
	while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
		index -= Math.floor(this.spriteSheet.width / this.frameWidth);
		vindex++;
	}

	var locX = x;
	var locY = y;
	var offset = vindex === 0 ? this.startX : 0;
	ctx.drawImage(this.spriteSheet,
		index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
		this.frameWidth, this.frameHeight,
		locX, locY,
		this.frameWidth * scaleBy,
		this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
	return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
	return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
	Entity.call(this, game, 350, 400);

	// background sound initialization
	backgroundMusic = new Audio("./sound/backgroundsound.mp3");
	console.log("started playing background music");
	// backgroundMusic.play();

	//MIKE new update
	//boolean for is Game over or not.
	// initially it is false;
	isGameOver = false;

	isBackgroundMusicPlaying = true;
	this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {

	//as long as this game is not over, it should work. Background mute button.
	//background update
	if (!isGameOver) {
		if (isBackgroundMusicPlaying) {
			backgroundMusic.pause();
			isBackgroundMusicPlaying = false;
		} else {
			isBackgroundMusicPlaying = true;
			backgroundMusic.play();
		}
	}
}

Background.prototype.draw = function (ctx) {
	Entity.prototype.draw.call(this);
}

function FighterMaker(animationDetail) {
	var index = 0;
	animationDetail[0].animation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), animationDetail[2][index] * frame_width, frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].walkAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), animationDetail[2][index] * frame_width, frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].jumpAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), animationDetail[2][index] * frame_width, frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].punchAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), animationDetail[2][index] * frame_width, frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].kickAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), animationDetail[2][index] * frame_width, frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].fallAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), animationDetail[2][index] * frame_width, frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
}

function Player(game) {
	this.playerLeft = false; this.playerRight = true;
	if (this.playerLeft) {
		FighterMaker([this, player_left_sprite, [0, 0, 0, 0, 0, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
	} else if (this.playerRight) {
		FighterMaker([this, player_right_sprite, [2, 2, 0, 7, 4, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
	}

	//////////////mike

	// sound effect variables
	this.punchingSound = new Audio("./sound/punch.wav");
	this.walkingSound = new Audio("./sound/walking2.wav");
	this.kickingSound = new Audio("./sound/kick.wav");
	this.jumpingSound = new Audio("./sound/jump.wav");
	///	    this.backgroundMusic = new Audio("./sound/backgroundsound.mp3");
	this.dyingSound = new Audio("./sound/dying.wav");
	// need to be implemented getting sound
	this.gethitSound = new Audio("./sound/gettinghit.wav");


	//New Update by MIKE
	this.isTimeOut = false;
	this.idle = false;
	this.gameEngine = game;
	this.isWinner = false;
	////////////////mike

	this.walking = false;
	this.jumping = false;
	this.punching = false;
	this.kicking = false;
	this.name = 'Ken';
	this.hp = 100;
	this.radius = 100;
	this.ground = 240;
	this.x = 300;
	this.y = 240;

	// Added by Travis
	this.direction = 1
	// End Added by Travis

	Entity.call(this, game, 300, 240);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
	//MIKE new update --
	//SOUND is off when the timer is zero or one of the players is dead.
	for (var i = 0; i < entities_list.length; i++) {
		// console.log(entities_list[i].hp);
		if (entities_list[i].hp === 0 || entities_list[i].idle) {
			backgroundMusic.pause();
			isGameOver = true;
			break;
		}
	}

	//MIKE (IDLE) new update on if the player wins, then it only draws idle animation
	// it should not do anything else
	//

	if (this.gameEngine.gameTimer === 0 || (this.hp === 0 || entities_list[0].hp === 0)) {
		// console.log("1 index player is " + entities_list[1].name);
		this.isTimeOut = true;
	}
	// if time is out or player knock out AI
	//THEN PLAYER IDLE MODE
	if (this.isTimeOut || (this.hp > 0 && entities_list[1].hp === 0)) {
		this.idle = true;
	}

	if (this.idle) {
		if (this.hp > entities_list[1].hp) {
			this.isWinner = true;
			entities_list[1].isWinner = false;
		}

	} else {
		//player is to the left
		if (distance_abs() === 1) {
			this.offset = offset;
			this.offsetHit = offsetHit;
			this.offsetPunch = offsetPunch;
			this.offsetKick = offsetKick;
			//player is to the right
		} else if (distance_abs() === -1) {
			this.offset = (frame_width - offset);
			this.offsetHit = (frame_width - offsetHit);
			this.offsetPunch = (frame_width - offsetPunch);
			this.offsetKick = (frame_width - offsetKick);
		}

		// Added by Travis
		if (distance_abs() === 1 && this.direction === 1) {
			this.direction = -1;
			FighterMaker([this, player_right_sprite, [2, 2, 0, 7, 4, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
		} else if (distance_abs() === -1 && this.direction === -1) {
			this.direction = 1;
			FighterMaker([this, player_left_sprite, [0, 0, 0, 0, 0, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
		}
		// End Added by Travis

		if (this.game.walk) this.walking = true; else this.walking = false;
		if (this.game.playerLeft) { this.playerLeft = true; this.playerRight = false; } else { this.playerLeft = false; this.playerRight = true };
		if (this.game.space) {
			this.jumping = true;
			this.jumpingSound.play();
			// if (this.game.jump) this.punching = true;
			// this.jumping = true;
			// this.hp -= 1;
			/* add this after we implement the hitbox
				if(this.hp==0){
				  isGameOver= true;
				  this.backgroundMusic.pause();
			  this.dyingSound.play();
				}
			*/

			///mike
		}

		if (this.game.punch) {
			this.punching = true;
			this.punchingSound.play();
		}
		if (this.game.kick) {
			this.kicking = true;
			this.kickingSound.play();
		}

		if (this.jumping) {
			if (this.jumpAnimation.isDone()) {
				this.jumpAnimation.elapsedTime = 0;
				this.jumping = false;
			}
			var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
			var totalHeight = 150;

			if (jumpDistance > 0.5)
				jumpDistance = 1 - jumpDistance;

			//var height = jumpDistance * 2 * totalHeight;
			var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
			this.y = this.ground - height;
		}

		if (this.punching) {
			// console.log(distance(this.offsetPunch, entities_list[1].offsetHit));
			if (this.punchAnimation.isDone()) {
				this.punchAnimation.elapsedTime = 0;
				this.punching = false;
				if (distance(this.offsetPunch, entities_list[1].offsetHit) <= 0) { entities_list[1].hp -= punchPenalty; };
			}
		}

		if (this.kicking) {
			// console.log(distance(this.offsetKick, entities_list[1].offsetHit));
			if (this.kickAnimation.isDone()) {
				this.kickAnimation.elapsedTime = 0;
				this.kicking = false;
				if (distance(this.offsetKick, entities_list[1].offsetHit) <= 0) { entities_list[1].hp -= kickPenalty; };
			}
		}

		if (this.x < 1000 - 150 && this.walking && this.playerRight) {
			this.walkingSound.play();

			this.jumping ? this.x += 10 : this.x += 3;
			// console.log(distance(this.offset, entities_list[1].offset));
		}

		if (this.x > 0 && this.walking && this.playerLeft) {
			this.walkingSound.play();

			this.jumping ? this.x -= 10 : this.x -= 3;
			// console.log(distance(this.offset, entities_list[1].offset));
		}
	}
	Entity.prototype.update.call(this);
}

Player.prototype.draw = function (ctx) {
	if (this.idle) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else {
		if (this.jumping) {
			this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.punching) {
			// console.log("3 " + distance());
			this.punchAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.kicking) {
			// console.log("4 " + distance());
			this.kickAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.walking) {

			this.walkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	}

	Entity.prototype.draw.call(this);

	// ctx.beginPath();
	// ctx.lineWidth = "2";
	// ctx.strokeStyle = "rgba(0, 0, 255, 1)";
	// ctx.moveTo(this.x + this.offsetHit, 0);
	// ctx.lineTo(this.x + this.offsetHit, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetPunch, 0);
	// ctx.lineTo(this.x + this.offsetPunch, this.ground + 150);
	// ctx.moveTo(this.x + this.offset, 0);
	// ctx.lineTo(this.x + this.offset, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetKick, 0);
	// ctx.lineTo(this.x + this.offsetKick, this.ground + 150);

	// ctx.moveTo(0, this.ground + 40);
	// ctx.lineTo(this.x + this.offset, this.ground + 40);
	// ctx.stroke();
	// ctx.closePath();
}

function Ai(game) {
	// Modified by Travis
	this.aiLeft = true; this.aiRight = false;
	if (this.aiLeft) {
		FighterMaker([this, ai_left_sprite, [0, 0, 0, 0, 0, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
	} else if (this.aiRight) {
		FighterMaker([this, ai_right_sprite, [2, 2, 0, 7, 4, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
	}
	// Modified by Travis

	this.walking = false;
	this.jumping = false;
	this.punching = false;
	this.kicking = false;
	this.name = 'AI';
	this.radius = 100;
	this.hp = 100;
	this.ground = 240;

	// MIke new update MAKING AI IDLE 
	this.idle = false;
	this.isWinner = false;


	// Added by Travis
	this.x = 500;
	this.y = 240;
	this.cooldown = 0;
	// End added by Travis


	Entity.call(this, game, 500, 240);
}

Ai.prototype = new Entity();
Ai.prototype.constructor = Ai;

// These need to add up to 1 as well.
const do_nothing_0 = 0.2;
const walk_0 = 1 - do_nothing_0;

// THESE SHOULD ADD UP TO 1 OR WEIRD STUFF WILL HAPPEN
const kick_chance_1 = 0.1;
const do_nothing_1 = 0.2;
const get_closer = 1 - kick_chance_1 - do_nothing_1;

// THIS SET OF CONSTATNTS SHOULD ALSO ADD UP TO 1
const kick_chance_2 = 0.25
const punch_chance = 0.25
const do_nothing_2 = 0.35
const walk_away = 1 - kick_chance_2 - punch_chance - do_nothing_2

Ai.prototype.update = function () {
	//player is to the left
	if (distance_abs() === 1) {
		this.offset = (frame_width - offset);
		this.offsetHit = (frame_width - offsetHit);
		this.offsetPunch = (frame_width - offsetPunch);
		this.offsetKick = (frame_width - offsetKick);

		//player is to the right
	} else if (distance_abs() === -1) {
		this.offset = offset;
		this.offsetHit = offsetHit;
		this.offsetPunch = offsetPunch;
		this.offsetKick = offsetKick;
	}

	// Determines whether player/AI should switch sides of the sprite.
	if (distance_abs() === -1 && this.aiLeft) {
		this.aiLeft = false; this.aiRight = true;
		FighterMaker([this, ai_right_sprite, [2, 2, 0, 7, 4, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
	} else if (distance_abs() === 1 && this.aiRight) {
		this.aiLeft = true; this.aiRight = false;
		FighterMaker([this, ai_left_sprite, [0, 0, 0, 0, 0, 0], [10, 10, 12, 5, 8, 12], [true, true, false, false, false, false]]);
	}

	//MIKE IDLE UPDATE 
	if (entities_list[0].isTimeOut) {
		this.idle = true;
	}

	if (this.idle) {
		if (this.hp > entities_list[0].hp) {
			this.isWinner = true;
			entities_list[0].isWinner = false;
			this.clearStatuses();
			// console.log("AI IS WINNER" + this.isWinner);
		}
	} else {
		if (this.cooldown === 0) {
			// current_distance = distance(this.offset, entities_list[0].offset);
			// AI code starts here. If the AI is too far away, it will either idle or walk towards
			// the player.
			//if (current_distance >= (kick_width - entities_list[0].offset)) {
			if (this.kickAnimation.elapsedTime > 0 || this.punchAnimation.elapsedTime > 0) {
				if (this.kickAnimation.isDone()) {
					this.kickAnimation.elapsedTime = 0;
					this.kicking = false;
					this.cooldown = 4;
					if (distance(this.offsetKick, entities_list[0].offsetHit) <= 0) { entities_list[0].hp -= kickPenalty; };
				} else if (this.punchAnimation.isDone()) {
					this.punchAnimation.elapsedTime = 0;
					this.punching = false;
					this.cooldown = 4;
					if (distance(this.offsetPunch, entities_list[0].offsetHit) <= 0) { entities_list[0].hp -= punchPenalty; };
				} else {
					this.cooldown = 7;
					this.walking = false;
				}
			} else if (distance(this.offsetKick, entities_list[0].offsetHit) > 0) {
				var rdm = Math.random();
				this.clearStatuses();
				if (rdm < walk_0) {
					this.doWalking();
				} else {
					this.cooldown = 7;
					this.walking = false;
				}
			} else if (distance(this.offsetKick, entities_list[0].offsetHit) <= 0) {
				if (this.kickAnimation.elapsedTime <= 0) {
					var rdm = Math.random();
					if (rdm < kick_chance_1) {
						this.walking = false;
						this.kicking = true;
						// this.offset = kick_width;
						// console.log(distance(this.offsetKick, entities_list[0].offsetHit));
					} else {
						this.doWalking();
					}
				} else if (this.kickAnimation.isDone()) {
					this.kickAnimation.elapsedTime = 0;
					this.kicking = false;
					this.cooldown = 4;
				} else {
					this.cooldown = 7;
					this.walking = false;
				}
			} else if (distance(this.offsetPunch, entities_list[0].offsetHit) <= 0) {
				if (this.kickAnimation.elapsedTime <= 0 && this.punchAnimation.elapsedTime <= 0) {
					var rdm = Math.random();
					if (rdm <= kick_chance_2) {
						this.walking = false;
						this.kicking = true;
						// this.offset = kick_width;
						// console.log(distance(this.offsetKick, entities_list[0].offsetHit));
					} else if (rdm > kick_chance_2 && rdm <= (kick_chance_2 + punch_chance)) {
						this.walking = false;
						this.punching = true;
						// this.offset = punch_width;
						// console.log(distance(this.offsetPunch, entities_list[0].offsetHit));
					} else if (rdm > (kick_chance_2 + punch_chance) && rdm <= (kick_chance_2 + punch_chance + do_nothing_2)) {
						this.cooldown = 7;
						this.walking = false;
					} else {
						this.doWalking();
					}
				}
			}
		} else {
			this.cooldown -= 1;
		}
	}

	Entity.prototype.update.call(this);
}

Ai.prototype.doWalking = function () {
	// AI to the left, move right
	if (this.x < 1000 - 150 && distance_abs() < 0) {
		this.walking = true;
		this.x += 3;
		// AI to the right, move left
	} else if (this.x > 0 && distance_abs() > 0) {
		this.walking = true;
		this.x -= 3;
	}
	// console.log(distance(this.offsetKick, entities_list[0].offsetHit));
}

Ai.prototype.clearStatuses = function () {
	this.walking = false;
	this.jumping = false;
	this.punching = false;
	this.kicking = false;
	this.kickAnimation.elapsedTime = 0;
	this.punchAnimation.elapsedTime = 0;
}

Ai.prototype.draw = function (ctx) {

	if (this.idle) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else {
		if (this.jumping) {
			this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.punching) {
			// console.log("1 " + distance(this.offset, entities_list[0].offset));
			this.punchAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.kicking) {
			// console.log("2 " + distance(this.offset, entities_list[0].offset));
			this.kickAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.walking) {
			this.walkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	}

	Entity.prototype.draw.call(this);


	// ctx.beginPath();
	// ctx.lineWidth = "2";
	// ctx.strokeStyle = "rgba(255, 0, 0, 1)";
	// ctx.moveTo(this.x + this.offsetHit, 0);
	// ctx.lineTo(this.x + this.offsetHit, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetPunch, 0);
	// ctx.lineTo(this.x + this.offsetPunch, this.ground + 150);
	// ctx.moveTo(this.x + this.offset, 0);
	// ctx.lineTo(this.x + this.offset, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetKick, 0);
	// ctx.lineTo(this.x + this.offsetKick, this.ground + 150);

	// ctx.moveTo(0, this.ground + 40);
	// ctx.lineTo(this.x + this.offset, this.ground + 40);
	// ctx.stroke();
	// ctx.closePath();
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(image_path + player_right_sprite);
ASSET_MANAGER.queueDownload(image_path + player_left_sprite);
ASSET_MANAGER.queueDownload(image_path + ai_right_sprite);
ASSET_MANAGER.queueDownload(image_path + ai_left_sprite);

ASSET_MANAGER.downloadAll(function () {
	console.log("starting up da sheild");
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	var gameEngine = new GameEngine();
	var bg = new Background(gameEngine);
	var player = new Player(gameEngine);
	var ai = new Ai(gameEngine);
	gameEngine.addEntity(ai);
	gameEngine.addEntity(player);
	entities_list.push(player);
	entities_list.push(ai);

	gameEngine.init(ctx);
	gameEngine.start();
});
