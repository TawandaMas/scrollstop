// Main App Class
class StressBallApp {
    constructor() {
        this.currentExercise = 'bubble-wrap';
        this.soundEnabled = false;
        this.hapticEnabled = true;
        this.theme = 'light';
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initExercises();
        this.applySettings();
    }
    
    cacheElements() {
        // Navigation
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.exerciseContainers = document.querySelectorAll('.exercise');
        
        // Controls
        this.soundToggle = document.getElementById('soundToggle');
        this.hapticToggle = document.getElementById('hapticToggle');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Bubble Wrap
        this.bubbleContainer = document.getElementById('bubbleContainer');
        this.poppedCountElement = document.getElementById('poppedCount');
        
        // Kaleidoscope
        this.canvas = document.getElementById('kaleidoscopeCanvas');
        this.currentColorElement = document.getElementById('currentColor');
        
        // Labyrinth
        this.labyrinthContainer = document.getElementById('labyrinth');
        this.labyrinthBall = document.getElementById('labyrinthBall');
        this.labyrinthCenter = document.getElementById('labyrinthCenter');
    }
    
    bindEvents() {
        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exercise = e.currentTarget.dataset.exercise;
                this.switchExercise(exercise);
            });
        });
        
        // Control toggles
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.hapticToggle.addEventListener('click', () => this.toggleHaptic());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    initExercises() {
        this.initBubbleWrap();
        this.initKaleidoscope();
        this.initLabyrinth();
    }
    
    switchExercise(exercise) {
        // Update navigation
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.exercise === exercise);
        });
        
        // Update exercise containers
        this.exerciseContainers.forEach(container => {
            container.classList.toggle('active', container.id === `${exercise}-exercise`);
        });
        
        this.currentExercise = exercise;
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        localStorage.setItem('stressball-sound', this.soundEnabled);
    }
    
    toggleHaptic() {
        this.hapticEnabled = !this.hapticEnabled;
        this.hapticToggle.textContent = this.hapticEnabled ? '📳' : '📴';
        localStorage.setItem('stressball-haptic', this.hapticEnabled);
        
        // Test haptic
        if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('stressball-theme', this.theme);
    }
    
    applySettings() {
        // Load saved settings
        const savedSound = localStorage.getItem('stressball-sound');
        const savedHaptic = localStorage.getItem('stressball-haptic');
        const savedTheme = localStorage.getItem('stressball-theme');
        
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
            this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        
        if (savedHaptic !== null) {
            this.hapticEnabled = savedHaptic === 'true';
            this.hapticToggle.textContent = this.hapticEnabled ? '📳' : '📴';
        }
        
        if (savedTheme) {
            this.theme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.theme);
            this.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }
    
    // BUBBLE WRAP
    initBubbleWrap() {
        this.bubblePoppedCount = 0;
        this.bubbles = [];
        this.createBubbles();
        this.bindBubbleEvents();
    }
    
    createBubbles() {
        this.bubbleContainer.innerHTML = '';
        this.bubbles = [];
        
        for (let i = 0; i < 15; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.dataset.id = i;
            
            // Random size
            const size = 60 + Math.random() * 40;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // Random color
            const hue = 190 + Math.random() * 40;
            bubble.style.backgroundColor = `hsl(${hue}, 80%, 85%)`;
            bubble.style.borderColor = `hsl(${hue}, 80%, 65%)`;
            
            this.bubbleContainer.appendChild(bubble);
            this.bubbles.push(bubble);
        }
    }
    
    bindBubbleEvents() {
        this.bubbleContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('bubble') && !e.target.classList.contains('popped')) {
                this.popBubble(e.target);
            }
        });
        
        // Touch events for mobile
        this.bubbleContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element && element.classList.contains('bubble') && !element.classList.contains('popped')) {
                this.popBubble(element);
            }
        }, { passive: false });
        
        // Reset button
        document.getElementById('resetBubbles').addEventListener('click', () => {
            this.bubblePoppedCount = 0;
            this.poppedCountElement.textContent = '0';
            this.createBubbles();
            
            if (this.hapticEnabled && 'vibrate' in navigator) {
                navigator.vibrate([50, 30, 50]);
            }
        });
    }
    
    popBubble(bubble) {
        bubble.classList.add('popped');
        this.bubblePoppedCount++;
        this.poppedCountElement.textContent = this.bubblePoppedCount;
        
        // Haptic feedback
        if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate(30);
        }
        
        // Pop sound
        if (this.soundEnabled) {
            this.playPopSound();
        }
        
        // Check if all bubbles are popped
        setTimeout(() => {
            const popped = document.querySelectorAll('.bubble.popped').length;
            if (popped === this.bubbles.length) {
                setTimeout(() => {
                    this.createBubbles();
                    this.bubblePoppedCount = 0;
                    this.poppedCountElement.textContent = '0';
                }, 500);
            }
        }, 100);
    }
    
    playPopSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    // KALEIDOSCOPE
    initKaleidoscope() {
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastPoint = { x: 0, y: 0 };
        this.currentColor = this.getRandomColor();
        this.segments = 6;
        this.points = [];
        
        this.setupCanvas();
        this.bindKaleidoscopeEvents();
        this.updateColorIndicator();
        this.clearCanvas();
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 3;
    }
    
    bindKaleidoscopeEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Control buttons
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('changeColor').addEventListener('click', () => this.changeColor());
        document.getElementById('changeSegments').addEventListener('click', () => this.changeSegments());
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const point = this.getCanvasPoint(e);
        this.lastPoint = point;
        this.points = [point];
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const point = this.getCanvasPoint(e);
        this.points.push(point);
        
        if (this.points.length > 3) {
            this.points.shift();
        }
        
        if (this.points.length > 1) {
            this.drawMirroredCurve(this.points);
        }
        
        this.lastPoint = point;
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.points = [];
    }
    
    getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    drawMirroredCurve(points) {
        const centerX = this.canvas.width / (window.devicePixelRatio || 1) / 2;
        const centerY = this.canvas.height / (window.devicePixelRatio || 1) / 2;
        const angleStep = (2 * Math.PI) / this.segments;
        
        this.ctx.strokeStyle = this.currentColor;
        
        for (let i = 0; i < this.segments; i++) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(i * angleStep);
            
            this.drawCurveSegment(points, centerX, centerY);
            
            // Mirror for more complex patterns
            if (this.segments > 6) {
                this.ctx.scale(1, -1);
                this.drawCurveSegment(points, centerX, centerY);
            }
            
            this.ctx.restore();
        }
    }
    
    drawCurveSegment(points, centerX, centerY) {
        this.ctx.beginPath();
        
        if (points.length === 2) {
            this.ctx.moveTo(points[0].x - centerX, points[0].y - centerY);
            this.ctx.lineTo(points[1].x - centerX, points[1].y - centerY);
        } else if (points.length >= 3) {
            this.ctx.moveTo(points[0].x - centerX, points[0].y - centerY);
            this.ctx.quadraticCurveTo(
                points[1].x - centerX, 
                points[1].y - centerY,
                points[2].x - centerX, 
                points[2].y - centerY
            );
        }
        
        this.ctx.stroke();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-color');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    changeColor() {
        this.currentColor = this.getRandomColor();
        this.updateColorIndicator();
    }
    
    changeSegments() {
        this.segments = this.segments === 6 ? 8 : this.segments === 8 ? 10 : 6;
        document.getElementById('segmentCount').textContent = this.segments;
    }
    
    getRandomColor() {
        const hues = [0, 30, 60, 120, 180, 240, 300, 330];
        const randomHue = hues[Math.floor(Math.random() * hues.length)];
        return `hsl(${randomHue}, 70%, 50%)`;
    }
    
    updateColorIndicator() {
        if (this.currentColorElement) {
            this.currentColorElement.style.backgroundColor = this.currentColor;
        }
    }
    
    // LABYRINTH
    initLabyrinth() {
        this.ballX = 30;
        this.ballY = 30;
        this.centerX = 0;
        this.centerY = 0;
        this.isTiltMode = true;
        this.successCount = 0;
        this.startTime = Date.now();
        this.timerInterval = null;
        this.timeSpent = 0;
        
        this.beta = 0;
        this.gamma = 0;
        this.isDragging = false;
        this.walls = [];
        
        this.setupLabyrinth();
        this.bindLabyrinthEvents();
        this.startTimer();
        this.requestDeviceOrientation();
        this.animationLoop();
    }
    
    setupLabyrinth() {
        this.labyrinthContainer.innerHTML = '';
        this.walls = [];
        
        const size = this.labyrinthContainer.clientWidth;
        
        // Set center position
        this.centerX = size - 70;
        this.centerY = size - 70;
        this.labyrinthCenter.style.left = `${this.centerX}px`;
        this.labyrinthCenter.style.top = `${this.centerY}px`;
        
        // Reset ball
        this.ballX = 30;
        this.ballY = 30;
        this.updateBallPosition();
        
        // Generate walls
        this.generateWalls(size);
        this.drawWalls();
    }
    
    generateWalls(size) {
        // Boundary walls
        const wallThickness = 15;
        this.walls.push({ x: 0, y: 0, width: size, height: wallThickness });
        this.walls.push({ x: 0, y: 0, width: wallThickness, height: size });
        this.walls.push({ x: size - wallThickness, y: 0, width: wallThickness, height: size });
        this.walls.push({ x: 0, y: size - wallThickness, width: size, height: wallThickness });
        
        // Random interior walls
        for (let i = 0; i < 6; i++) {
            const isHorizontal = Math.random() > 0.5;
            let x, y, width, height;
            
            if (isHorizontal) {
                x = Math.random() * (size - 150) + 30;
                y = Math.random() * (size - 150) + 30;
                width = 60 + Math.random() * 100;
                height = 12;
            } else {
                x = Math.random() * (size - 150) + 30;
                y = Math.random() * (size - 150) + 30;
                width = 12;
                height = 60 + Math.random() * 100;
            }
            
            if (!this.blocksStartOrEnd(x, y, width, height)) {
                this.walls.push({ x, y, width, height });
            }
        }
    }
    
    blocksStartOrEnd(x, y, width, height) {
        const startBlocked = this.rectOverlap(x, y, width, height, 20, 20, 50, 50);
        const endBlocked = this.rectOverlap(x, y, width, height, this.centerX - 25, this.centerY - 25, 70, 70);
        return startBlocked || endBlocked;
    }
    
    rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }
    
    drawWalls() {
        this.walls.forEach(wall => {
            const wallElement = document.createElement('div');
            wallElement.className = 'labyrinth-wall';
            wallElement.style.left = `${wall.x}px`;
            wallElement.style.top = `${wall.y}px`;
            wallElement.style.width = `${wall.width}px`;
            wallElement.style.height = `${wall.height}px`;
            this.labyrinthContainer.appendChild(wallElement);
        });
    }
    
    bindLabyrinthEvents() {
        document.getElementById('tiltControl').addEventListener('click', () => this.setTiltMode(true));
        document.getElementById('touchControl').addEventListener('click', () => this.setTiltMode(false));
        document.getElementById('resetLabyrinth').addEventListener('click', () => this.resetBall());
        
        // Device orientation
        window.addEventListener('deviceorientation', (e) => {
            if (this.isTiltMode) {
                this.beta = e.beta || 0;
                this.gamma = e.gamma || 0;
            }
        });
        
        // Touch events
        this.labyrinthContainer.addEventListener('touchstart', (e) => {
            if (!this.isTiltMode) {
                e.preventDefault();
                this.isDragging = true;
                const touch = e.touches[0];
                const rect = this.labyrinthContainer.getBoundingClientRect();
                this.touchStartX = touch.clientX - rect.left;
                this.touchStartY = touch.clientY - rect.top;
            }
        });
        
        this.labyrinthContainer.addEventListener('touchmove', (e) => {
            if (!this.isTiltMode && this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.labyrinthContainer.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                
                const deltaX = touchX - this.touchStartX;
                const deltaY = touchY - this.touchStartY;
                
                this.touchStartX = touchX;
                this.touchStartY = touchY;
                
                this.moveBall(deltaX * 0.5, deltaY * 0.5);
            }
        });
        
        this.labyrinthContainer.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }
    
    requestDeviceOrientation() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        console.log('Gyroscope permission granted');
                    }
                })
                .catch(console.error);
        }
    }
    
    animationLoop() {
        const update = () => {
            if (this.isTiltMode && this.currentExercise === 'labyrinth') {
                this.moveBall(this.gamma / 15, this.beta / 15);
            }
            requestAnimationFrame(update);
        };
        update();
    }
    
    moveBall(deltaX, deltaY) {
        const newX = this.ballX + deltaX;
        const newY = this.ballY + deltaY;
        
        const containerRect = this.labyrinthContainer.getBoundingClientRect();
        const ballSize = 30;
        const minX = 0;
        const minY = 0;
        const maxX = containerRect.width - ballSize;
        const maxY = containerRect.height - ballSize;
        
        let finalX = Math.max(minX, Math.min(maxX, newX));
        let finalY = Math.max(minY, Math.min(maxY, newY));
        
        // Check wall collisions
        if (!this.checkWallCollision(finalX, finalY, ballSize)) {
            this.ballX = finalX;
            this.ballY = finalY;
            this.updateBallPosition();
            this.checkCenterCollision();
        } else if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
    
    checkWallCollision(x, y, size) {
        for (const wall of this.walls) {
            if (this.rectOverlap(x, y, size, size, wall.x, wall.y, wall.width, wall.height)) {
                return true;
            }
        }
        return false;
    }
    
    checkCenterCollision() {
        const ballRect = this.labyrinthBall.getBoundingClientRect();
        const centerRect = this.labyrinthCenter.getBoundingClientRect();
        
        if (this.rectOverlap(
            ballRect.left, ballRect.top, ballRect.width, ballRect.height,
            centerRect.left, centerRect.top, centerRect.width, centerRect.height
        )) {
            this.onCenterReached();
        }
    }
    
    onCenterReached() {
        this.successCount++;
        document.getElementById('successCount').textContent = this.successCount;
        
        if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate([50, 30, 50, 30, 50]);
        }
        
        this.labyrinthBall.style.animation = 'pulse 0.5s 3';
        setTimeout(() => {
            this.labyrinthBall.style.animation = '';
            this.resetBall();
        }, 1500);
    }
    
    updateBallPosition() {
        this.labyrinthBall.style.transform = `translate(${this.ballX}px, ${this.ballY}px)`;
    }
    
    resetBall() {
        this.ballX = 30;
        this.ballY = 30;
        this.updateBallPosition();
        
        if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate(30);
        }
    }
    
    setTiltMode(enabled) {
        this.isTiltMode = enabled;
        document.getElementById('tiltControl').classList.toggle('active', enabled);
        document.getElementById('touchControl').classList.toggle('active', !enabled);
        
        if (enabled) {
            this.requestDeviceOrientation();
        }
    }
    
    startTimer() {
        this.startTime = Date.now();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timeSpent').textContent = `${this.timeSpent}s`;
        }, 1000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stressBallApp = new StressBallApp();
});