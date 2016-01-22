
const MAX_SPEED = 350;
const FALLING_SPEED = -400;
const TURN_SPEED = 25;
const TURN_UPDATE_INTERVA_MS = 10;
const MAX_ANGLE = 30;

// init phaser
var game = new Phaser.Game(490, 650, Phaser.AUTO, 'gameDiv');

// create our main state taht will contain the game
var mainstate = {
    preload() {
        // This function will be executed at the beginning
        // that's where we load the game's assets

        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/skydiverSmall.png');
        game.load.image('pipe', 'assets/cloudSmall.png');

        game.load.audio('jump', 'assets/jump.wav');
    },

    create() {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.

        // set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.jumpSound = game.add.audio('jump');

        this.bird = this.game.add.sprite(200, 200, 'bird');

        this.pipes = game.add.group();
        this.pipes.enableBody = true; // add physics to the group
        this.pipes.createMultiple(50, 'pipe'); // create X pipes

        // Add gravity to the bird
        game.physics.arcade.enable(this.bird);
        this.bird.body.velocity.x = 0;
        this.bird.anchor.setTo(0.5, 0.0);

        // Setup controls
        // const spacekey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // spacekey.onDown.add(this.jump, this);

        //const upArrow = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        //upArrow.onDown.add(this.jump, this);

        const leftArrow = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        leftArrow.onDown.add(this.moveLeftDown, this);
        leftArrow.onUp.add(this.moveLeftUp, this);

        const rightArrow = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        rightArrow.onDown.add(this.moveRightDown, this);
        rightArrow.onUp.add(this.moveRightUp, this);

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, '0', {font: '30px Arial', fill: "#ffffff"});
    },

    moveLeftDown() {
        this.leftInterval = setInterval(() => {

            if (this.bird && this.bird.body.velocity.x > -MAX_SPEED) {
                this.bird.body.velocity.x -= TURN_SPEED;
                this.bird.angle = this.bird.body.velocity.x / MAX_SPEED * MAX_ANGLE;

            }
        }, TURN_UPDATE_INTERVA_MS);
    },

    moveLeftUp() {
        clearInterval(this.leftInterval);
    },

    moveRightDown() {
        this.rightInterval = setInterval(() => {

            if (this.bird && this.bird.body.velocity.x < MAX_SPEED) {
                this.bird.body.velocity.x += TURN_SPEED;
                this.bird.angle = this.bird.body.velocity.x / MAX_SPEED * MAX_ANGLE;
            }
        }, TURN_UPDATE_INTERVA_MS);
    },

    moveRightUp() {
        clearInterval(this.rightInterval);
    },

    update: function () {
        // This function is called 60 times per second
        // It contains the game's logic

        if (this.bird.inWorld == false) {
            this.restartGame();
        }

        //if (this.bird.angle < 20) {
        //    this.bird.angle += 1;
        //}

        game.physics.arcade
            .overlap(this.bird, this.pipes, this.hitPipe, null, this);
    },

    addOnePipe(x, y) {
        var pipe = this.pipes.getFirstDead();

        pipe.reset(x, y);

        pipe.body.velocity.y = FALLING_SPEED;

        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes() {
        const hole = Math.floor(Math.random() * 5) + 1;
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) {
                this.addOnePipe(i * 60 + 10 , 600);
            }
        }
        this.score += 1;
        this.labelScore.text = this.score;
    },

    jump: function () {
        if (this.bird.alive == false) {
            return;
        }

        this.jumpSound.play();
        this.bird.body.velocity.y = -350;
        game.add.tween(this.bird)
            .to({angle: -20}, 100)
            .start();
    },

    hitPipe: function () {
        this.restartGame();
        //if (this.bird.alive == false) {
        //    return;
        //}

        this.bird.alive = false;
        this.bird.body.velocity.x = 1000;

        game.time.events.remove(this.timer);
        this.pipes.forEachAlive(function(pipe) {
            pipe.body.velocity.y = 0;
        }, this);
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