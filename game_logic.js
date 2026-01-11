/**
         * SUT CTF RPG ENGINE v5.1 (Custom Coordinates)
         */
        const game = {
            canvas: document.getElementById('game-canvas'),
            ctx: null,
            width: 800,
            height: 600,
            
            state: 'playing',
            level: 1,
            
            // Assets
            mapImage: new Image(),
            playerSprite: new Image(),
            assetsLoaded: 0,

            // World
            worldWidth: 0, 
            worldHeight: 0,
            camera: { x: 0, y: 0 },

            // Entities
            player: { 
                x: 3500, y: 500, // Starting at Gate 1
                width: 48, height: 64, 
                speed: 5, 
                frameX: 0, frameY: 0, 
                moving: false, 
                direction: 0,
                hitbox: { x: 0, y: 0, w: 32, h: 20, offsetX: 8, offsetY: 44 }
            },
            
            obstacles: [{"x":418,"y":376,"w":296,"h":106}, {"x":801,"y":389,"w":290,"h":97}, {"x":544,"y":518,"w":140,"h":76}, 
                {"x":532,"y":621,"w":178,"h":112}, {"x":150,"y":734,"w":235,"h":132}, {"x":508,"y":738,"w":180,"h":140}, {"x":772,"y":514,"w":176,"h":107}, 
                {"x":756,"y":630,"w":196,"h":106}, {"x":728,"y":757,"w":170,"h":139}, {"x":1004,"y":526,"w":215,"h":98}, {"x":1019,"y":645,"w":213,"h":97}, 
                {"x":1008,"y":752,"w":225,"h":149}, {"x":1286,"y":517,"w":237,"h":134}, {"x":1305,"y":666,"w":199,"h":243}, {"x":1577,"y":518,"w":202,"h":164}, 
                {"x":1800,"y":515,"w":233,"h":179}, {"x":1562,"y":778,"w":250,"h":150}, {"x":1612,"y":977,"w":230,"h":437}, {"x":1204,"y":974,"w":250,"h":578}, 
                {"x":664,"y":1350,"w":450,"h":192}, {"x":1496,"y":1482,"w":411,"h":101}, {"x":1961,"y":998,"w":488,"h":552},{"x":62,"y":164,"w":1414,"h":136},
                {"x":1483,"y":169,"w":805,"h":132},{"x":1546,"y":329,"w":743,"h":95},{"x":1540,"y":302,"w":749,"h":36},{"x":1846,"y":700,"w":190,"h":221},
                {"x":2086,"y":475,"w":259,"h":454},{"x":2330,"y":775,"w":60,"h":165},{"x":1944,"y":987,"w":493,"h":377},{"x":1970,"y":1376,"w":477,"h":245},
                {"x":1957,"y":1360,"w":494,"h":31},{"x":892,"y":1670,"w":1257,"h":64},{"x":2148,"y":1671,"w":321,"h":56},{"x":263,"y":1381,"w":338,"h":113},
                {"x":351,"y":1504,"w":266,"h":108},{"x":428,"y":1624,"w":223,"h":61},{"x":53,"y":1081,"w":304,"h":145},{"x":211,"y":1009,"w":333,"h":178},
                {"x":494,"y":979,"w":149,"h":203},{"x":138,"y":1042,"w":84,"h":55},{"x":172,"y":1022,"w":68,"h":33},{"x":101,"y":1059,"w":59,"h":47},
                {"x":356,"y":1178,"w":263,"h":248},{"x":140,"y":1224,"w":256,"h":109},{"x":196,"y":1332,"w":204,"h":73},{"x":18,"y":1379,"w":99,"h":202},
                {"x":20,"y":1582,"w":125,"h":129},{"x":130,"y":1479,"w":55,"h":156},{"x":192,"y":1531,"w":50,"h":95},{"x":240,"y":1567,"w":32,"h":82},
                {"x":280,"y":1626,"w":27,"h":78},{"x":307,"y":1669,"w":33,"h":63},{"x":154,"y":1640,"w":142,"h":112},{"x":41,"y":310,"w":300,"h":315},
                {"x":39,"y":646,"w":161,"h":54},{"x":20,"y":620,"w":190,"h":50},{"x":33,"y":847,"w":99,"h":77},{"x":141,"y":869,"w":94,"h":88},
                {"x":101,"y":931,"w":67,"h":51},{"x":303,"y":830,"w":96,"h":71},{"x":1500,"y":675,"w":150,"h":88},{"x":2208,"y":113,"w":253,"h":68},
                {"x":1146,"y":326,"w":351,"h":71},{"x":1488,"y":311,"w":50,"h":40},{"x":798,"y":1038,"w":168,"h":95},{"x":1020,"y":1010,"w":108,"h":89},{"x":787,"y":1286,"w":80,"h":51},{"x":1038,"y":1134,"w":88,"h":195},{"x":692,"y":1247,"w":62,"h":73},{"x":706,"y":1056,"w":40,"h":120},{"x":721,"y":961,"w":69,"h":56}],

            // --- CUSTOM CHECKPOINTS ---
            // Set these using coordinates from map_tool.html
            checkpoints: [
                { id: 1, x: 418, y: 376, w: 296, h: 106, width: 296, height: 106, color: '#ef4444', active: true, label: 'PHASE 1: DIGI', icon: '📡' },
                { id: 2, x: 801, y: 389, w: 290, h: 97, width: 290, height: 97, color: '#fbbf24', active: false, label: 'PHASE 2: LIBRARY', icon: '🏠' },
                { id: 3, x: 544, y: 518, w: 158, h: 76, width: 158, height: 76, color: '#a855f7', active: false, label: 'PHASE 3: F10 ADMIN', icon: '🏫' }
            ],

            config: {
                symmetricKey: "SUT-BOMB-SECRET-2026",
                otpSeed: "JBSWY3DPEHPK3PXP",
                locationCode: "F109"
            },
            timeLeft: 7200,
            timerInterval: null,
            otpInterval: null,
            currentOTP: null,

            init: function() {
                this.ctx = this.canvas.getContext('2d');
                this.resize();
                window.addEventListener('resize', () => this.resize());
                
                // No more auto-loading obstacles from localStorage here, use the fixed array above.

                this.keys = {};
                window.addEventListener('keydown', e => this.keys[e.key] = true);
                window.addEventListener('keyup', e => this.keys[e.key] = false);

                this.mapImage.src = 'sut_map.png'; 
                this.playerSprite.src = 'https://i.imgur.com/f2a1p7I.png'; 
                
                this.mapImage.onload = () => {
                    this.assetsLoaded++;
                    // 1. Set World Dimensions strictly from Image
                    this.worldWidth = this.mapImage.naturalWidth;
                    this.worldHeight = this.mapImage.naturalHeight;
                    console.log(`World Size Set: ${this.worldWidth}x${this.worldHeight}`);
                    
                    // 2. Validate Dimensions
                    if(this.worldWidth === 0 || this.worldHeight === 0) {
                        alert("Error: Map image loaded but has 0 dimensions. Please check the image file.");
                        return;
                    }

                    // 3. Initial Spawn Position (Center safe spot)
                    // You can change this to a specific coordinate if you want
                    this.player.x = this.worldWidth / 2;
                    this.player.y = this.worldHeight / 2;
                };
                
                this.playerSprite.onload = () => this.assetsLoaded++;

                this.startTimer();
                this.gameLoop();
            },        

            resize: function() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.ctx.imageSmoothingEnabled = false; // Keep pixel art sharp
            },

            startTimer: function() {
                this.timerInterval = setInterval(() => {
                    if (this.state !== 'playing' && this.state !== 'paused') return;
                    if (this.timeLeft <= 0) { this.gameOver(); return; }
                    this.timeLeft--;
                    const h = Math.floor(this.timeLeft / 3600).toString().padStart(2, '0');
                    const m = Math.floor((this.timeLeft % 3600) / 60).toString().padStart(2, '0');
                    const s = (this.timeLeft % 60).toString().padStart(2, '0');
                    document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
                }, 1000);
            },

            update: function() {
                if (this.state !== 'playing') return;

                this.player.moving = false;
                let dx = 0; let dy = 0;

                if (this.keys['ArrowUp'] || this.keys['w']) { dy = -this.player.speed; this.player.direction = 3; this.player.moving = true; }
                if (this.keys['ArrowDown'] || this.keys['s']) { dy = this.player.speed; this.player.direction = 0; this.player.moving = true; }
                if (this.keys['ArrowLeft'] || this.keys['a']) { dx = -this.player.speed; this.player.direction = 1; this.player.moving = true; }
                if (this.keys['ArrowRight'] || this.keys['d']) { dx = this.player.speed; this.player.direction = 2; this.player.moving = true; }

                // COLLISION
                const nextX = this.player.x + dx;
                const nextY = this.player.y + dy;
                const hitBox = { x: nextX + this.player.hitbox.offsetX, y: nextY + this.player.hitbox.offsetY, w: this.player.hitbox.w, h: this.player.hitbox.h };

                let collided = false;
                for (let wall of this.obstacles) {
                    if (this.checkRectCollision(hitBox, wall)) { collided = true; break; }
                }

                if (!collided) {
                    this.player.x = nextX;
                    this.player.y = nextY;
                }

                // World Boundaries (Strict Clamp)
                if (this.worldWidth > 0 && this.worldHeight > 0) {
                    this.player.x = Math.max(0, Math.min(this.player.x, this.worldWidth - this.player.width));
                    this.player.y = Math.max(0, Math.min(this.player.y, this.worldHeight - this.player.height));
                }

                // Camera
                this.camera.x = this.player.x - this.canvas.width / 2;
                this.camera.y = this.player.y - this.canvas.height / 2;
                this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
                this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.canvas.height));

                // Animation
                if (this.player.moving) {
                    if (Date.now() % 200 < 50) this.player.frameX = 0;
                    else if (Date.now() % 200 < 100) this.player.frameX = 1;
                    else if (Date.now() % 200 < 150) this.player.frameX = 2;
                    else this.player.frameX = 3;
                } else { this.player.frameX = 0; }

                // Checkpoint Collision
                this.checkpoints.forEach(cp => {
                    if (!cp.active) return;
                    if (this.checkRectCollision({x:this.player.x, y:this.player.y, w:this.player.width, h:this.player.height}, {x:cp.x, y:cp.y, w:cp.width, h:cp.height})) {
                        this.triggerPhase(cp.id);
                    }
                });
            },

            draw: function() {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                this.ctx.save();
                this.ctx.translate(-this.camera.x, -this.camera.y);

                // Map
                if (this.assetsLoaded >= 1) this.ctx.drawImage(this.mapImage, 0, 0, this.worldWidth, this.worldHeight);

                // --- DRAW PLAYER (Procedural Circle with Arms & Legs) ---
                this.ctx.save();
                this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                
                // Animation State
                const swing = this.player.moving ? Math.sin(Date.now() / 100) * 0.8 : 0;
                
                // Colors
                const skinColor = '#ffe0bd'; // Natural skin tone
                const armColor = '#ffd1aa';  // Slightly darker for arms
                const pantsColor = '#2563eb';  // Blue pants color
                const shoeColor = '#1f2937';   // Dark gray/black shoes

                // Left Leg (Swinging Opposite to Left Arm)
                this.ctx.save();
                this.ctx.translate(-8, 12); // Hips position
                this.ctx.rotate(-swing); // Opposite swing
                
                // Leg Skin (Full length underneath)
                this.ctx.fillStyle = skinColor;
                this.ctx.beginPath();
                this.ctx.roundRect(-4, 0, 8, 20, 4); 
                this.ctx.fill();
                
                // Shorts (Blue top half)
                this.ctx.fillStyle = pantsColor;
                this.ctx.beginPath();
                this.ctx.fillRect(-4, 0, 8, 12); 
                this.ctx.fill();

                // Shoe (Bottom part)
                this.ctx.fillStyle = shoeColor;
                this.ctx.beginPath();
                this.ctx.roundRect(-5, 16, 10, 6, 2); // Slightly wider than leg
                this.ctx.fill();
                
                this.ctx.restore();

                // Right Leg (Swinging Opposite to Right Arm)
                this.ctx.save();
                this.ctx.translate(8, 12); // Hips position
                this.ctx.rotate(swing); // Opposite swing
                
                // Leg Skin (Full length underneath)
                this.ctx.fillStyle = skinColor;
                this.ctx.beginPath();
                this.ctx.roundRect(-4, 0, 8, 20, 4); 
                this.ctx.fill();

                // Shorts (Blue top half)
                this.ctx.fillStyle = pantsColor;
                this.ctx.beginPath();
                this.ctx.fillRect(-4, 0, 8, 12); 
                this.ctx.fill();

                // Shoe (Bottom part)
                this.ctx.fillStyle = shoeColor;
                this.ctx.beginPath();
                this.ctx.roundRect(-5, 16, 10, 6, 2); // Slightly wider than leg
                this.ctx.fill();

                this.ctx.restore();

                // Left Arm (Swinging)
                this.ctx.save();
                this.ctx.translate(-18, 0); // Shoulder position
                this.ctx.rotate(swing);
                this.ctx.fillStyle = armColor;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 10, 6, 12, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();

                // Right Arm (Swinging Opposite)
                this.ctx.save();
                this.ctx.translate(18, 0); // Shoulder position
                this.ctx.rotate(-swing);
                this.ctx.fillStyle = armColor;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 10, 6, 12, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();

                // Body (Circle)
                this.ctx.fillStyle = skinColor;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Optional: Simple Eyes for direction
                this.ctx.fillStyle = '#333';
                let eyeOffsetX = 0;
                let eyeOffsetY = 0;
                if(this.player.direction === 1) eyeOffsetX = -6; // Left
                if(this.player.direction === 2) eyeOffsetX = 6;  // Right
                if(this.player.direction === 3) eyeOffsetY = -4; // Up
                if(this.player.direction === 0) eyeOffsetY = 0;  // Down

                if(this.player.direction !== 3) { // Don't draw eyes if facing up (back)
                    this.ctx.beginPath();
                    this.ctx.arc(-7 + eyeOffsetX, -2 + eyeOffsetY, 2, 0, Math.PI * 2); // Left Eye
                    this.ctx.arc(7 + eyeOffsetX, -2 + eyeOffsetY, 2, 0, Math.PI * 2);  // Right Eye
                    this.ctx.fill();
                }

                this.ctx.restore(); // Restore player transform

                this.ctx.restore(); // Restore camera transform
            },

            gameLoop: function() {
                this.update();
                this.draw();
                requestAnimationFrame(() => this.gameLoop());
            },

            checkRectCollision: function(r1, r2) {
                return (r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y);
            },

            triggerPhase: function(id) {
                if (id !== this.level) return;
                this.state = 'paused';
                document.getElementById('phase-modal').style.display = 'block';
                fetch(`phases/phase${id}.html`).then(r => r.text()).then(html => {
                    document.getElementById('modal-content').innerHTML = html;
                    this.attachPhaseLogic(id);
                });
            },
            closeModal: function() { document.getElementById('phase-modal').style.display = 'none'; this.state = 'playing'; },
            completeLevel: function() {
                this.closeModal();
                this.level++;
                if (this.level <= this.checkpoints.length) {
                    this.checkpoints[this.level - 1].active = true;
                    const objectives = ["", "Dorms Reached. Move to Building F10.", "Security Overridden. Enter the Core."];
                    document.getElementById('objective-text').innerText = objectives[this.level - 1];
                } else { this.victory(); }
            },
            gameOver: function() {
                this.state = 'gameover';
                document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:black;color:red;flex-direction:column;"><h1 style="font-size:4rem;">GAME OVER</h1><button onclick="location.reload()">RETRY</button></div>`;
            },
            victory: function() {
                this.state = 'victory';
                document.getElementById('victory-screen').style.display = 'flex';
                clearInterval(this.timerInterval);
            },
            attachPhaseLogic: function(levelId) {
                window.app = {
                    navToPhase2: () => this.completeLevel(),
                    unlock1: () => {
                        if (document.getElementById('lock1-input').value.trim() === this.config.symmetricKey) {
                            document.getElementById('icon1').innerText = "🔓";
                            document.getElementById('lock1-box').classList.add('border-green-500');
                            document.getElementById('otp-tool').classList.remove('hidden');
                            document.getElementById('lock2-card').classList.remove('locked');
                            document.getElementById('lock2-card').classList.add('unlocked');
                            this.startOTPGeneration();
                        } else { alert("WRONG KEY"); }
                    },
                    unlock2: () => {
                        if (document.getElementById('otp-input').value.trim() === this.currentOTP) {
                             document.getElementById('icon2').innerText = "🔓";
                             clearInterval(this.otpInterval);
                             document.getElementById('lock3-card').classList.remove('locked');
                             document.getElementById('lock3-card').classList.add('unlocked');
                             document.getElementById('loc-hint').classList.remove('hidden');
                        } else { alert("WRONG OTP"); }
                    },
                    unlock3: () => {
                        if (document.getElementById('loc-input').value.trim().toUpperCase() === this.config.locationCode) {
                            document.getElementById('icon3').innerText = "🔓";
                            document.getElementById('p3-next').classList.remove('hidden');
                        } else { alert("WRONG LOCATION"); }
                    },
                    navToPhase3: () => this.completeLevel()
                };
                if (levelId === 3) {
                     const panel = document.getElementById('disarm-panel');
                     const observer = new MutationObserver(() => {
                        if (panel.getAttribute('data-role') === "admin") this.completeLevel();
                    });
                    observer.observe(panel, { attributes: true });
                }
            },
            startOTPGeneration: function() {
                if(this.otpInterval) clearInterval(this.otpInterval);
                this.otpInterval = setInterval(() => {
                    const now = Math.floor(Date.now() / 1000);
                    const timeSlot = Math.floor(now / 60);
                    if (this.currentTimeSlot !== timeSlot) {
                        this.currentTimeSlot = timeSlot;
                        this.currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
                    }
                    if(document.getElementById('live-otp')) {
                        document.getElementById('live-otp').innerText = this.currentOTP;
                        document.getElementById('otp-progress').style.width = ((60 - (now % 60)) / 60) * 100 + "%";
                    }
                }, 1000);
            }
        };