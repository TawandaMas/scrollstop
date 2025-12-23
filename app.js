// Main App Class
class StressBallApp {
    constructor() {
        this.currentSection = 'bubble-wrap';
        this.soundEnabled = false;
        this.hapticEnabled = true;
        this.theme = 'light';
        this.deferredPrompt = null;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initSections();
        this.applySettings();
        this.setupPWA();
    }
    
    cacheElements() {
        // Navigation
        this.tabs = document.querySelectorAll('.tab');
        this.sections = document.querySelectorAll('.section');
        
        // Settings
        this.themeToggle = document.getElementById('themeToggle');
        this.soundToggle = document.getElementById('soundToggle');
        this.hapticToggle = document.getElementById('hapticToggle');
        
        // Install prompt
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissPrompt = document.getElementById('dismissPrompt');
    }
    
    bindEvents() {
        // Navigation
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.switchSection(target);
            });
        });
        
        // Settings
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.hapticToggle.addEventListener('click', () => this.toggleHaptic());
        
        // Install prompt
        this.installBtn?.addEventListener('click', () => this.installApp());
        this.dismissPrompt?.addEventListener('click', () => {
            this.installPrompt.classList.add('hidden');
        });
        
        // PWA events
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        window.addEventListener('appinstalled', () => {
            this.installPrompt.classList.add('hidden');
            this.deferredPrompt = null;
        });
    }
    
    initSections() {
        this.initBubbleWrap();
        this.initKaleidoscope();
        this.initLabyrinth();
    }
    
    switchSection(sectionId) {
        // Update tabs
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.target === sectionId);
        });
        
        // Update sections
        this.sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });
        
        this.currentSection = sectionId;
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.querySelector('.icon').textContent = 
            this.theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('stressball-theme', this.theme);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.querySelector('.icon').textContent = 
            this.soundEnabled ? '🔊' : '🔇';
        localStorage.setItem('stressball-sound', this.soundEnabled);
        
        // Test sound
        if (this.soundEnabled) {
            this.playSound(600, 0.1);
        }
    }
    
    toggleHaptic() {
        this.hapticEnabled = !this.hapticEnabled;
        this.hapticToggle.querySelector('.icon').textContent = 
            this.hapticEnabled ? '📳' : '📴';
        localStorage.setItem('stressball-haptic', this.hapticEnabled);
        
        // Test haptic
        if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    applySettings() {
        // Theme
        const savedTheme = localStorage.getItem('stressball-theme');
        if (savedTheme) {
            this.theme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.theme);
            this.themeToggle.querySelector('.icon').textContent = 
                this.theme === 'light' ? '🌙' : '☀️';
        }
        
        // Sound
        const savedSound = localStorage.getItem('stressball-sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
            this.soundToggle.querySelector('.icon').textContent = 
                this.soundEnabled ? '🔊' : '🔇';
        }
        
        // Haptic
        const savedHaptic = localStorage.getItem('stressball-haptic');
        if (savedHaptic !== null) {
            this.hapticEnabled = savedHaptic === 'true';
            this.hapticToggle.querySelector('.icon').textContent = 
                this.hapticEnabled ? '📳' : '📴';
        }
    }
    
    setupPWA() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('SW registered:', registration);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    }
    
    showInstallPrompt() {
        const dismissed = localStorage.getItem('stressball-install-dismissed');
        if (!dismissed && this.deferredPrompt) {
            setTimeout(() => {
                this.installPrompt.classList.remove('hidden');
            }, 3000);
        }
    }
    
    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User installed the app');
        }
        
        this.deferredPrompt = null;
        this.installPrompt.classList.add('hidden');
    }
    
    playSound(frequency, duration) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
    
    // ===== BUBBLE WRAP =====
    initBubbleWrap() {
        this.bubbleCount = 0;
        this.bubbles = [];
        const grid = document.getElementById('bubbleGrid');
        const popCountElement = document.getElementById('popCount');
        
        // Create bubbles
        for (let i = 0; i < 15; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.animationDelay = `${i * 0.1}s`;
            
            // Random size
            const size = 60 + Math.random() * 40;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // Random color
            const hue = 190 + Math.random() * 60;
            bubble.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue}, 90%, 85%), hsl(${hue}, 80%, 65%))`;
            bubble.style.borderColor = `hsl(${hue}, 80%, 55%)`;
            
            bubble.addEventListener('click', () => this.popBubble(bubble, popCountElement));
            bubble.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.popBubble(bubble, popCountElement);
            });
            
            grid.appendChild(bubble);
            this.bubbles.push(bubble);
        }
        
        // Reset button
        document.getElementById('resetBubbles').addEventListener('click', () => {
            this.bubbleCount = 0;
            popCountElement.textContent = '0';
            
            // Remove all bubbles
            grid.innerHTML = '';
            this.bubbles = [];
            
            // Create new bubbles
            this.initBubbleWrap();
            
            // Haptic feedback
            if (this.hapticEnabled && 'vibrate' in navigator) {
                navigator.vibrate([50, 30, 50]);
            }
        });
    }
    
    popBubble(bubble, counter) {
        if (bubble.classList.contains('popped')) return;
        
        bubble.classList.add('popped');
        this.bubbleCount++;
        counter.textContent = this.bubbleCount;
        
        // Haptic feedback
        if (this.hapticEnabled && 'vibrate' in navigator) {
            navigator.vibrate(30);
        }
        
        // Sound feedback
        if (this.soundEnabled) {
            this.playSound(200, 0.1);
        }
        
        // Check if all bubbles are popped
        setTimeout(() => {
            const popped = document.querySelectorAll('.bubble.popped').length;
            if (popped === this.bubbles.length) {
                setTimeout(() => {
                    // Auto-reset
                    this.bubbleCount = 0;
                    counter.textContent = '0';
                    this.initBubbleWrap();
                }, 1000);
            }
        }, 300);
    }
    
    // ===== KALEIDOSCOPE =====
    initKaleidoscope() {
        const canvas = document.getElementById('kaleidoscopeCanvas');
        const ctx = canvas.getContext('2d');
        const colorDisplay = document.getElementById('currentColor');
        const segmentCountElement = document.getElementById('segmentCount');
        
        // Setup canvas
        const setupCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 3;
        };
        
        // Drawing state
        let isDrawing = false;
        let lastPoint = { x: 0, y: 0 };
        let currentColor = this.getRandomColor();
        let segments = 6;
        
        // Initialize
        setupCanvas();
        colorDisplay.style.backgroundColor = currentColor;
        
        // Clear canvas
        const clearCanvas = () => {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (this.soundEnabled) {
                this.playSound(400, 0.2);
            }
        };
        
        clearCanvas();
        
        // Drawing functions
        const getCanvasPoint = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return { x, y };
        };
        
        const drawSegment = (points, segmentIndex) => {
            const centerX = canvas.width / (window.devicePixelRatio || 1) / 2;
            const centerY = canvas.height / (window.devicePixelRatio || 1) / 2;
            const angle = (2 * Math.PI * segmentIndex) / segments;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            if (points.length === 2) {
                ctx.moveTo(points[0].x - centerX, points[0].y - centerY);
                ctx.lineTo(points[1].x - centerX, points[1].y - centerY);
            } else if (points.length >= 3) {
                const midX = (points[0].x + points[1].x + points[2].x) / 3 - centerX;
                const midY = (points[0].y + points[1].y + points[2].y) / 3 - centerY;
                
                ctx.moveTo(points[0].x - centerX, points[0].y - centerY);
                ctx.quadraticCurveTo(midX, midY, points[2].x - centerX, points[2].y - centerY);
            }
            ctx.stroke();
            
            ctx.restore();
        };
        
        const draw = (points) => {
            ctx.strokeStyle = currentColor;
            
            for (let i = 0; i < segments; i++) {
                drawSegment(points, i);
                
                // Add mirrored segment for more complex patterns
                if (segments > 6) {
                    drawSegment(points.map(p => ({ 
                        x: p.x, 
                        y: canvas.height / (window.devicePixelRatio || 1) - p.y 
                    })), i);
                }
            }
        };
        
        // Event handlers
        const startDrawing = (e) => {
            isDrawing = true;
            lastPoint = getCanvasPoint(e);
        };
        
        const continueDrawing = (e) => {
            if (!isDrawing) return;
            
            const currentPoint = getCanvasPoint(e);
            const points = [lastPoint, currentPoint];
            
            // Add middle point for curve
            const midX = (lastPoint.x + currentPoint.x) / 2;
            const midY = (lastPoint.y + currentPoint.y) / 2;
            points.splice(1, 0, { x: midX, y: midY });
            
            draw(points);
            lastPoint = currentPoint;
        };
        
        const stopDrawing = () => {
            isDrawing = false;
        };
        
        // Bind events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', continueDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e.touches[0]);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            continueDrawing(e.touches[0]);
        });
        
        canvas.addEventListener('touchend', stopDrawing);
        
        // Control buttons
        document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
        
        document.getElementById('changeColor').addEventListener('click', () => {
            currentColor = this.getRandomColor();
            colorDisplay.style.backgroundColor = currentColor;
            
            if (this.soundEnabled) {
                this.playSound(600, 0.1);
            }
        });
        
        document.getElementById('increaseSegments').addEventListener('click', () => {
            if (segments < 12) {
                segments += 2;
                segmentCountElement.textContent = segments;
                
                if (this.soundEnabled) {
                    this.playSound(500, 0.05);
                }
            }
        });
        
        document.getElementById('decreaseSegments').addEventListener('click', () => {
            if (segments > 4) {
                segments -= 2;
                segmentCountElement.textContent = segments;
                
                if (this.soundEnabled) {
                    this.playSound(300, 0.05);
                }
            }
        });
        
        // Resize handling
        window.addEventListener('resize', () => {
            setupCanvas();
            clearCanvas();
        });
    }
    
    getRandomColor() {
        const hues = [0, 30, 60, 120, 180, 240, 300, 330];
        const randomHue = hues[Math.floor(Math.random() * hues.length)];
        return `hsl(${randomHue}, 75%, 55%)`;
    }
    
    // ===== LABYRINTH =====
    initLabyrinth() {
        const container = document.getElementById('labyrinth');
        const ball = document.getElementById('ball');
        const goal = document.getElementById('goal');
        const timeSpentElement = document.getElementById('timeSpent');
        const successCountElement = document.getElementById('successCount');
        
        // Clear previous walls
        container.innerHTML = '';
        
        // Setup dimensions
        const size = 400;
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
        
        // Game state
        let ballX = 30;
        let ballY = 30;
        let successCount = 0;
        let startTime = Date.now();
        let timerInterval;
        let isTiltMode = true;
        let isDragging = false;
        let beta = 0, gamma = 0;
        
        // Set goal position
        const goalX = size - 80;
        const goalY = size - 80;
        goal.style.left = `${goalX}px`;
        goal.style.top = `${goalY}px`;
        
        // Update ball position
        const updateBall = () => {
            ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
        };
        
        // Generate walls
        const walls = [];
        const wallThickness = 12;
        
        // Boundary walls
        walls.push({ x: 0, y: 0, width: size, height: wallThickness });
        walls.push({ x: 0, y: 0, width: wallThickness, height: size });
        walls.push({ x: size - wallThickness, y: 0, width: wallThickness, height: size });
        walls.push({ x: 0, y: size - wallThickness, width: size, height: wallThickness });
        
        // Random interior walls (simpler for mobile)
        for (let i = 0; i < 4; i++) {
            const isHorizontal = Math.random() > 0.5;
            let x, y, width, height;
            
            if (isHorizontal) {
                x = Math.random() * (size - 200) + 50;
                y = Math.random() * (size - 200) + 50;
                width = 80 + Math.random() * 120;
                height = wallThickness;
            } else {
                x = Math.random() * (size - 200) + 50;
                y = Math.random() * (size - 200) + 50;
                width = wallThickness;
                height = 80 + Math.random() * 120;
            }
            
            walls.push({ x, y, width, height });
        }
        
        // Draw walls
        walls.forEach(wall => {
            const wallElement = document.createElement('div');
            wallElement.className = 'wall';
            wallElement.style.left = `${wall.x}px`;
            wallElement.style.top = `${wall.y}px`;
            wallElement.style.width = `${wall.width}px`;
            wallElement.style.height = `${wall.height}px`;
            container.appendChild(wallElement);
        });
        
        // Collision detection
        const checkCollision = (x, y) => {
            const ballSize = 36;
            
            for (const wall of walls) {
                if (x < wall.x + wall.width &&
                    x + ballSize > wall.x &&
                    y < wall.y + wall.height &&
                    y + ballSize > wall.y) {
                    return true;
                }
            }
            return false;
        };
        
        // Move ball
        const moveBall = (dx, dy) => {
            const newX = ballX + dx;
            const newY = ballY + dy;
            const ballSize = 36;
            
            // Boundary check
            const maxX = size - wallThickness - ballSize;
            const maxY = size - wallThickness - ballSize;
            const minX = wallThickness;
            const minY = wallThickness;
            
            let finalX = Math.max(minX, Math.min(maxX, newX));
            let finalY = Math.max(minY, Math.min(maxY, newY));
            
            // Check wall collisions
            if (!checkCollision(finalX, finalY)) {
                ballX = finalX;
                ballY = finalY;
                updateBall();
                
                // Check goal collision
                const goalSize = 50;
                if (ballX < goalX + goalSize &&
                    ballX + ballSize > goalX &&
                    ballY < goalY + goalSize &&
                    ballY + ballSize > goalY) {
                    
                    successCount++;
                    successCountElement.textContent = successCount;
                    
                    // Feedback
                    if (this.hapticEnabled && 'vibrate' in navigator) {
                        navigator.vibrate([50, 30, 50, 30, 50]);
                    }
                    
                    if (this.soundEnabled) {
                        this.playSound(800, 0.3);
                    }
                    
                    // Visual feedback
                    ball.style.animation = 'pulseGlow 0.5s 3';
                    setTimeout(() => {
                        ball.style.animation = '';
                        ballX = 30;
                        ballY = 30;
                        updateBall();
                    }, 1500);
                }
            } else if (this.hapticEnabled && 'vibrate' in navigator) {
                navigator.vibrate(10);
            }
        };
        
        // Start timer
        const startTimer = () => {
            if (timerInterval) clearInterval(timerInterval);
            
            timerInterval = setInterval(() => {
                const time = Math.floor((Date.now() - startTime) / 1000);
                timeSpentElement.textContent = `${time}s`;
            }, 1000);
        };
        
        startTimer();
        updateBall();
        
        // Tilt control
        if (typeof DeviceOrientationEvent !== 'undefined') {
            window.addEventListener('deviceorientation', (e) => {
                if (isTiltMode) {
                    beta = (e.beta || 0) / 20;
                    gamma = (e.gamma || 0) / 20;
                }
            });
        }
        
        // Animation loop
        const animate = () => {
            if (isTiltMode) {
                moveBall(gamma, beta);
            }
            requestAnimationFrame(animate);
        };
        animate();
        
        // Touch control
        container.addEventListener('touchstart', (e) => {
            if (!isTiltMode) {
                e.preventDefault();
                isDragging = true;
            }
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isTiltMode && isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = container.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                
                const dx = (touchX - ballX - 18) * 0.15;
                const dy = (touchY - ballY - 18) * 0.15;
                
                moveBall(dx, dy);
            }
        });
        
        container.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Mouse control for desktop
        container.addEventListener('mousedown', (e) => {
            if (!isTiltMode) {
                isDragging = true;
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isTiltMode && isDragging) {
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const dx = (mouseX - ballX - 18) * 0.1;
                const dy = (mouseY - ballY - 18) * 0.1;
                
                moveBall(dx, dy);
            }
        });
        
        container.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Control buttons
        document.getElementById('tiltMode').addEventListener('click', () => {
            isTiltMode = true;
            document.getElementById('tiltMode').classList.add('active');
            document.getElementById('touchMode').classList.remove('active');
            
            if (this.soundEnabled) {
                this.playSound(500, 0.1);
            }
        });
        
        document.getElementById('touchMode').addEventListener('click', () => {
            isTiltMode = false;
            document.getElementById('touchMode').classList.add('active');
            document.getElementById('tiltMode').classList.remove('active');
            
            if (this.soundEnabled) {
                this.playSound(500, 0.1);
            }
        });
        
        document.getElementById('resetLabyrinth').addEventListener('click', () => {
            ballX = 30;
            ballY = 30;
            updateBall();
            
            if (this.hapticEnabled && 'vibrate' in navigator) {
                navigator.vibrate(30);
            }
        });
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    window.stressBallApp = new StressBallApp();
});