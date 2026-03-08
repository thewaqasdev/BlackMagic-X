cmake_minimum_required(VERSION 3.29)
project(BlackMagicCore)

# Set C++ Standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Check if Emscripten is being used
if(EMSCRIPTEN)
    message(STATUS "Building for WebAssembly (EMSCRIPTEN)")
    
    # Define the output executable (WASM module)
    add_executable(engine src/engine.cpp)
    
    # Emscripten specific flags for Embind and Performance
    target_compile_options(engine PRIVATE -O3 -lembind)
    target_link_options(engine PRIVATE -O3 -lembind 
        --no-entry 
        -s ALLOW_MEMORY_GROWTH=1 
        -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']
        -s MODULARIZE=1
        -s EXPORT_NAME='createEngineModule'
    )
    
    # Set the output directory to public/wasm for easy frontend access
    set_target_properties(engine PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/public/wasm")

else()
    message(STATUS "Building for Native Host (Dev/Testing)")
    add_executable(engine_native src/engine.cpp)
endif()
