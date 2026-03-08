# BlackMagic-X | Next-Gen Web Engine

**BlackMagic-X** is a high-performance 3D web engine designed for ultra-smooth, stylized rendering. It combines the power of **C++ (WebAssembly)** for core logic with **Babylon.js** for GPU-accelerated graphics.

## 🚀 Key Features

- **Hybrid Architecture**: C++ WASM Core for heavy computational tasks (physics, math).
- **Cartoonish High-Gloss Renderer**: Custom-tuned PBR materials for a premium, stylized look.
- **Inertia-Based Viewport**: Professional mouse-based navigation with physics-driven inertia.
- **Dynamic Lighting**: Real-time neon-tube lighting and uniform high-gloss floor reflections.
- **Optimized for Web**: Built for speed and efficiency using the latest web standards.
- **Automated Deployment**: Seamless CI/CD via GitHub Actions and Firebase Hosting.

## 🛠️ Tech Architecture

- **Engine Core**: C++ (Compiled to WASM via Emscripten)
- **3D Graphics**: Babylon.js
- **Frontend**: Modern JavaScript, HTML5, CSS3
- **Hosting**: Firebase Hosting (Spark Tier - No Credit Card)
- **Automation**: GitHub Actions

## 📂 Project Structure

```
BlackMagic-X/
├── public/         # Live web files (HTML/CSS/JS)
│   ├── wasm/       # Compiled WebAssembly modules
├── src/            # C++ Source Code
├── .github/        # Deployment Workflows
└── CMakeLists.txt  # Build System
```

## 🎮 Controls

- **Left Click**: Rotate (with Physics Inertia)
- **Right Click**: Pan (with Altitude Scaling)
- **Scroll**: Zoom to Cursor position

## 🔧 Development Flow

1. Update C++ code in `src/` or JS in `public/`.
2. Commit changes.
3. `git push` to deploy automatically.

---
**Vision**: Creating the fastest, most beautiful stylized 3D environment for the web.
