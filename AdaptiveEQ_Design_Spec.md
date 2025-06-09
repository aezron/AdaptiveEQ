# AdaptiveEQ VST Plugin Design Specification

## Overview
AdaptiveEQ is a dynamic frequency processor VST plugin for Ableton Live 10 that quickly removes harsh and muddy frequencies with minimal user effort. Similar to plugins like Soothe 2, it uses spectral processing to identify and attenuate problematic resonances in real-time, allowing for transparent and musical frequency control.

## Key Features
1. **Three-Band Processing**: Separate controls for low, mid, and high frequency bands
2. **Dynamic Processing**: Intelligent detection and reduction of problematic frequencies
3. **Real-time Spectrum Analysis**: Visual feedback of frequency content and processing
4. **Preset Management**: Save and recall settings for different scenarios
5. **Low CPU Impact**: Efficient processing algorithm suitable for live use

## Technical Specifications
- **Format**: VST3, AU (macOS), AAX (Pro Tools)
- **Platforms**: Windows, macOS
- **DAW Compatibility**: Ableton Live 10+, Logic Pro, FL Studio, Pro Tools, Cubase, etc.
- **Bit Depth**: 64-bit processing
- **Sample Rate Support**: Up to 192kHz

## User Interface
The plugin features a modern, intuitive interface with:

### Spectrum Analyzer Section
- Real-time FFT display showing frequency content
- Overlaid filter response curve showing processing amount
- Frequency scale (20Hz to 20kHz) with logarithmic display
- Level scale (-60dB to 0dB)

### Low Band Section
- Enable/Disable toggle
- Threshold control: Determines level at which processing begins
- Ratio control: Determines amount of processing applied
- Attack control: How quickly processing is applied
- Release control: How quickly processing stops
- Crossover control: Sets upper frequency limit of band

### Mid Band Section
- Enable/Disable toggle
- Threshold control
- Ratio control
- Attack control
- Release control
- Crossover control: Sets upper frequency limit of band

### High Band Section
- Enable/Disable toggle
- Threshold control
- Ratio control
- Attack control
- Release control

### Global Controls
- Input Gain: -24dB to +24dB
- Output Gain: -24dB to +24dB
- Mix: 0% (dry) to 100% (wet)
- Sensitivity: 0% to 100%, controls overall detection sensitivity

### Preset Management
- Preset selection dropdown
- Save and Delete buttons
- Factory presets for common use cases
  - Vocal Clarity
  - Remove Mud
  - Tame Brightness
  - Full Mix

## Processing Algorithm
The plugin uses a combination of:

1. **Multi-band Processing**: Divides the signal into low, mid, and high bands
2. **Envelope Detection**: Identifies frequency peaks and resonances
3. **Dynamic EQ**: Applies gain reduction only to problematic frequencies
4. **Smooth Processing**: Uses attack and release parameters to create musical gain reduction

## Default Parameters
- Low Band: 20Hz to 250Hz, -24dB threshold, 4:1 ratio
- Mid Band: 250Hz to 4kHz, -24dB threshold, 4:1 ratio
- High Band: 4kHz to 20kHz, -24dB threshold, 4:1 ratio
- Attack: 50ms
- Release: 200ms
- Sensitivity: 50%
- Mix: 100%

## System Requirements
- Windows 10/11 or macOS 10.13+
- 4GB RAM minimum
- CPU with SSE2 support
- Display resolution: 1280x720 or higher

## Use Cases
1. **Vocals**: Remove harshness and resonances in vocal recordings
2. **Guitars**: Tame string resonances and fret noise
3. **Drums**: Remove ringing frequencies and boomy resonances
4. **Full Mix**: Smooth out resonant peaks for a more balanced mix
5. **Mastering**: Gentle control of problem frequencies without affecting the overall tonal balance

## Plugin Architecture
The plugin is built using the JUCE framework with these main components:
- **PluginProcessor**: Main DSP processing and plugin parameters
- **PluginEditor**: User interface and controls
- **FrequencyProcessor**: Core algorithm for frequency analysis and dynamic processing
- **SpectrumAnalyzer**: FFT analysis and visualization
- **PresetManager**: Saving and loading presets
- **LookAndFeel**: Custom UI styling and controls

This specification outlines a professional-grade audio plugin focused on ease of use and effective results for removing problem frequencies in music production scenarios.