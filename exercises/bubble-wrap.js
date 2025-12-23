export class BubbleWrap {
    constructor(config) {
        this.container = config.container;
        this.poppedCountElement = config.poppedCountElement;
        this.hapticEnabled = config.hapticEnabled;
        this.soundEnabled = config.soundEnabled;
        this.bubbles = [];
        this.poppedCount = 0;
        this.bubbleCount = 20; // 5x4 grid
    }
    
    init() {
        this.clearContainer();
        this.generateBubbles();
        this.bindEvents();
        this.updatePoppedCount();
    }
    
    clearContainer() {
        this.container.innerHTML = '';
        this.bubbles = [];
    }
    
    generateBubbles() {
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.dataset.id = i;
            
            // Random size variation
            const size = 70 + Math.random() * 20;
            bubble.style.width = `${size}px`;
            
            // Random color variation
            const hue = 190 + Math.random() * 20;
            bubble.style.backgroundColor = `hsl(${hue}, 80%, 85%)`;
            bubble.style.borderColor = `hsl(${hue}, 80%, 65%)`;
            
            this.container.appendChild(bubble);
            this.bubbles.push({
                element: bubble,
                popped: false,
                id: i
            });
        }
    }
    
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('bubble') && !e.target.classList.contains('popped')) {
                this.popBubble(e.target);
            }
        });
        
        // Touch events for mobile
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element && element.classList.contains('bubble') && !element.classList.contains('popped')) {
                this.popBubble(element);
            }
        }, { passive: false });
        
        // Reset button
        const resetBtn = document.getElementById('resetBubbles');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetBubbles());
        }
    }
    
    popBubble(bubbleElement) {
        if (bubbleElement.classList.contains('popped')) return;
        
        // Visual effect
        bubbleElement.classList.add('popped');
        
        // Haptic feedback
        if (this.hapticEnabled() && 'vibrate' in navigator) {
            navigator.vibrate(30);
        }
        
        // Sound effect
        if (this.soundEnabled()) {
            this.playPopSound();
        }
        
        // Update count
        this.poppedCount++;
        this.updatePoppedCount();
        
        // Generate new bubble after delay if all are popped
        setTimeout(() => {
            const poppedBubbles = this.bubbles.filter(b => b.popped).length;
            if (poppedBubbles === this.bubbleCount) {
                this.resetBubbles();
            }
        }, 500);
        
        // Update bubble data
        const bubbleId = parseInt(bubbleElement.dataset.id);
        const bubble = this.bubbles.find(b => b.id === bubbleId);
        if (bubble) {
            bubble.popped = true;
        }
    }
    
    playPopSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Pop sound: quick frequency sweep
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
    
    resetBubbles() {
        this.poppedCount = 0;
        this.updatePoppedCount();
        this.clearContainer();
        this.generateBubbles();
        
        // Haptic feedback on reset
        if (this.hapticEnabled() && 'vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]);
        }
    }
    
    updatePoppedCount() {
        if (this.poppedCountElement) {
            this.poppedCountElement.textContent = this.poppedCount;
        }
    }
}