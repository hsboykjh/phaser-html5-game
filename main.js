const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 400;
const PIPE_GAP = 70;

// Create our 'main' state that will contain the game
let mainState = {

    preload: function() {
        // This function will be executed at the beginning
        // That's where we load the images and sounds
        game.load.image('pipe-down', 'assets/images/pipe-long-down.png');
        game.load.image('pipe-up', 'assets/images/pipe-long-up.png');
        game.load.image('coin', 'assets/images/coin.png');
        game.load.spritesheet('birds', 'assets/images/birds.png', 86, 60, 3);

        //add music
        game.load.audio('mario', 'assets/sound/SuperMarioBros.mp3');
        game.load.audio('gameover', 'assets/sound/gameover.mp3');
        game.load.audio('jump', 'assets/sound/jump.wav');
        game.load.audio('coin', 'assets/sound/coin.wav');
    },

    create: function() {

        if(game.device.desktop === false){
            // Set the scaling mode to SHOW_ALL to show all the game
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            // Set a minimum and maximum size for the game
            // Here the minimum is half the game size
            // And the maximum is the original game size
            game.scale.setMinMax(game.width/4, game.height/2,
                game.width/2, game.height);

            // Center the game horizontally and vertically
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
        }

        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.
        game.stage.backgroundColor = '#71c5cf';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = game.add.group();
        this.coins = game.add.group();

        this.createBird();
        this.createLabels();
        this.createLoopEvent();

        this.createSound();
        this.setGameStatus('init');
    },

    update: function() {

        if(this.getGameStatus() === 'playing'){
            if (this.bird.angle < 20)
                this.bird.angle += 1;

            // This function is called 60 times per second
            // It contains the game's logic
            if (this.bird.y < 0 || this.bird.y > 600)
                this.stopGame();

            game.physics.arcade.overlap(this.bird, this.pipes, this.stopGame, null, this);
            game.physics.arcade.overlap(this.bird, this.coins, this.getCoin, null, this);
        }
    },

    // Make the bird jump
    jump: function() {

        if(this.getGameStatus() === 'playing'){
            this.jumpSound.play();
            // Create an animation on the bird
            let animation = game.add.tween(this.bird);

            // Change the angle of the bird to -20° in 100 milliseconds
            animation.to({angle: -20}, 100);

            // And start the animation
            animation.start();

            // Add a vertical velocity to the bird
            this.bird.body.velocity.y = -250;
        }
    },

    getCoin: function(bird, coin){
        this.coinSound.play();
        coin.kill();
        this.increaseScore();
    },

    startGame: function(){

        this.bird.position.x = 100;
        this.bird.position.y = 200;
        this.bird.body.gravity.y = 500;
        this.music.play();
        this.setGameStatus('playing');

        if(!this.timer){
            this.timer = game.time.events.loop(2000, this.addRowOfPipes, this);
            console.log("new time loop event was created : ",this.time);
            game.time.events.resume();
        }else{
            console.log("some time loop event : ",this.time);
            game.time.events.resume();
        }
    },

    stopGame: function(){

        if(this.getGameStatus() !== 'stop'){
            this.bird.body.gravity.y = 0;
            this.bird.body.velocity.y = 0;

            this.restart_label.visible = true;
            this.music.stop();
            this.gameoverMusic.play();
            game.time.events.pause();
            this.setGameStatus('stop');

            this.pipes.setAll('body.velocity.x', 0);
            this.coins.setAll('body.velocity.x', 0);

            // console.log("this.pipes : ",this.pipes);
        }
    },

    pauseGame: function(){
        if(this.getGameStatus() === 'playing'){
            game.paused = true;
            this.setGameStatus('pause');
            this.music.pause();
            // this.pause_label.setText('Resume');
        }else if(this.getGameStatus() === 'pause'){
            game.paused = false;
            this.setGameStatus('playing');
            this.music.resume();
            // this.pause_label.setText('Pause');
        }
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        // game.state.start('main');
        // this.labelScore.text = this.score;
        this.restart_label.visible = false;
        this.pipes.removeAll();
        this.coins.removeAll();
        this.score = 0;
        this.setScore(0);
        this.startGame();
    },

    createBird: function(){
        this.bird = game.add.sprite(100, 200, 'birds');
        this.bird.scale.setTo(0.5, 0.5);
        this.bird.animations.add('flying');
        this.bird.animations.play('flying', 10, true);
        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5);

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 0;

        //jump setting
        game.input.onDown.add(this.jump, this);
    },

    createSound: function(){
        this.music = game.add.audio('mario');
        this.music.volume = 0.3;

        this.gameoverMusic = game.add.audio('gameover');
        this.jumpSound = game.add.audio('jump');
        this.coinSound = game.add.audio('coin');
        this.coinSound.volume = 1.3;
    },

    createLabels: function(){
        this.createStartLabel();
        this.createScoreLabel();
        this.createReplayLabel();
    },

    createScoreLabel: function(){

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0",
            { font: "24px Arial", fill: "#ffffff" });
        this.setScore(0);
    },

    createStartLabel: function(){
        let self = this;
        this.start_label = game.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'Start', { font: '40px Arial Black', fill: '#fff'});
        this.start_label.anchor.x = 0.5;
        this.start_label.anchor.y = 0.5;
        // this.start_label.padding.set(20,20,20,20);
        this.start_label.fontWeight = 'bold';
        //	Stroke color and thickness
        this.start_label.stroke = '#000000';
        this.start_label.strokeThickness = 6;
        this.start_label.fill = '#43d637';

        this.start_label.inputEnabled = true;
        this.start_label.visible = true;
        this.start_label.events.onInputUp.add(function () {
            console.log('restartGame is clicked');
            self.startGame();
            self.start_label.visible = false;
        });
    },

    createReplayLabel: function(){
        let self = this;
        this.restart_label = game.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'Replay', { font: '40px Arial Black', fill: '#fff'});
        this.restart_label.anchor.x = 0.5;
        this.restart_label.anchor.y = 0.5;
        // this.restart_label.padding.set(20,20,20,20);
        this.restart_label.fontWeight = 'bold';
        //	Stroke color and thickness
        this.restart_label.stroke = '#000000';
        this.restart_label.strokeThickness = 6;
        this.restart_label.fill = '#43d637';

        this.restart_label.inputEnabled = true;
        this.restart_label.visible = false;
        this.restart_label.events.onInputUp.add(function () {
            console.log('restartGame is clicked');
            self.restartGame();
        });
    },

    createLoopEvent: function(){
        this.timer = game.time.events.loop(2000, this.addRowOfPipes, this);
        game.time.events.pause(this.timer);
    },

    addOnePipe: function(x, y) {

        if(this.pipes.children.length < 16){

            let pipe1 = game.add.sprite(x, y + PIPE_GAP , 'pipe-down');
            let pipe2 = game.add.sprite(x, y - PIPE_GAP , 'pipe-up');

            // Add the pipe to our previously created group
            pipe2.anchor.y=1;
            this.pipes.add(pipe1);
            this.pipes.add(pipe2);

            // Enable physics on the pipe
            this.pipeConfig(pipe1);
            this.pipeConfig(pipe2);
        }else{

            let newPipe1 = this.pipes.getFirstDead();

            if (newPipe1) {
                //  And bring it back to life
                newPipe1.reset(x, y + PIPE_GAP );
                this.pipeConfig(newPipe1);
            }

            let newPipe2 = this.pipes.getFirstDead();
            if (newPipe2) {
                //  And bring it back to life
                newPipe2.reset(x, y - PIPE_GAP );
                newPipe2.anchor.y=1;
                this.pipeConfig(newPipe2);
            }
        }

        if(this.coins.children.length < 8){
            console.log('coin : ',x , y);
            let coin = game.add.sprite(x , y , 'coin');
            coin.anchor.x = 0;
            coin.anchor.y = 0.5;
            this.coins.add(coin);
            this.pipeConfig(coin);
        }else{
            let newCoin = this.coins.getFirstDead();
            if (newCoin) {
                newCoin.reset(x, y);
                newCoin.anchor.x = 0;
                newCoin.anchor.y = 0.5;
                this.pipeConfig(newCoin);
            }
        }
    },

    pipeConfig(newPipe){
        game.physics.arcade.enable(newPipe);
        newPipe.body.velocity.x = -100;
        newPipe.checkWorldBounds = true;
        newPipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {

        if(this.getGameStatus() === 'playing'){
            // Randomly pick a number between 1 and 5
            // This will be the hole position
            let hole = Math.floor(Math.random() * 5);
            this.addOnePipe(SCREEN_WIDTH, hole * 40 + 100);
            // this.increaseScore();
        }
    },

    increaseScore(){
        this.score += 1;
        this.setScore(this.score);
    },

    setScore(score){
        this.labelScore.text = 'Score : '+score;
    },

    setGameStatus(status){
        this.gameStatus = status;
    },

    getGameStatus(){
        return this.gameStatus;
    },

    render() {
        // game.debug.spriteInfo(this.bird, 20, 32);
        // game.debug.text('One item will be resurrected every second', 32, 32);
        // game.debug.text('Living: ' + this.pipes.countLiving() + '   Dead: ' + this.pipes.countDead(), 32, 64);
        // game.debug.text('events paused: ' + game.time.events.paused, 32, 64);
        // game.debug.text('events running: ' + game.time.events.running, 32, 96);
        // game.debug.text('events length: ' + game.time.events.length, 32, 126);
        // console.log("game.time.events : ", game.time.events.pause );
    }
};

// Initialize Phaser, and create a 400px by 490px game
let game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');