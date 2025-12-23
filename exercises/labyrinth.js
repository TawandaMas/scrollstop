export class Labyrinth {
    constructor(config) {
        this.container = config.container;
        this.ball = config.ball;
        this.center = config.center;
        this.timeSpentElement = config.timeSpentElement;
        this.successCountElement = config.successCountElement;
        this.hapticEnabled = config.hapticEnabled;
        this.soundEnabled = config.soundEnabled;
        
        this.ballX = 20;
        this.ballY = 20;
        this.centerX = 0;
        this.centerY = 0;
        this.isTiltMode = true;
        this.successCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.timeSpent = 0;
        
        // Gyroscope data
        this.beta = 0; // front-back tilt
        this.gamma = 0; // left-right tilt
        
        // For touch mode
        this.isDragging = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Maze walls data
        this.walls = [];
    }
    
    init() {
        this.setupLabyrinth();
        this.bindEvents();
        this.startTimer();
        this.requestDeviceOrientation();
    }
    
    setupLabyrinth() {
        // Clear previous walls
        this.container.innerHTML = '';
        this.walls = [];
        
        const size = this.container.clientWidth;
        
        // Set center position
        this.centerX = size - 70;
        this.centerY = size - 70;
        this.center.style.left = `${this.centerX}px`;
        this.center.style.top = `${this.centerY}px`;
        
        // Reset ball position
        this.ballX = 30;
        this.ballY = 30;
        this.updateBallPosition();
        
        // Generate random maze walls
        this.generateWalls(size);
        
        // Draw walls
        this.drawWalls();
    }
    
    generateWalls(size) {
        // Create some random walls for the maze
        const wallCount = 8;
        
        for (let i = 0; i < wallCount; i++) {
            const isHorizontal = Math.random() > 0.5;
            let x, y, width, height;
            
            if (isHorizontal) {
                x = Math.random() * (size - 100) + 20;
                y = Math.random() * (size - 100) + 20;
                width = 80 + Math.random() * 120;
                height = 10;
            } else {
                x = Math.random() * (size - 100) + 20;
                y = Math.random() * (size - 100) + 20;
                width = 10;
                height = 80 + Math.random() * 120;
            }
            
            // Make sure wall doesn't block start or end completely
            if (!this.blocksStartOrEnd(x, y, width, height)) {
                this.walls.push({ x, y, width, height });
            }
        }
        
        // Add some boundary walls
        const wallThickness = 15;
        this.walls.push({ x: 0, y: 0, width: size, height: wallThickness }); // Top
        this.walls.push({ x: 0, y: 0, width: wallThickness, height: size }); // Left
        this.walls.push({ x: size - wallThickness, y: 0, width: wallThickness, height: size }); // Right
        this.walls.push({ x: 0, y: size - wallThickness, width: size, height: wallThickness }); // Bottom
    }
    
    blocksStartOrEnd(x, y, width, height) {
        // Check if wall blocks starting area
        const startBlocked = this.rectOverlap(x, y, width, height, 10, 10, 60, 60);
        
        // Check if wall blocks ending area
        const endBlocked = this.rectOverlap(x, y, width, height, 
            this.centerX - 20, this.centerY - 20, 80, 80);
            
        return startBlocked || endBlocked;
    }
    
    rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }
    
    drawWalls() {
        this.walls.forEach(wall => {
            const wallElement = document.createElement('div');
            wallElement.className = 'labyrinth-wall';
            wallElement.style.position = 'absolute';
            wallElement.style.left = `${wall.x}px`;
            wallElement.style.top = `${wall.y}px`;
            wallElement.style.width = `${wall.width}px`;
            wallElement.style.height = `${wall.height}px`;
            wallElement.style.backgroundColor = 'var(--primary-color)';
            wallElement.style.borderRadius = '5px';
            wallElement.style.opacity = '0.7';
            
            this.container.appendChild(wallElement);
        });
    }
    
    bindEvents() {
        // Control mode buttons
        document.getElementById('tiltControl').addEventListener('click', () => this.setTiltMode(true));
        document.getElementById('touchControl').addEventListener('click', () => this.setTiltMode(false));
        
        // Reset button
        document.getElementById('resetLabyrinth').addEventListener('click', () => this.resetBall());
        
        // Touch events for touch mode
        this.container.addEventListener('touchstart', (e) => {
            if (!this.isTiltMode) {
                e.preventDefault();
                this.isDragging = true;
                const touch = e.touches[0];
                const rect = this.container.getBoundingClientRect();
                this.touchStartX = touch.clientX - rect.left;
                this.touchStartY = touch.clientY - rect.top;
            }
        });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!this.isTiltMode && this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.container.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                
                // Move ball based on touch movement
                const deltaX = touchX - this.touchStartX;
                const deltaY = touchY - this.touchStartY;
                
                this.touchStartX = touchX;
                this.touchStartY = touchY;
                
                this.moveBall(deltaX * 0.5, deltaY * 0.5);
            }
        });
        
        this.container.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        
        // Mouse events for desktop touch simulation
        this.container.addEventListener('mousedown', (e) => {
            if (!this.isTiltMode) {
                this.isDragging = true;
                const rect = this.container.getBoundingClientRect();
                this.touchStartX = e.clientX - rect.left;
                this.touchStartY = e.clientY - rect.top;
            }
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isTiltMode && this.isDragging) {
                const rect = this.container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const deltaX = mouseX - this.touchStartX;
                const deltaY = mouseY - this.touchStartY;
                
                this.touchStartX = mouseX;
                this.touchStartY = mouseY;
                
                this.moveBall(deltaX * 0.5, deltaY * 0.5);
            }
        });
        
        this.container.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Device orientation event
        window.addEventListener('deviceorientation', (e) => {
            if (this.isTiltMode) {
                // Smooth the values to reduce jitter
                this.beta = this.beta * 0.7 + e.beta * 0.3 || 0;
                this.gamma = this.gamma * 0.7 + e.gamma * 0.3 || 0;
                
                // Move ball based on tilt
                const tiltX = this.gamma / 10; // Scale down the effect
                const tiltY = this.beta / 10;
                
                this.moveBall(tiltX, tiltY);
            }
        });
        
        // Animation loop for tilt mode
        this.animationLoop();
    }
    
    requestDeviceOrientation() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        console.log('Device orientation permission granted');
                    }
                })
                .catch(console.error);
        }
    }
    
    animationLoop() {
        const update = () => {
            if (this.isTiltMode) {
                // Continuous movement based on tilt
                this.moveBall(this.gamma / 20, this.beta / 20);
            }
            requestAnimationFrame(update);
        };
        update();
    }
    
    moveBall(deltaX, deltaY) {
        // Calculate new position
        let newX = this.ballX + deltaX;
        let newY = this.ballY + deltaY;
        
        // Constrain to container bounds
        const containerRect = this.container.getBoundingClientRect();
        const ballSize = 30;
        const minX = 0;
        const minY = 0;
        const maxX = containerRect.width - ballSize;
        const maxY = containerRect.height - ballSize;
        
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
        
        // Check for wall collisions
        if (!this.checkWallCollision(newX, newY, ballSize)) {
            this.ballX = newX;
            this.ballY = newY;
            this.updateBallPosition();
            
            // Check if ball reached center
            this.checkCenterCollision();
        } else {
            // Small vibration on collision
            if (this.hapticEnabled() && 'vibrate' in navigator) {
                navigator.vibrate(10);
            }
        }
    }
    
    checkWallCollision(x, y, size) {
        // Check collision with each wall
        for (const wall of this.walls) {
            if (this.rectOverlap(x, y, size, size, wall.x, wall.y, wall.width, wall.height)) {
                return true;
            }
        }
        return false;
    }
    
    checkCenterCollision() {
        const ballRect = this.ball.getBoundingClientRect();
        const centerRect = this.center.getBoundingClientRect();
        
        // Check if ball overlaps with center
        const overlap = this.rectOverlap(
            ballRect.left, ballRect.top, ballRect.width, ballRect.height,
            centerRect.left, centerRect.top, centerRect.width, centerRect.height
        );
        
        if (overlap) {
            this.onCenterReached();
        }
    }
    
    onCenterReached() {
        this.successCount++;
        
        if (this.successCountElement) {
            this.successCountElement.textContent = this.successCount;
        }
        
        // Haptic feedback
        if (this.hapticEnabled() && 'vibrate' in navigator) {
            navigator.vibrate([50, 30, 50, 30, 50]);
        }
        
        // Sound feedback
        if (this.soundEnabled()) {
            this.playSuccessSound();
        }
        
        // Visual feedback
        this.ball.style.animation = 'pulse 0.5s 3';
        setTimeout(() => {
            this.ball.style.animation = '';
            this.resetBall();
        }, 1500);
    }
    
    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Two-tone success sound
            oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
            
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.5);
            oscillator2.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    updateBallPosition() {
        this.ball.style.transform = `translate(${this.ballX}px, ${this.ballY}px)`;
    }
    
    resetBall() {
        this.ballX = 30;
        this.ballY = 30;
        this.updateBallPosition();
        
        // Small haptic feedback
        if (this.hapticEnabled() && 'vibrate' in navigator) {
            navigator.vibrate(30);
        }
    }
    
    setTiltMode(enabled) {
        this.isTiltMode = enabled;
        
        // Update UI
        document.getElementById('tiltControl').classList.toggle('active', enabled);
        document.getElementById('touchControl').classList.toggle('active', !enabled);
        
        // If switching to tilt mode, request permission
        if (enabled) {
            this.requestDeviceOrientation();
        }
        
        // Sound feedback
        if (this.soundEnabled()) {
            this.playModeChangeSound();
        }
    }
    
    playModeChangeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.1);
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    startTimer() {
        this.startTime = Date.now();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            
            if (this.timeSpentElement) {
                this.timeSpentElement.textContent = `${this.timeSpent}s`;
            }
        }, 1000);
    }
}