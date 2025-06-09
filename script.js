// AdaptiveEQ Web Audio Plugin JavaScript

class AdaptiveEQ {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.sourceNode = null;
        this.analyserNode = null;
        this.gainNode = null;
        this.isPlaying = false;
        
        // Plugin parameters
        this.parameters = {
            lowEnabled: true,
            lowThreshold: -24,
            lowRatio: 4,
            lowAttack: 50,
            lowRelease: 200,
            lowCrossover: 250,
            
            midEnabled: true,
            midThreshold: -24,
            midRatio: 4,
            midAttack: 50,
            midRelease: 200,
            midCrossover: 4000,
            
            highEnabled: true,
            highThreshold: -24,
            highRatio: 4,
            highAttack: 50,
            highRelease: 200,
            
            inputGain: 0,
            outputGain: 0,
            mix: 100,
            sensitivity: 50
        };
        
        // Spectrum data
        this.spectrumData = new Float32Array(1024);
        this.canvas = document.getElementById('spectrumCanvas');
        this.canvasCtx = this.canvas.getContext('2d');
        
        this.initializeUI();
        this.initializePresets().then(() => {
            // Load default preset after presets are loaded
            this.loadPreset('factory_default');
        });
        this.startVisualization();
    }
    
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create analyzer node for spectrum visualization
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 2048;
            this.analyserNode.smoothingTimeConstant = 0.8;
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 0.5;
            
            // Connect nodes
            this.analyserNode.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            // Generate test tone for demonstration
            this.generateTestSignal();
            
            document.getElementById('startAudio').textContent = 'Stop Audio';
            document.getElementById('powerLed').style.background = '#00ff00';
            
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }
    
    generateTestSignal() {
        // Create a complex test signal with multiple frequencies
        const bufferSize = this.audioContext.sampleRate * 4; // 4 seconds
        this.audioBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const channelData = this.audioBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.audioContext.sampleRate;
            
            // Mix of frequencies to demonstrate the EQ
            let sample = 0;
            sample += 0.3 * Math.sin(2 * Math.PI * 150 * time); // Low frequency
            sample += 0.4 * Math.sin(2 * Math.PI * 1000 * time); // Mid frequency
            sample += 0.2 * Math.sin(2 * Math.PI * 5000 * time); // High frequency
            sample += 0.1 * Math.sin(2 * Math.PI * 8000 * time); // High frequency
            
            // Add some noise for realism
            sample += 0.05 * (Math.random() * 2 - 1);
            
            // Apply envelope to prevent clicks
            const envelope = Math.min(1, Math.min(time * 10, (4 - time) * 10));
            channelData[i] = sample * envelope * 0.3;
        }
    }
    
    playTestSignal() {
        if (!this.audioContext) return;
        
        if (this.sourceNode) {
            this.sourceNode.stop();
        }
        
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.audioBuffer;
        this.sourceNode.loop = true;
        this.sourceNode.connect(this.analyserNode);
        this.sourceNode.start();
        this.isPlaying = true;
    }
    
    stopAudio() {
        if (this.sourceNode) {
            this.sourceNode.stop();
            this.sourceNode = null;
        }
        this.isPlaying = false;
        document.getElementById('startAudio').textContent = 'Start Audio';
        document.getElementById('powerLed').style.background = '#00a0c8';
    }
    
    initializeUI() {
        // Initialize knobs
        document.querySelectorAll('.knob').forEach(knob => {
            this.initializeKnob(knob);
        });
        
        // Initialize toggles
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const bandType = e.target.id.replace('Enabled', '');
                this.parameters[bandType + 'Enabled'] = e.target.checked;
                this.updateProcessing();
            });
        });
        
        // Audio controls
        document.getElementById('startAudio').addEventListener('click', () => {
            if (!this.audioContext) {
                this.initializeAudio().then(() => {
                    this.playTestSignal();
                });
            } else if (this.isPlaying) {
                this.stopAudio();
            } else {
                this.playTestSignal();
            }
        });
        
        document.getElementById('loadFile').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.loadAudioFile(e.target.files[0]);
        });
        
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (this.gainNode) {
                this.gainNode.gain.value = volume;
            }
        });
        
        // Preset controls
        document.getElementById('presetSelect').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });
        
        document.getElementById('savePreset').addEventListener('click', () => {
            this.saveCustomPreset();
        });
        
        document.getElementById('deletePreset').addEventListener('click', () => {
            this.deleteCustomPreset();
        });
    }
    
    initializeKnob(knobElement) {
        const param = knobElement.dataset.param;
        const min = parseFloat(knobElement.dataset.min);
        const max = parseFloat(knobElement.dataset.max);
        const value = parseFloat(knobElement.dataset.value);
        
        let isDragging = false;
        let startY = 0;
        let startValue = value;
        
        // Set initial rotation
        this.updateKnobRotation(knobElement, value, min, max);
        
        const startDrag = (e) => {
            isDragging = true;
            startY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
            startValue = this.parameters[param] || value;
            knobElement.style.cursor = 'grabbing';
            e.preventDefault();
        };
        
        const drag = (e) => {
            if (!isDragging) return;
            
            const currentY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : startY);
            const deltaY = startY - currentY;
            const sensitivity = 0.5;
            const range = max - min;
            const newValue = Math.max(min, Math.min(max, startValue + (deltaY * sensitivity * range / 100)));
            
            this.parameters[param] = newValue;
            this.updateKnobRotation(knobElement, newValue, min, max);
            this.updateValueDisplay(knobElement, newValue, param);
            this.updateProcessing();
            
            e.preventDefault();
        };
        
        const endDrag = () => {
            isDragging = false;
            knobElement.style.cursor = 'pointer';
        };
        
        // Mouse events
        knobElement.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // Touch events
        knobElement.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        // Initialize value display
        this.updateValueDisplay(knobElement, value, param);
    }
    
    updateKnobRotation(knobElement, value, min, max) {
        const percentage = (value - min) / (max - min);
        const rotation = -135 + (percentage * 270); // -135° to +135°
        const pointer = knobElement.querySelector('.knob-pointer');
        pointer.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    }
    
    updateValueDisplay(knobElement, value, param) {
        const valueElement = knobElement.parentElement.querySelector('.value');
        let displayValue = '';
        
        if (param.includes('Threshold') || param.includes('Gain')) {
            displayValue = `${value.toFixed(1)} dB`;
        } else if (param.includes('Ratio')) {
            displayValue = `${value.toFixed(1)}:1`;
        } else if (param.includes('Attack') || param.includes('Release')) {
            displayValue = `${Math.round(value)} ms`;
        } else if (param.includes('Crossover')) {
            if (value >= 1000) {
                displayValue = `${(value / 1000).toFixed(1)} kHz`;
            } else {
                displayValue = `${Math.round(value)} Hz`;
            }
        } else if (param.includes('mix') || param.includes('sensitivity')) {
            displayValue = `${Math.round(value)}%`;
        } else {
            displayValue = value.toFixed(1);
        }
        
        valueElement.textContent = displayValue;
    }
    
    updateProcessing() {
        // In a real implementation, this would update the audio processing
        // For now, we'll just update the visualization
        this.updateFilterResponse();
    }
    
    updateFilterResponse() {
        // Calculate filter response based on current parameters
        // This is a simplified visualization
        const canvas = this.canvas;
        const ctx = this.canvasCtx;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear previous filter response
        // This will be drawn in the visualization loop
    }
    
    async loadAudioFile(file) {
        if (!file || !this.audioContext) return;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (this.isPlaying) {
                this.stopAudio();
                this.playTestSignal();
            }
        } catch (error) {
            console.error('Error loading audio file:', error);
            alert('Error loading audio file. Please try a different file.');
        }
    }
    
    async initializePresets() {
        this.sessionId = this.getSessionId();
        await this.loadPresetsFromAPI();
    }
    
    getSessionId() {
        let sessionId = localStorage.getItem('adaptiveEQ_sessionId');
        if (!sessionId) {
            sessionId = this.generateSessionId();
            localStorage.setItem('adaptiveEQ_sessionId', sessionId);
        }
        return sessionId;
    }
    
    generateSessionId() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    async loadPresetsFromAPI() {
        try {
            const response = await fetch('/api/presets', {
                headers: {
                    'x-session-id': this.sessionId
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.userPresets = data.userPresets || [];
                this.factoryPresets = data.factoryPresets || [];
                this.populatePresetDropdown();
            } else {
                console.error('Failed to load presets from API');
                this.initializeFallbackPresets();
            }
        } catch (error) {
            console.error('Error loading presets:', error);
            this.initializeFallbackPresets();
        }
    }
    
    initializeFallbackPresets() {
        this.factoryPresets = [
            { id: 'default', name: 'Default', ...this.parameters },
            { id: 'vocal-clarity', name: 'Vocal Clarity', ...this.parameters, lowThreshold: -30, lowRatio: 5, lowCrossover: 200, midThreshold: -20, midRatio: 6, midCrossover: 5000, highThreshold: -18, highRatio: 3, sensitivity: 70 },
            { id: 'remove-mud', name: 'Remove Mud', ...this.parameters, lowThreshold: -24, lowRatio: 8, lowCrossover: 300, midThreshold: -30, midRatio: 3, midCrossover: 2500, highEnabled: false, sensitivity: 60 },
            { id: 'tame-brightness', name: 'Tame Brightness', ...this.parameters, lowEnabled: false, midEnabled: false, highThreshold: -18, highRatio: 6, sensitivity: 80 },
            { id: 'full-mix', name: 'Full Mix', ...this.parameters, lowThreshold: -24, lowRatio: 4, lowCrossover: 250, midThreshold: -20, midRatio: 3, midCrossover: 3500, highThreshold: -20, highRatio: 4, outputGain: 2, mix: 85, sensitivity: 45 }
        ];
        this.userPresets = [];
        this.populatePresetDropdown();
    }
    
    populatePresetDropdown() {
        const presetSelect = document.getElementById('presetSelect');
        presetSelect.innerHTML = '';
        
        // Add factory presets
        this.factoryPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = `factory_${preset.id || preset.name.toLowerCase().replace(/\s+/g, '-')}`;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });
        
        // Add separator if user presets exist
        if (this.userPresets.length > 0) {
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '─── User Presets ───';
            presetSelect.appendChild(separator);
            
            // Add user presets
            this.userPresets.forEach(preset => {
                const option = document.createElement('option');
                option.value = `user_${preset.id}`;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
        }
    }
    
    loadPreset(presetValue) {
        let preset = null;
        
        if (presetValue.startsWith('factory_')) {
            const presetId = presetValue.replace('factory_', '');
            preset = this.factoryPresets.find(p => (p.id || p.name.toLowerCase().replace(/\s+/g, '-')) === presetId);
        } else if (presetValue.startsWith('user_')) {
            const presetId = parseInt(presetValue.replace('user_', ''));
            preset = this.userPresets.find(p => p.id === presetId);
        }
        
        if (!preset) return;
        
        // Map database fields to parameter names
        this.parameters = {
            lowEnabled: preset.low_enabled ?? preset.lowEnabled ?? true,
            lowThreshold: preset.low_threshold ?? preset.lowThreshold ?? -24,
            lowRatio: preset.low_ratio ?? preset.lowRatio ?? 4,
            lowAttack: preset.low_attack ?? preset.lowAttack ?? 50,
            lowRelease: preset.low_release ?? preset.lowRelease ?? 200,
            lowCrossover: preset.low_crossover ?? preset.lowCrossover ?? 250,
            
            midEnabled: preset.mid_enabled ?? preset.midEnabled ?? true,
            midThreshold: preset.mid_threshold ?? preset.midThreshold ?? -24,
            midRatio: preset.mid_ratio ?? preset.midRatio ?? 4,
            midAttack: preset.mid_attack ?? preset.midAttack ?? 50,
            midRelease: preset.mid_release ?? preset.midRelease ?? 200,
            midCrossover: preset.mid_crossover ?? preset.midCrossover ?? 4000,
            
            highEnabled: preset.high_enabled ?? preset.highEnabled ?? true,
            highThreshold: preset.high_threshold ?? preset.highThreshold ?? -24,
            highRatio: preset.high_ratio ?? preset.highRatio ?? 4,
            highAttack: preset.high_attack ?? preset.highAttack ?? 50,
            highRelease: preset.high_release ?? preset.highRelease ?? 200,
            
            inputGain: preset.input_gain ?? preset.inputGain ?? 0,
            outputGain: preset.output_gain ?? preset.outputGain ?? 0,
            mix: preset.mix ?? 100,
            sensitivity: preset.sensitivity ?? 50
        };
        
        this.updateUIFromParameters();
        this.updateProcessing();
    }
    
    updateUIFromParameters() {
        // Update knobs
        document.querySelectorAll('.knob').forEach(knob => {
            const param = knob.dataset.param;
            const min = parseFloat(knob.dataset.min);
            const max = parseFloat(knob.dataset.max);
            const value = this.parameters[param];
            
            if (value !== undefined) {
                this.updateKnobRotation(knob, value, min, max);
                this.updateValueDisplay(knob, value, param);
            }
        });
        
        // Update toggles
        document.getElementById('lowEnabled').checked = this.parameters.lowEnabled;
        document.getElementById('midEnabled').checked = this.parameters.midEnabled;
        document.getElementById('highEnabled').checked = this.parameters.highEnabled;
    }
    
    async saveCustomPreset() {
        const name = prompt('Enter preset name:');
        if (name && name.trim()) {
            try {
                const presetData = {
                    name: name.trim(),
                    description: `User preset: ${name.trim()}`,
                    lowEnabled: this.parameters.lowEnabled,
                    lowThreshold: this.parameters.lowThreshold,
                    lowRatio: this.parameters.lowRatio,
                    lowAttack: this.parameters.lowAttack,
                    lowRelease: this.parameters.lowRelease,
                    lowCrossover: this.parameters.lowCrossover,
                    midEnabled: this.parameters.midEnabled,
                    midThreshold: this.parameters.midThreshold,
                    midRatio: this.parameters.midRatio,
                    midAttack: this.parameters.midAttack,
                    midRelease: this.parameters.midRelease,
                    midCrossover: this.parameters.midCrossover,
                    highEnabled: this.parameters.highEnabled,
                    highThreshold: this.parameters.highThreshold,
                    highRatio: this.parameters.highRatio,
                    highAttack: this.parameters.highAttack,
                    highRelease: this.parameters.highRelease,
                    inputGain: this.parameters.inputGain,
                    outputGain: this.parameters.outputGain,
                    mix: this.parameters.mix,
                    sensitivity: this.parameters.sensitivity
                };
                
                const response = await fetch('/api/presets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': this.sessionId
                    },
                    body: JSON.stringify(presetData)
                });
                
                if (response.ok) {
                    const savedPreset = await response.json();
                    this.userPresets.push(savedPreset);
                    this.populatePresetDropdown();
                    
                    // Select the newly saved preset
                    document.getElementById('presetSelect').value = `user_${savedPreset.id}`;
                    alert('Preset saved successfully!');
                } else {
                    alert('Failed to save preset. Please try again.');
                }
            } catch (error) {
                console.error('Error saving preset:', error);
                alert('Error saving preset. Please try again.');
            }
        }
    }
    
    async deleteCustomPreset() {
        const currentPreset = document.getElementById('presetSelect').value;
        if (currentPreset && currentPreset.startsWith('user_')) {
            if (confirm('Are you sure you want to delete this preset?')) {
                try {
                    const presetId = parseInt(currentPreset.replace('user_', ''));
                    
                    const response = await fetch(`/api/presets/${presetId}`, {
                        method: 'DELETE',
                        headers: {
                            'x-session-id': this.sessionId
                        }
                    });
                    
                    if (response.ok) {
                        // Remove from local array
                        this.userPresets = this.userPresets.filter(p => p.id !== presetId);
                        this.populatePresetDropdown();
                        
                        // Select default preset
                        document.getElementById('presetSelect').value = 'factory_default';
                        this.loadPreset('factory_default');
                        alert('Preset deleted successfully!');
                    } else {
                        alert('Failed to delete preset. Please try again.');
                    }
                } catch (error) {
                    console.error('Error deleting preset:', error);
                    alert('Error deleting preset. Please try again.');
                }
            }
        } else {
            alert('Cannot delete factory presets.');
        }
    }
    
    startVisualization() {
        const animate = () => {
            if (this.analyserNode && this.isPlaying) {
                this.analyserNode.getFloatFrequencyData(this.spectrumData);
            }
            
            this.drawSpectrum();
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    drawSpectrum() {
        const canvas = this.canvas;
        const ctx = this.canvasCtx;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Frequency grid lines
        const freqs = [100, 1000, 10000];
        freqs.forEach(freq => {
            const x = this.frequencyToX(freq, width);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        });
        
        // dB grid lines
        for (let db = -60; db <= 0; db += 20) {
            const y = this.dbToY(db, height);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw spectrum
        if (this.isPlaying && this.spectrumData) {
            ctx.strokeStyle = '#00a0c8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < this.spectrumData.length; i++) {
                const freq = (i * this.audioContext.sampleRate) / (this.spectrumData.length * 2);
                const x = this.frequencyToX(freq, width);
                const y = this.dbToY(this.spectrumData[i], height);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Fill area under curve
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#00a0c8';
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Draw filter response
        this.drawFilterResponse(ctx, width, height);
    }
    
    drawFilterResponse(ctx, width, height) {
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        // Calculate filter response based on parameters
        for (let x = 0; x < width; x += 2) {
            const freq = this.xToFrequency(x, width);
            let response = 0;
            
            // Low band response
            if (this.parameters.lowEnabled && freq < this.parameters.lowCrossover) {
                const gainReduction = this.calculateGainReduction('low', freq);
                response += gainReduction;
            }
            
            // Mid band response
            if (this.parameters.midEnabled && freq >= this.parameters.lowCrossover && freq < this.parameters.midCrossover) {
                const gainReduction = this.calculateGainReduction('mid', freq);
                response += gainReduction;
            }
            
            // High band response
            if (this.parameters.highEnabled && freq >= this.parameters.midCrossover) {
                const gainReduction = this.calculateGainReduction('high', freq);
                response += gainReduction;
            }
            
            const y = this.dbToY(response, height);
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    calculateGainReduction(band, freq) {
        const threshold = this.parameters[band + 'Threshold'];
        const ratio = this.parameters[band + 'Ratio'];
        const sensitivity = this.parameters.sensitivity / 100;
        
        // Simplified gain reduction calculation
        const baseReduction = -6 * (ratio - 1) * sensitivity;
        
        // Frequency-dependent scaling
        let freqScale = 1;
        if (band === 'low') {
            freqScale = Math.min(1, this.parameters.lowCrossover / Math.max(freq, 20));
        } else if (band === 'mid') {
            const normalizedFreq = (freq - this.parameters.lowCrossover) / 
                                  (this.parameters.midCrossover - this.parameters.lowCrossover);
            freqScale = 1 - Math.abs(normalizedFreq - 0.5) * 2;
        } else if (band === 'high') {
            freqScale = Math.min(1, (freq - this.parameters.midCrossover) / (20000 - this.parameters.midCrossover));
        }
        
        return baseReduction * freqScale;
    }
    
    frequencyToX(freq, width) {
        const minFreq = 20;
        const maxFreq = 20000;
        const logMin = Math.log10(minFreq);
        const logMax = Math.log10(maxFreq);
        const logFreq = Math.log10(Math.max(freq, minFreq));
        
        return ((logFreq - logMin) / (logMax - logMin)) * width;
    }
    
    xToFrequency(x, width) {
        const minFreq = 20;
        const maxFreq = 20000;
        const logMin = Math.log10(minFreq);
        const logMax = Math.log10(maxFreq);
        const proportion = x / width;
        
        return Math.pow(10, logMin + proportion * (logMax - logMin));
    }
    
    dbToY(db, height) {
        const minDb = -80;
        const maxDb = 20;
        const proportion = (db - maxDb) / (minDb - maxDb);
        return proportion * height;
    }
}

// Initialize the plugin when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdaptiveEQ();
});