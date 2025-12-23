export class Kaleidoscope {
    constructor(config) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.currentColorElement = config.currentColorElement;
        this.segmentCountElement = config.segmentCountElement;
        this.soundEnabled = config.soundEnabled;
        
        this.segments = 6;
        this.isDrawing = false;
        this.lastPoint = { x: 0, y: 0 };
        this.currentColor = this.getRandomColor();
        
        // For drawing smooth lines
        this.points = [];
        this.maxPoints = 3;
    }
    
    init() {
        this.setupCanvas();
        this.bindEvents();
        this.updateColorIndicator();
        this.drawInitialPattern();
    }
    
    setupCanvas() {
        // Set canvas size to match display size
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    bindEvents() {
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
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
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
        
        // Sound feedback
        if (this.soundEnabled()) {
            this.playDrawSound();
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const point = this.getCanvasPoint(e);
        this.points.push(point);
        
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
        
        // Draw smooth curve through points
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
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = 3;
        
        const angleStep = (2 * Math.PI) / this.segments;
        
        for (let i = 0; i < this.segments; i++) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(i * angleStep);
            
            // Draw curve in this segment
            this.drawCurveSegment(points, centerX, centerY);
            
            // If segments > 6, also draw mirrored version
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
            // Simple line for 2 points
            this.ctx.moveTo(points[0].x - centerX, points[0].y - centerY);
            this.ctx.lineTo(points[1].x - centerX, points[1].y - centerY);
        } else if (points.length >= 3) {
            // Quadratic curve for smoother drawing
            const cp = this.calculateControlPoint(points);
            this.ctx.moveTo(points[0].x - centerX, points[0].y - centerY);
            this.ctx.quadraticCurveTo(
                cp.x - centerX, 
                cp.y - centerY,
                points[2].x - centerX, 
                points[2].y - centerY
            );
        }
        
        this.ctx.stroke();
    }
    
    calculateControlPoint(points) {
        // Calculate a control point for quadratic curve
        return {
            x: points[1].x,
            y: points[1].y
        };
    }
    
    drawInitialPattern() {
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-color');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    clearCanvas() {
        this.drawInitialPattern();
        
        // Sound feedback
        if (this.soundEnabled()) {
            this.playClearSound();
        }
    }
    
    changeColor() {
        this.currentColor = this.getRandomColor();
        this.updateColorIndicator();
        
        // Sound feedback
        if (this.soundEnabled()) {
            this.playColorChangeSound();
        }
    }
    
    changeSegments() {
        this.segments = this.segments === 6 ? 8 : this.segments === 8 ? 10 : 6;
        
        if (this.segmentCountElement) {
            this.segmentCountElement.textContent = this.segments;
        }
        
        // Sound feedback
        if (this.soundEnabled()) {
            this.playSegmentChangeSound();
        }
    }
    
    getRandomColor() {
        const hues = [0, 30, 60, 120, 180, 240, 300, 330]; // Red, orange, yellow, green, cyan, blue, purple, magenta
        const randomHue = hues[Math.floor(Math.random() * hues.length)];
        return `hsl(${randomHue}, 70%, 50%)`;
    }
    
    updateColorIndicator() {
        if (this.currentColorElement) {
            this.currentColorElement.style.backgroundColor = this.currentColor;
        }
    }
    
    playDrawSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 300 + Math.random() * 200;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    playClearSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    playColorChangeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Upward sweep for color change
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.15);
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    playSegmentChangeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Two quick beeps for segment change
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.25);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
}