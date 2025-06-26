# AdaptiveEQ User Manual
## Professional Dynamic Frequency Processor

### Version 1.0 | Compatible with Ableton Live 10+ and other major DAWs

---

## Table of Contents
1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Interface Overview](#interface-overview)
4. [Controls Reference](#controls-reference)
5. [Factory Presets](#factory-presets)
6. [Custom Presets](#custom-presets)
7. [Processing Concepts](#processing-concepts)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)
10. [Technical Specifications](#technical-specifications)

---

## Introduction

AdaptiveEQ is a sophisticated dynamic frequency processor designed to automatically identify and reduce harsh, muddy, or problematic frequencies in real-time. Unlike traditional EQs that apply static cuts, AdaptiveEQ responds dynamically to your audio content, applying processing only when needed.

### Key Features
- **3-Band Dynamic Processing**: Independent low, mid, and high frequency bands
- **Real-Time Spectrum Analysis**: Visual feedback of frequency content and processing
- **Adaptive Resonance Suppression**: Automatically targets problematic frequencies
- **Factory Presets**: Professional starting points for common scenarios
- **Custom Preset Management**: Save and recall your own settings
- **Transparent Processing**: Maintains audio quality while removing unwanted content

---

## Quick Start

### Loading the Plugin
1. Open Ableton Live (or your preferred DAW)
2. Insert AdaptiveEQ on an audio track
3. Select a factory preset to start (e.g., "Vocal Clarity" for vocals)
4. Play your audio and observe the spectrum analyzer
5. Adjust Sensitivity to control processing intensity

### Basic Operation
- **Green areas** in the spectrum show clean frequencies
- **Red areas** indicate frequencies being processed
- **Darker regions** represent reduced frequency content
- Processing occurs automatically based on your settings

---

## Interface Overview

### Spectrum Analyzer
The central display shows real-time frequency analysis:
- **Horizontal axis**: Frequency (20Hz - 20kHz)
- **Vertical axis**: Amplitude (dB)
- **Color coding**: Green (clean), Yellow (moderate), Red (heavy processing)
- **White line**: Current frequency response curve

### Control Sections
- **Low Band**: 20Hz - Crossover frequency
- **Mid Band**: Low Crossover - High Crossover
- **High Band**: High Crossover - 20kHz
- **Global Controls**: Input/Output gain, Mix, Sensitivity

---

## Controls Reference

### Low Band Controls
- **Enable**: Activates/deactivates low band processing
- **Threshold**: Level at which processing begins (-60dB to 0dB)
- **Ratio**: Intensity of gain reduction (1:1 to 10:1)
- **Attack**: How quickly processing engages (1ms to 200ms)
- **Release**: How quickly processing disengages (10ms to 1000ms)
- **Crossover**: Upper frequency limit for low band (50Hz to 1kHz)

### Mid Band Controls
- **Enable**: Activates/deactivates mid band processing
- **Threshold**: Processing trigger level (-60dB to 0dB)
- **Ratio**: Compression intensity (1:1 to 10:1)
- **Attack**: Processing engagement speed (1ms to 200ms)
- **Release**: Processing release speed (10ms to 1000ms)
- **Crossover**: Upper frequency limit for mid band (1kHz to 10kHz)

### High Band Controls
- **Enable**: Activates/deactivates high band processing
- **Threshold**: Processing activation level (-60dB to 0dB)
- **Ratio**: Reduction intensity (1:1 to 10:1)
- **Attack**: How fast processing starts (1ms to 200ms)
- **Release**: How fast processing stops (10ms to 1000ms)

### Global Controls
- **Input Gain**: Pre-processing gain adjustment (-12dB to +12dB)
- **Output Gain**: Post-processing gain compensation (-12dB to +12dB)
- **Mix**: Blend between processed and dry signal (0% to 100%)
- **Sensitivity**: Overall processing sensitivity (0% to 100%)

---

## Factory Presets

### Default
- **Best for**: Starting point for any material
- **Description**: Balanced 3-band processing with moderate settings
- **Settings**: -24dB threshold, 4:1 ratio across all bands

### Vocal Clarity
- **Best for**: Lead vocals, voice-overs, podcasts
- **Description**: Reduces muddiness and harshness in vocal recordings
- **Key features**: Gentle low-end cleanup, focused midrange processing
- **Frequency focus**: 200Hz-5kHz with higher sensitivity

### Remove Mud
- **Best for**: Bass-heavy instruments, full mixes, drums
- **Description**: Aggressively targets muddy low-mid frequencies
- **Key features**: Strong low-end processing, disabled high band
- **Frequency focus**: 50Hz-2.5kHz with emphasis on 200-800Hz

### Tame Brightness
- **Best for**: Harsh cymbals, bright recordings, digital distortion
- **Description**: Smooths aggressive high frequencies
- **Key features**: High-band only processing with aggressive settings
- **Frequency focus**: 4kHz and above with high sensitivity

### Full Mix
- **Best for**: Stereo bus processing, mastering, complete mixes
- **Description**: Gentle overall enhancement with slight output boost
- **Key features**: Balanced processing across all bands with conservative settings
- **Frequency focus**: Full spectrum with 85% mix for transparency

---

## Custom Presets

### Saving Presets
1. Adjust all parameters to desired settings
2. Click "Save Preset" button
3. Enter a descriptive name
4. Your preset appears in the dropdown menu

### Managing Presets
- **Load**: Select from dropdown menu
- **Delete**: Select user preset and click "Delete"
- **Organize**: User presets appear below factory presets with separator

### Preset Naming Tips
- Use descriptive names: "Vocal DeEsser", "Kick Drum Punch"
- Include instrument/source: "Electric Guitar Clean", "Snare Top Mic"
- Note processing focus: "High Cut Only", "Mud Removal Gentle"

---

## Processing Concepts

### Dynamic vs. Static Processing
- **Static EQ**: Always applies the same frequency changes
- **Dynamic EQ**: Only processes when problematic content is present
- **AdaptiveEQ**: Analyzes content and adapts processing in real-time

### Multi-Band Operation
Each band operates independently:
1. **Analysis**: FFT examines frequency content
2. **Detection**: Identifies problematic frequencies
3. **Processing**: Applies gain reduction only when needed
4. **Blending**: Combines processed bands seamlessly

### Attack and Release Times
- **Fast Attack**: Quickly catches transient problems (good for drums)
- **Slow Attack**: Gentler processing (good for sustained instruments)
- **Fast Release**: Quick recovery (transparent processing)
- **Slow Release**: Smoother, more musical processing

### Sensitivity Parameter
Controls the overall "aggressiveness" of processing:
- **Low (0-30%)**: Subtle, only catches major problems
- **Medium (30-70%)**: Balanced, catches most issues
- **High (70-100%)**: Aggressive, processes minor imperfections

---

## Usage Examples

### Vocal Processing
1. Load "Vocal Clarity" preset
2. Adjust Low Crossover to 150-300Hz (depending on voice)
3. Set Mid Crossover to 3-6kHz (avoid over-processing presence)
4. Fine-tune Sensitivity to taste (typically 50-80%)

### Drum Bus Processing
1. Start with "Remove Mud" preset
2. Enable High band for cymbal control
3. Set Low Crossover around 80-120Hz
4. Use moderate Sensitivity (40-60%) to maintain punch

### Mix Bus Processing
1. Use "Full Mix" preset as starting point
2. Lower all ratios to 2:1 - 3:1 for gentler processing
3. Set Mix to 50-75% for parallel processing effect
4. Use low Sensitivity (20-40%) for subtle enhancement

### Acoustic Guitar
1. Start with "Default" preset
2. Disable Low band (or set very low threshold)
3. Focus Mid band on 200-800Hz for body resonances
4. Use High band for pick noise and string squeak

### Bass Guitar
1. Use "Remove Mud" with modifications
2. Set Low Crossover to 80-100Hz
3. Focus processing on 100-400Hz range
4. Disable High band unless needed for string noise

---

## Troubleshooting

### Common Issues

**No Processing Occurring**
- Check that bands are enabled
- Verify thresholds aren't too low
- Increase Sensitivity
- Ensure Mix isn't at 0%

**Too Much Processing**
- Lower Sensitivity
- Raise thresholds
- Reduce ratios
- Adjust Mix for parallel processing

**Audio Distortion**
- Check Input Gain levels
- Ensure output isn't clipping
- Verify sample rate compatibility
- Reduce processing intensity

**Plugin Not Loading**
- Verify plugin is in correct folder
- Rescan plugins in DAW
- Check DAW compatibility
- Restart DAW if necessary

### Optimization Tips

**CPU Usage**
- Disable unused bands
- Use appropriate buffer sizes
- Avoid multiple instances on same material
- Consider bouncing processed audio

**Best Practices**
- Use bypass to compare processed vs. unprocessed
- Don't over-process - less is often more
- Trust your ears over visual feedback
- Save presets for repeated use

---

## Technical Specifications

### Audio Specifications
- **Sample Rates**: 44.1kHz, 48kHz, 88.2kHz, 96kHz, 192kHz
- **Bit Depth**: 16-bit, 24-bit, 32-bit float
- **Channels**: Mono, Stereo
- **Latency**: <5ms (sample rate dependent)
- **Dynamic Range**: 24-bit: 144dB, 32-bit: Unlimited

### Processing Specifications
- **FFT Size**: 2048 points
- **Analysis Window**: Hann window
- **Frequency Range**: 20Hz - 20kHz
- **Bands**: 3 (Low, Mid, High)
- **Crossover Types**: 2nd-order Butterworth
- **Processing Type**: Dynamic gain reduction

### System Requirements
- **Windows**: Windows 10 or later, VST3 compatible DAW
- **Mac**: macOS 10.13 or later, AU/VST3 compatible DAW
- **Linux**: Ubuntu 18.04 or later, VST3 compatible DAW
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: Multi-core processor recommended

### Plugin Formats
- **VST3**: Windows, Mac, Linux
- **Audio Unit**: Mac only
- **Standalone**: All platforms

---

## Support and Updates

### Getting Help
- Check this manual for common solutions
- Visit our GitHub repository for latest updates
- Report bugs through GitHub issues
- Community support through forums

### Version History
- **v1.0**: Initial release with 3-band processing and factory presets
- **v1.1**: Added custom preset management
- **v1.2**: Improved spectrum analyzer and CPU optimization

### License
AdaptiveEQ is released under MIT License. See LICENSE file for details.

---

*AdaptiveEQ User Manual v1.0 - Professional Dynamic Frequency Processor*