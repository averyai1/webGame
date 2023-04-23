let platforms;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: {
        target: 60,
        useElapsedTime: false, // Set to false for fixed time step
        forceSetTimeOut: false // Disable forceSetTimeOut
    }
};

const game = new Phaser.Game(config);



function preload() {
    //player sprite
    this.load.image('player', 'assets/player1.png');

    //platforms 
    this.load.image('block', 'assets/smallplat2.png');
    this.load.image('longblock', 'assets/brighter.png');
    this.load.image('mediumblock', 'assets/mediumplat.png');

    //missile and missile launcher
    this.load.image('missile', 'assets/missile1.png');
    this.load.image('missileLauncher', 'assets/launcher.png');
    
    //turrets and bullet + noises
    this.load.image('turret', 'assets/turret3.png');
    this.load.image('bullet', 'assets/orb3.png');
    this.load.audio('turretFire', 'assets/shot4.mp3');
    this.load.audio('bulletHitPlayer', 'assets/hit.mp3');

    //background and background music
    this.load.audio('bgm', 'assets/meehan_loop2.mp3');
    this.load.image('background', 'assets/newback.png');


    this.load.spritesheet('explosion', 'path/to/explosion_spritesheet.png', {
        frameWidth: 64, // Replace with the width of each frame
        frameHeight: 64, // Replace with the height of each frame
        endFrame: 23 // Replace with the number of frames in the spritesheet minus 1
    });
    
}

function create() {
    //bullet
    this.bullets = this.physics.add.group();

    this.isGameOver = false;

this.anims.create({
    key: 'explode',
    frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23 }),
    frameRate: 30,
    repeat: 0,
    hideOnComplete: true
});

    //MUSIC
    this.bgm = this.sound.add('bgm', { loop: true },);
    this.bgm.play({ volume: .5 });

    // Add background image
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0); // Set the origin to the top-left corner

    // Calculate the scale for the background image to cover the entire game map
    const backgroundScaleX = 10000 / this.background.width; // Assuming 10000 is the width of the game map
    const backgroundScaleY = window.innerHeight / this.background.height;
    this.background.setScale(backgroundScaleX, backgroundScaleY);

    // Set up single air jump
    this.airJumpUsed = false;

    // Set up backblock color and world bounds
    this.cameras.main.setBackgroundColor('#ADD8E6');
    this.physics.world.setBounds(0, 0, 10000, window.innerHeight);
    // Create platform group
    platforms = this.physics.add.staticGroup();
    const heightRatio = window.innerHeight / 1000; 
        
        const thinPlatformCoordinates = [
            { x: 200, y: 900 },
            { x: 800, y: 800 },
            { x: 1400, y: 600 },
            { x: 2600, y: 500 },
            { x: 3400, y: 600 },
            { x: 4200, y: 700 },
            { x: 5000, y: 600 },
            { x: 5800, y: 500 },
            { x: 6600, y: 600 },
            { x: 7400, y: 700 },
            { x: 8200, y: 600 },
            { x: 9000, y: 500 },
            { x: 9800, y: 600 }
          ];
          
          thinPlatforms = this.physics.add.staticGroup();
          thinPlatformCoordinates.forEach(coords => {
            thinPlatforms.create(coords.x, coords.y * heightRatio, 'longblock').setScale(1, .75).refreshBody();
          });

          const thinnerPlatformCoordinates = [
            { x: 1800, y:  200},
            { x: 2000, y: 650 },
            { x: 2700, y: 700 },
            { x: 2750, y:  250},
            { x: 3800, y:  325},
            { x: 4500, y:  200},
            { x: 2000, y: 650 },
     
          ];
          
          thinnerPlatforms = this.physics.add.staticGroup();          
          thinnerPlatformCoordinates.forEach(coords => {
            thinnerPlatforms.create(coords.x, coords.y * heightRatio, 'mediumblock').setScale(1, 1).refreshBody();
          });

        const platformCoordinates =[
            { x: 200, y: 550 },
            { x: 500, y:  400},
            { x: 800, y: 550 },
            { x: 950, y:  300},
            { x: 1200, y: 400 },
            { x: 1500, y: 300 },
            { x: 1700, y: 450 },
            { x: 2000, y: 400 },
            { x: 2300, y: 500 },
            { x: 2450, y:  300},
            { x: 2900, y: 450 },
            { x: 3200, y: 400 },
            { x: 3600, y: 100 },
            { x: 4000, y: 500 },
            { x: 4300, y:  300},
            { x: 4600, y: 400 },
            { x: 5000, y: 300 },
            { x: 5500, y: 400 },
            { x: 5900, y: 500 },
            { x: 6400, y: 400 },
            { x: 6900, y: 350 },
            { x: 7400, y: 400 },
            { x: 7800, y: 500 },
            { x: 8300, y: 300 },
            { x: 8800, y: 400 },
            { x: 9300, y: 500 },
            { x: 9600, y: 400 }
          ];
 
    // Create turret group
    this.turrets = this.physics.add.staticGroup();
    //PLACE THEM
    platformCoordinates.forEach((coords, index) => {
        platforms.create(coords.x, coords.y * heightRatio, 'block').setScale(1).refreshBody();

        if ((index + 1) % 5 === 0) {
                const turret = this.turrets.create(coords.x, (coords.y * heightRatio) -102, 'turret');
                turret.setScale(1);
        }
    });
            
    // PLAYER
    this.player = this.physics.add.sprite(100, 450, 'player');
    
    //player bounds
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(.8);
    // Make player collide with platforms
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.player, thinPlatforms);
    this.physics.add.collider(this.player, thinnerPlatforms);
    // Set up wall-jumping
    this.wallJump = false;
    this.wallJumpTimer = 0;
    this.wallJumpDuration = 1000;
    this.wallJumpSpeed = 600;

    // Set up camera with smoother lerp values
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05); // Adjust the lerp values
    this.cameras.main.setBounds(0, 0, 10000, window.innerHeight);
    //sizing game window
    window.addEventListener('resize', () => {
        game.scale.setGameSize(window.innerWidth, window.innerHeight);
        this.physics.world.setBounds(0, 0, 10000, window.innerHeight);
        this.cameras.main.setBounds(0, 0, 10000, window.innerHeight);
    });

    // Add missile launcher to the scene as a static object
    this.missileLauncher = this.physics.add.staticImage(50, 50, 'missileLauncher');
    this.missileLauncher.setScale(.5);
    // Add missile to the scene and set its initial position to be the same as the launcher
    this.missile = this.physics.add.sprite(50, 50, 'missile');
    this.missile.setScale(1);
    this.missile.setActive(false);
    this.missile.setVisible(false);
    // Missile speed and group
    this.missiles = this.physics.add.group();
    this.playerFirstMove = false;
    this.missileSpeed = 200;

    // Arrow key movement
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', wallJump, this);

    const resizeGameObjects = () => {
        // Update the game size, world bounds, camera bounds, and background size
        game.scale.setGameSize(window.innerWidth, window.innerHeight);
        this.physics.world.setBounds(0, 0, 10000, window.innerHeight);
        this.cameras.main.setBounds(0, 0, 10000, window.innerHeight);
                
        // Update the background image scale
        this.background.setScale(10000 / this.background.width, window.innerHeight / this.background.height);
    };
            
    window.addEventListener('resize', resizeGameObjects);

    //Add collider for player and bullet
    this.physics.add.collider(this.player, this.bullets, gameOver, null, this, );


    this.physics.add.collider(this.player, this.bullets, (player, bullet) => {
        bullet.destroy();
    }, null, this);

    
}

function update(time, delta) {

    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-320);
        this.player.setFlipX(false);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(320);
        this.player.setFlipX(true);
    } else {
        this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && (this.player.body.onFloor() || this.wallJump)) {
        this.player.setVelocityY(-660);
        if (this.wallJump) {
            this.wallJump = false;
            this.wallJumpTimer = 0;
        }
    }

    if (this.cursors.down.isDown) {
        this.physics.world.gravity.y = 2000;
    } else {
        this.physics.world.gravity.y = 750;
    }

    const onblock = this.player.body.onFloor();

    // Reset air jump when the player is on the block
    if (onblock) {
        this.airJumpUsed = false;
    }
    
    if (this.cursors.up.isDown && (onblock || !this.airJumpUsed)) {
        this.player.setVelocityY(-660);
    
        if (!onblock) {
            this.airJumpUsed = true;
        }
    
        if (this.wallJump) {
            this.wallJump = false;
            this.wallJumpTimer = 0;
        }
    }
    
    // Hold turret fire til player in fram
    const visibleTurrets = this.turrets.getChildren().filter(turret => {
        return this.cameras.main.worldView.contains(turret.x, turret.y);
    });

    visibleTurrets.forEach(turret => {
        if (this.playerFirstMove && (!turret.nextFire || time > turret.nextFire)) {
            turret.nextFire = time + 2000;
            fireBullet.call(this, turret);
            this.sound.play('turretFire', { volume: 1 });
        }
    });

    // Check if the player touches the bottom 2% of the screen
    let cameraBottomY = this.cameras.main.scrollY + this.cameras.main.height;
    let thresholdY = cameraBottomY - (this.cameras.main.height * 0.02);
    if (this.player.y > thresholdY - this.player.displayHeight / 2) {
        gameOver.call(this); // Call the gameOver function
    }

// Wall jump
const touchingLeft = this.player.body.touching.left;
const touchingRight = this.player.body.touching.right;
if ((touchingLeft || touchingRight) && this.cursors.up.isDown && !this.wallJump) {
    this.player.setVelocityY(-660);
    this.player.setVelocityX(touchingLeft ? 660 : -660);
    this.wallJump = true;
    this.wallJumpTimer = this.wallJumpDuration;
} else if (this.wallJump && this.wallJumpTimer > 0) {
    this.wallJumpTimer -= delta;
} else {
    this.wallJump = false;
}

    // Check for player movement (to set missile)
    if (!this.playerFirstMove && (this.cursors.left.isDown || this.cursors.right.isDown)) {
        this.playerFirstMove = true;
        fireMissile.call(this);
    }

    // Missile
    this.missiles.getChildren().forEach(missile => {
    const direction = new Phaser.Math.Vector2(this.player.x - missile.x, this.player.y - missile.y).normalize();
    missile.setVelocity(direction.x * this.missileSpeed, direction.y * this.missileSpeed);

    // Missile rotate to player
    const angle = Phaser.Math.Angle.Between(missile.x, missile.y, this.player.x, this.player.y);
    missile.setRotation(angle + Math.PI / .5); // Add Math.PI / 2 to the angle
    });


}

function fireBullet(turret) {
    const bullet = this.bullets.create(turret.x, turret.y, 'bullet');
    bullet.body.allowGravity = false;
    bullet.setScale(1);
    const angle = Phaser.Math.Angle.Between(turret.x, turret.y, this.player.x, this.player.y);
    const speed = 400;
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
}

function fireMissile() {
    const missile = this.missiles.create(this.missileLauncher.x, this.missileLauncher.y, 'missile');
    missile.setCollideWorldBounds(true);
    missile.body.allowGravity = false;
    missile.setScale(.125);
    const angle = Phaser.Math.Angle.Between(missile.x, missile.y, this.player.x, this.player.y);
    missile.setRotation(angle + Math.PI / 2); 
}

function wallJump() {
    if (this.wallJumpTimer <= 0) {
        // Check touching wall
        const touchingLeft = this.player.body.touching.left;
        const touchingRight = this.player.body.touching.right;
        if (touchingLeft || touchingRight) {
            //wall jumping info
            this.player.setVelocityY(-this.wallJumpSpeed);
            this.player.setVelocityX(touchingLeft ? this.wallJumpSpeed : -this.wallJumpSpeed);
            this.wallJump = true;
            this.wallJumpTimer = this.wallJumpDuration;
        }
    }
}

function updateVolume(volumeChange) {
    const newVolume = Phaser.Math.Clamp(this.sound.volume + volumeChange, 0, 1);
    this.sound.volume = newVolume;
}

function gameOver() {
    this.isGameOver = true;

    // Stop player movement
    this.player.setVelocity(0, 0);
    this.player.anims.stop();

    // Add a short delay before restarting the scene
    this.time.delayedCall(0, () => {
        this.scene.restart();
    });
}

