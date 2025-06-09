cmake_minimum_required(VERSION 3.15)

project(AdaptiveEQ VERSION 1.0.0)

# Define the paths to the JUCE modules
set(JUCE_PATH "${CMAKE_SOURCE_DIR}/JUCE" CACHE PATH "Path to JUCE")

# Check if JUCE exists, if not, clone it
if(NOT EXISTS "${JUCE_PATH}")
    message("JUCE not found, cloning...")
    execute_process(
        COMMAND git clone --depth=1 https://github.com/juce-framework/JUCE.git "${JUCE_PATH}"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    )
endif()

# Add the JUCE subdirectory to the build
add_subdirectory(${JUCE_PATH})

# JUCE needs to know the target processor architecture
if(APPLE)
    set(JUCE_PROCESSOR_ARCHITECTURE "x86_64")
elseif(WIN32)
    set(JUCE_PROCESSOR_ARCHITECTURE "x86_64")
else()
    set(JUCE_PROCESSOR_ARCHITECTURE "x86_64")
endif()

# Include the JUCE modules
juce_add_module(${JUCE_PATH}/modules/juce_audio_basics)
juce_add_module(${JUCE_PATH}/modules/juce_audio_devices)
juce_add_module(${JUCE_PATH}/modules/juce_audio_formats)
juce_add_module(${JUCE_PATH}/modules/juce_audio_plugin_client)
juce_add_module(${JUCE_PATH}/modules/juce_audio_processors)
juce_add_module(${JUCE_PATH}/modules/juce_audio_utils)
juce_add_module(${JUCE_PATH}/modules/juce_core)
juce_add_module(${JUCE_PATH}/modules/juce_data_structures)
juce_add_module(${JUCE_PATH}/modules/juce_dsp)
juce_add_module(${JUCE_PATH}/modules/juce_events)
juce_add_module(${JUCE_PATH}/modules/juce_graphics)
juce_add_module(${JUCE_PATH}/modules/juce_gui_basics)
juce_add_module(${JUCE_PATH}/modules/juce_gui_extra)

# Set up the plugin format
juce_add_plugin(AdaptiveEQ
    PLUGIN_MANUFACTURER_CODE ADEQ
    PLUGIN_CODE AdeQ
    FORMATS VST3 Standalone
    PRODUCT_NAME "AdaptiveEQ"
    COMPANY_NAME "AdaptiveEQ"
    BUNDLE_ID "com.adaptiveeq.plugin"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD TRUE
    VST3_CATEGORIES "Fx"
)

# Add source files
target_sources(AdaptiveEQ
    PRIVATE
        Source/PluginProcessor.cpp
        Source/PluginEditor.cpp
        Source/FrequencyProcessor.cpp
        Source/SpectrumAnalyzer.cpp
        Source/PresetManager.cpp
        Source/LookAndFeel.cpp
)

# Set up the target
target_compile_features(AdaptiveEQ PRIVATE cxx_std_17)

# Link with JUCE modules
target_link_libraries(AdaptiveEQ
    PRIVATE
        juce::juce_audio_basics
        juce::juce_audio_devices
        juce::juce_audio_formats
        juce::juce_audio_plugin_client
        juce::juce_audio_processors
        juce::juce_audio_utils
        juce::juce_core
        juce::juce_data_structures
        juce::juce_dsp
        juce::juce_events
        juce::juce_graphics
        juce::juce_gui_basics
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# Set include directories
target_include_directories(AdaptiveEQ
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/Source
)

# VST Binary Resource
juce_add_binary_data(AdaptiveEQBinaryData SOURCES
    generated-icon.png
)

target_link_libraries(AdaptiveEQ PRIVATE AdaptiveEQBinaryData)