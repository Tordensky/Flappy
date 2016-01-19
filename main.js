

// init phaser
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

// create our main state taht will contain the game
var mainstate = {
    preload: function () {
        // This function will be executed at the beginning
        // that's where we load the game's assets

        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');

        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function () {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.

        // set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.jumpSound = game.add.audio('jump');

        this.bird = this.game.add.sprite(100, 245, 'bird');

        this.pipes = game.add.group();
        this.pipes.enableBody = true; // add physics to the group
        this.pipes.createMultiple(20, 'pipe'); // create X pipes

        // Add gravity to the bird
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000 ;
        this.bird.anchor.setTo(-0.2, 0.5);

        // call the 'jump' function on key press
        var spacekey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spacekey.onDown.add(this.jump, this);

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, '0', {font: '30px Arial', fill: "#ffffff"});
    },

    update: function () {
        // This function is called 60 times per second
        // It contains the game's logic

        if (this.bird.inWorld == false) {
            this.restartGame();
        }

        if (this.bird.angle < 20) {
            this.bird.angle += 1;
        }

        game.physics.arcade
            .overlap(this.bird, this.pipes, this.hitPipe, null, this);
    },

    addOnePipe: function (x, y) {
        var pipe = this.pipes.getFirstDead();

        pipe.reset(x, y);

        pipe.body.velocity.x = -200;

        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function () {
        var hole = Math.floor(Math.random() * 5) + 1;
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) {
                this.addOnePipe(400, i * 60 + 10);
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
        if (this.bird.alive == false) {
            return;
        }

        this.bird.alive = false;

        game.time.events.remove(this.timer);
        this.pipes.forEachAlive(function(pipe) {
            pipe.body.velocity.x = 0;
        }, this);
    },

    restartGame: function () {
        game.state.start('main');
    },
};


// Add and start the 'main state to start the game
game.state.add('main', mainstate);
game.state.start('main');