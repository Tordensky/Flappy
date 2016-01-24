const MAX_TURN_SPEED = 450;
const FALLING_SPEED = 750;

const TURN_SPEED = 20;
const TURN_UPDATE_INTERVA_MS = 10;
const MAX_ANGLE = 45;

var CLOUD_SPEED_MIN = 400;
var CLOUD_SPEED_MAX = 600;

// init phaser
var game = new Phaser.Game(490, 650, Phaser.AUTO, 'gameDiv');

// create our main state taht will contain the game
var mainstate = {
    preload() {
        // This function will be executed at the beginning
        // that's where we load the game's assets

        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/skydiverSmall.png');
        game.load.image('pipe', 'assets/gate.png');
        game.load.image('backcloud', 'assets/backCloud.png');
        game.load.image('logo', 'assets/logo.png');
        game.load.image('arm1', 'assets/arm.png');
        game.load.image('arm2', 'assets/arm2.png');
        game.load.image('head', 'assets/head.png');
        game.load.image('body', 'assets/body.png');
        game.load.image('bodypart1', 'assets/bodypart1.png');
        game.load.image('bodypart2', 'assets/bodypart2.png');
        game.load.image('bodypart3', 'assets/bodypart3.png');

        game.load.audio('jump', 'assets/jump.wav');
    },

    create() {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.

        // set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.jumpSound = game.add.audio('jump');

        this.backgroundClouds = game.add.group();
        this.backgroundClouds.enableBody = true;
        this.backgroundClouds.createMultiple(20, 'backcloud');


        this.logo = this.game.add.sprite(game.world.centerX, 150, 'logo');
        game.physics.arcade.enable(this.logo);
        this.logo.anchor.setTo(0.5, 0.5);

        this.controlText = game.add.text(game.world.centerX, 300, '0', {font: '20px Arial', fill: "#ffffff", fontWeight: 'bold'});
        this.controlText.anchor.setTo(0.5, 0.5);
        this.controlText.text = "PRESS ARROW KEYS TO START";


        this.pipes = game.add.group();
        this.pipes.enableBody = true; // add physics to the group
        this.pipes.createMultiple(20, 'pipe'); // create X pipes

        // Add gravity to the bird
        this.bird = this.game.add.sprite(game.world.centerX, 200, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.velocity.x = 0;
        this.bird.anchor.setTo(0.5, 0.0);

        // Setup controls
        const leftArrow = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        leftArrow.onDown.add(this.moveLeftDown, this);
        leftArrow.onUp.add(this.moveLeftUp, this);

        const rightArrow = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        rightArrow.onDown.add(this.moveRightDown, this);
        rightArrow.onUp.add(this.moveRightUp, this);

        this.backgroundCloudsTimer = game.time.events.loop(300, this.addCloud, this);
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, '0', {font: '30px Arial', fill: "#ffffff"});

        this.addCloud(false);
        this.addCloud(false);
        this.addCloud(false);
        this.addCloud(false);
        this.addCloud(false);

        this.gameStarted = false;

        this.emitter = game.add.emitter(0, 0, 100);

        this.emitter.makeParticles(['arm2', 'head', 'body', 'bodypart1', 'bodypart2', 'bodypart3'], 1, 10, true, false);
        this.emitter.bounce.setTo(200, 1);
        this.emitter.angularDrag = 360;

        this.gameOver = false;
        //game.input.onDown.add(this.particleBurst, this);
    },

    particleBurst() {
        if (!this.bird.alive) {
            return;
        }
        //  Position the this.emitter where the mouse/touch event was
        this.emitter.x = this.bird.body.center.x;
        this.emitter.y = this.bird.body.center.y;
        this.emitter.gravity = FALLING_SPEED;
        var px = this.bird.body.velocity.x;
        var py = this.bird.body.velocity.y;

        //px *= -1;
        //py *= -1;

        this.emitter.minParticleSpeed.set(-400, -FALLING_SPEED);
        this.emitter.maxParticleSpeed.set(400, 500);
        this.emitter.maxRotation = 360;



        //  The first parameter sets the effect to "explode" which means all particles are emitted at once
        //  The second gives each particle a 2000ms lifespan
        //  The third is ignored when using burst/explode mode
        //  The final parameter (10) is how many particles will be emitted in this single burst
        this.emitter.start(true, 2000, null, 20);

    },

    startGame() {
        this.gameStarted = true;
        this.logo.body.velocity.y = -(FALLING_SPEED);
        this.controlText.text = '';
    },

    moveLeftDown() {
        if (this.gameOver) {
            return;
        }

        if (!this.gameStarted) {
            this.startGame();
        }
        clearInterval(this.leftInterval);
        this.leftInterval = setInterval(() => {

            if (this.bird && this.bird.body && this.bird.body.velocity.x > -MAX_TURN_SPEED) {
                this.bird.body.velocity.x -= TURN_SPEED;
                this.bird.angle = this.bird.body.velocity.x / MAX_TURN_SPEED * MAX_ANGLE;

            }
        }, TURN_UPDATE_INTERVA_MS);
    },

    moveLeftUp() {
        clearInterval(this.leftInterval);
    },

    moveRightDown() {
        if (this.gameOver) {
            return;
        }

        if (!this.gameStarted) {
            this.startGame();
        }
        clearInterval(this.rightInterval);
        this.rightInterval = setInterval(() => {
            if (this.bird && this.bird.body && this.bird.body.velocity.x < MAX_TURN_SPEED) {
                this.bird.body.velocity.x += TURN_SPEED;
                this.bird.angle = this.bird.body.velocity.x / MAX_TURN_SPEED * MAX_ANGLE;
            }
        }, TURN_UPDATE_INTERVA_MS);
    },

    moveRightUp() {
        clearInterval(this.rightInterval);
    },

    update: function () {
        // This function is called 60 times per second
        // It contains the game's logic

        if (this.bird.inWorld === false) {
            this.restartGame();
        }

        //if (this.bird.angle < 20) {
        //    this.bird.angle += 1;
        //}

        game.physics.arcade
            .overlap(this.bird, this.pipes, this.hitPipe, null, this);
    },

    addCloud(bottom=true) {
        let cloud = this.backgroundClouds.getFirstDead();

        let y = 650;
        if (!bottom) {
            y = Math.floor(Math.random() * 650);
        }
        cloud.reset(Math.floor(Math.random() * 500) - 100, y);

        let rand = Math.random();
        cloud.alpha = rand;
        cloud.scale.setTo(rand+0.2, rand+0.2);

        cloud.body.velocity.y = -(Math.floor(rand * (CLOUD_SPEED_MAX - CLOUD_SPEED_MIN)) + CLOUD_SPEED_MIN);

        cloud.checkWorldBounds = true;
        cloud.outOfBoundsKill = true;
    },

    addOnePipe(x, y) {
        var pipe = this.pipes.getFirstDead();

        pipe.reset(x, y);

        pipe.body.checkCollision.up = false;
        pipe.body.velocity.y = -FALLING_SPEED;

        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes() {
        if (!this.gameStarted) {
            return;
        }
        const hole = Math.floor(Math.random() * 5) + 1;
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) {
                this.addOnePipe(i * 60 + 10 , 650);
            }
        }
        this.score += 1;
        this.labelScore.text = this.score;
    },

    jump: function () {
        if (this.bird.alive === false) {
            return;
        }

        this.jumpSound.play();
        this.bird.body.velocity.y = -350;
        game.add.tween(this.bird)
            .to({angle: -20}, 100)
            .start();
    },

    hitPipe: function () {
        this.bird.alpha = 0;
        this.particleBurst();
        if (!this.gameOver) {
            this.gameOver = true;
            setTimeout(this.restartGame, 1000);
        }
        //this.restartGame();
        //if (this.bird.alive == false) {
        //    return;
        //}

        this.bird.alive = false;

        game.time.events.remove(this.backgroundCloudsTimer);
        //this.backgroundClouds.forEachAlive(function(cloud) {
        //    cloud.body.velocity.y = 0;
        //}, this);
        game.time.events.remove(this.timer);
        //this.pipes.forEachAlive(function(pipe) {
        //    pipe.body.velocity.y = 0;
        //}, this);
    },

    restartGame: function () {
        clearInterval(this.rightInterval);
        clearInterval(this.leftInterval);
        game.state.start('main');
    },
};


// Add and start the 'main state to start the game
game.state.add('main', mainstate);
game.state.start('main');