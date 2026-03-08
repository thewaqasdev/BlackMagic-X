#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <cmath>

using namespace emscripten;

class BlackMagicEngine {
public:
    BlackMagicEngine() {
        // Initializer
    }

    std::string getVersion() {
        return "BlackMagic-X Engine v1.0.0 (WASM Core)";
    }

    // A sample calculation function to demonstrate performance later
    float calculateComplexSum(int iterations) {
        float sum = 0.0f;
        for (int i = 0; i < iterations; ++i) {
            sum += std::sin(static_cast<float>(i)) * std::cos(static_cast<float>(i));
        }
        return sum;
    }
};

// Binding code
EMSCRIPTEN_BINDINGS(blackmagic_engine) {
    class_<BlackMagicEngine>("BlackMagicEngine")
        .constructor<>()
        .function("getVersion", &BlackMagicEngine::getVersion)
        .function("calculateComplexSum", &BlackMagicEngine::calculateComplexSum);
}
