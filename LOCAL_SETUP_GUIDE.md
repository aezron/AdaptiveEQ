# AdaptiveEQ VST Plugin - Local JUCE Setup Guide

## Prerequisites

### Windows
1. **Visual Studio 2019/2022** (Community Edition is free)
   - Include "Desktop development with C++" workload
   - Windows 10/11 SDK

2. **JUCE Framework**
   - Download from: https://juce.com/get-juce
   - Choose "JUCE 7.x" (latest stable)
   - Install Projucer application

### Mac
1. **Xcode** (from App Store)
2. **JUCE Framework** (same as Windows)

### Linux
1. **Build tools**: `sudo apt-get install build-essential cmake`
2. **Development libraries**:
   ```bash
   sudo apt-get install libasound2-dev libx11-dev libxext-dev libxrandr-dev libxinerama-dev libxcursor-dev libfreetype6-dev libfontconfig1-dev
   ```
3. **JUCE Framework** (same as above)

## Project Setup Steps

### 1. Create New JUCE Project
1. Open **Projucer**
2. Create new project: **Audio Plug-In**
3. Set project name: `AdaptiveEQ`
4. Choose project location
5. Set plugin formats:
   - ✅ VST3
   - ✅ AU (Mac only)
   - ✅ Standalone

### 2. Configure Project Settings
In Projucer, set these important settings:
- **Plugin Manufacturer**: Your name/company
- **Plugin Code**: `AdeQ` (4-character unique ID)
- **Plugin Manufacturer Code**: `Manu` (4-character unique ID)
- **Plugin Accepts Midi**: No
- **Plugin Produces Midi**: No
- **Plugin Is Synth**: No
- **Plugin Wants Midi Input**: No

### 3. Add Source Files
Copy these files from the Replit project to your JUCE project's Source folder:

## Core Algorithm Implementation

Create `PluginProcessor.h`:
```cpp
#pragma once
#include <JuceHeader.h>

class AdaptiveEQProcessor : public juce::AudioProcessor
{
public:
    AdaptiveEQProcessor();
    ~AdaptiveEQProcessor() override;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "AdaptiveEQ"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram (int index) override {}
    const juce::String getProgramName (int index) override { return {}; }
    void changeProgramName (int index, const juce::String& newName) override {}

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    // Parameters
    juce::AudioProcessorValueTreeState parameters;

private:
    // DSP Components
    juce::dsp::FFT fft;
    juce::dsp::WindowingFunction<float> window;
    std::vector<float> fftData;
    std::vector<float> spectrumData;
    
    // Filter banks for 3-band processing
    juce::dsp::IIR::Filter<float> lowpassFilter, highpassFilter;
    juce::dsp::Compressor<float> lowCompressor, midCompressor, highCompressor;
    
    // Analysis
    float sampleRate = 44100.0f;
    int fftSize = 2048;
    int fftOrder = 11;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AdaptiveEQProcessor)
};
```

Create `PluginProcessor.cpp`:
```cpp
#include "PluginProcessor.h"
#include "PluginEditor.h"

AdaptiveEQProcessor::AdaptiveEQProcessor()
    : AudioProcessor (BusesProperties().withInput("Input", juce::AudioChannelSet::stereo(), true)
                                       .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      parameters(*this, nullptr, "Parameters", {
          std::make_unique<juce::AudioParameterFloat>("lowThreshold", "Low Threshold", -60.0f, 0.0f, -24.0f),
          std::make_unique<juce::AudioParameterFloat>("lowRatio", "Low Ratio", 1.0f, 10.0f, 4.0f),
          std::make_unique<juce::AudioParameterFloat>("lowCrossover", "Low Crossover", 50.0f, 1000.0f, 250.0f),
          std::make_unique<juce::AudioParameterFloat>("midThreshold", "Mid Threshold", -60.0f, 0.0f, -24.0f),
          std::make_unique<juce::AudioParameterFloat>("midRatio", "Mid Ratio", 1.0f, 10.0f, 4.0f),
          std::make_unique<juce::AudioParameterFloat>("midCrossover", "Mid Crossover", 1000.0f, 10000.0f, 4000.0f),
          std::make_unique<juce::AudioParameterFloat>("highThreshold", "High Threshold", -60.0f, 0.0f, -24.0f),
          std::make_unique<juce::AudioParameterFloat>("highRatio", "High Ratio", 1.0f, 10.0f, 4.0f),
          std::make_unique<juce::AudioParameterFloat>("sensitivity", "Sensitivity", 0.0f, 100.0f, 50.0f),
          std::make_unique<juce::AudioParameterFloat>("mix", "Mix", 0.0f, 100.0f, 100.0f)
      }),
      fft(fftOrder),
      window(fftSize, juce::dsp::WindowingFunction<float>::hann)
{
    fftData.resize(fftSize * 2, 0.0f);
    spectrumData.resize(fftSize / 2, 0.0f);
}

void AdaptiveEQProcessor::prepareToPlay(double newSampleRate, int samplesPerBlock)
{
    sampleRate = static_cast<float>(newSampleRate);
    
    juce::dsp::ProcessSpec spec;
    spec.sampleRate = newSampleRate;
    spec.maximumBlockSize = samplesPerBlock;
    spec.numChannels = getTotalNumOutputChannels();
    
    // Configure filters and compressors
    lowCompressor.prepare(spec);
    midCompressor.prepare(spec);
    highCompressor.prepare(spec);
    
    // Setup crossover filters
    *lowpassFilter.coefficients = juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, 250.0f);
    *highpassFilter.coefficients = juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, 4000.0f);
}

void AdaptiveEQProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    
    auto totalNumInputChannels = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();
    
    // Clear unused output channels
    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear(i, 0, buffer.getNumSamples());
    
    // Process each channel
    for (int channel = 0; channel < totalNumInputChannels; ++channel)
    {
        auto* channelData = buffer.getWritePointer(channel);
        auto numSamples = buffer.getNumSamples();
        
        // FFT Analysis for adaptive processing
        if (numSamples <= fftSize)
        {
            std::copy(channelData, channelData + numSamples, fftData.begin());
            std::fill(fftData.begin() + numSamples, fftData.end(), 0.0f);
            
            window.multiplyWithWindowingTable(fftData.data(), fftSize);
            fft.performFrequencyOnlyForwardTransform(fftData.data());
            
            // Analyze spectrum for adaptive behavior
            for (int i = 0; i < fftSize / 2; ++i)
            {
                auto magnitude = std::sqrt(fftData[i] * fftData[i] + fftData[i + fftSize/2] * fftData[i + fftSize/2]);
                spectrumData[i] = magnitude;
            }
        }
        
        // Apply dynamic processing based on analysis
        // (Implement your adaptive EQ algorithm here using the web prototype logic)
        
        // For now, apply basic processing
        for (int sample = 0; sample < numSamples; ++sample)
        {
            // Basic gain adjustment based on sensitivity parameter
            float sensitivity = *parameters.getRawParameterValue("sensitivity") / 100.0f;
            channelData[sample] *= (1.0f - sensitivity * 0.1f);
        }
    }
}

// Implement remaining required methods...
void AdaptiveEQProcessor::getStateInformation(juce::MemoryBlock& destData) {}
void AdaptiveEQProcessor::setStateInformation(const void* data, int sizeInBytes) {}
juce::AudioProcessorEditor* AdaptiveEQProcessor::createEditor() { return new AdaptiveEQEditor(*this); }

// Plugin instantiation
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new AdaptiveEQProcessor();
}
```

### 4. Build Process
1. **Generate IDE Project**: In Projucer, click "Save and Open in IDE"
2. **Build Configuration**: Choose "Release" for final plugin
3. **Build**: Compile the project in your IDE

### 5. Plugin Installation

#### Windows (VST3)
Copy built plugin to: `C:\Program Files\Common Files\VST3\`

#### Mac (AU/VST3)
- AU: `~/Library/Audio/Plug-Ins/Components/`
- VST3: `~/Library/Audio/Plug-Ins/VST3/`

#### Linux (VST3)
Copy to: `~/.vst3/`

## Algorithm Implementation Notes

The web prototype contains the complete algorithm logic in `script.js`. Key components to port:

1. **FFT Analysis** (lines 550-600 in script.js)
2. **3-Band Processing** (updateProcessing method)
3. **Dynamic Gain Reduction** (calculateGainReduction method)
4. **Preset Management** (database integration can be simplified to internal presets)

## Testing in Ableton

1. **Rescan Plugins**: In Ableton Live preferences, rescan VST/AU plugins
2. **Load Plugin**: Find "AdaptiveEQ" in Audio Effects
3. **Test Audio**: Load an audio track and apply the plugin

## Troubleshooting

- **Plugin not appearing**: Check plugin format matches your DAW requirements
- **Build errors**: Ensure all JUCE dependencies are installed
- **Audio glitches**: Verify buffer sizes and sample rate handling

The web prototype we built demonstrates all the core functionality - use it as your reference for implementing the actual DSP algorithms in C++.