// Main app module
import { BubbleWrap } from './exercises/bubble-wrap.js';
import { Kaleidoscope } from './exercises/kaleidoscope.js';
import { Labyrinth } from './exercises/labyrinth.js';

class StressBallApp {
    constructor() {
        this.currentExercise = 'bubble-wrap';
        this.soundEnabled = false; // Start with sound off
        this.hapticEnabled = true; // Start with haptic on
        this.theme = 'light';
        this.deferredPrompt = null;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initExercises();
        this.initServiceWorker();
        this.setupInstallPrompt();
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
        
        // Install prompt
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissInstall = document.getElementById('dismissInstall');
        
        // Stats elements
        this.poppedCountElement = document.getElementById('poppedCount');
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
        
        // Install prompt
        if (this.installBtn) {
            this.installBtn.addEventListener('click', () => this.installApp());
        }
        
        if (this.dismissInstall) {
            this.dismissInstall.addEventListener('click', () => {
                this.installPrompt.style.display = 'none';
            });
        }
        
        // Before install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // App installed
        window.addEventListener('appinstalled', () => {
            this.installPrompt.style.display = 'none';
            this.deferredPrompt = null;
        });
    }
    
    initExercises() {
        // Initialize each exercise
        this.bubbleWrap = new BubbleWrap({
            container: document.getElementById('bubbleContainer'),
            poppedCountElement: this.poppedCountElement,
            hapticEnabled: () => this.hapticEnabled,
            soundEnabled: () => this.soundEnabled
        });
        
        this.kaleidoscope = new Kaleidoscope({
            canvas: document.getElementById('kaleidoscopeCanvas'),
            currentColorElement: document.getElementById('currentColor'),
            segmentCountElement: document.getElementById('segmentCount'),
            soundEnabled: () => this.soundEnabled
        });
        
        this.labyrinth = new Labyrinth({
            container: document.getElementById('labyrinth'),
            ball: document.getElementById('labyrinthBall'),
            center: document.getElementById('labyrinthCenter'),
            timeSpentElement: document.getElementById('timeSpent'),
            successCountElement: document.getElementById('successCount'),
            hapticEnabled: () => this.hapticEnabled,
            soundEnabled: () => this.soundEnabled
        });
        
        // Initialize with bubble wrap
        this.bubbleWrap.init();
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
        
        // Initialize the selected exercise if needed
        this.currentExercise = exercise;
        
        switch(exercise) {
            case 'bubble-wrap':
                this.bubbleWrap.init();
                break;
            case 'kaleidoscope':
                this.kaleidoscope.init();
                break;
            case 'labyrinth':
                this.labyrinth.init();
                break;
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        localStorage.setItem('stressball-sound', this.soundEnabled);
        
        // Provide feedback
        if (this.soundEnabled) {
            this.playFeedbackSound();
        }
    }
    
    toggleHaptic() {
        this.hapticEnabled = !this.hapticEnabled;
        this.hapticToggle.textContent = this.hapticEnabled ? '📳' : '📴';
        localStorage.setItem('stressball-haptic', this.hapticEnabled);
        
        // Provide haptic feedback if enabled
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
    
    playFeedbackSound() {
        // Simple beep sound using Web Audio API
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }
    
    showInstallPrompt() {
        // Only show prompt if not already installed and not dismissed recently
        const dismissed = localStorage.getItem('stressball-install-dismissed');
        if (!dismissed && this.deferredPrompt) {
            this.installPrompt.style.display = 'flex';
        }
    }
    
    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        
        this.deferredPrompt = null;
        this.installPrompt.style.display = 'none';
    }
    
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration.scope);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stressBallApp = new StressBallApp();
});

// Export for modules
export { StressBallApp };