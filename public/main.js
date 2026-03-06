// BlackMagic-X: The Ultimate Web Engine - Clean Engine Core
document.addEventListener("DOMContentLoaded", function () {
    // Get the canvas DOM element
    var canvas = document.getElementById("renderCanvas");

    // Load the 3D engine
    var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

    // Create professional viewport scene
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);

        // Professional gradient background (dark to light)
        scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.12, 1.0);

        // --- Camera Setup: Advanced Physics/Inertia System ---
        var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 15, -40), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        // Do NOT attach default controls to avoid interference with our custom inertia logic
        // camera.attachControl(canvas, true); 

        // Physics/Inertia State
        var state = {
            rotVel: new BABYLON.Vector3(0, 0, 0),    // Rotation velocity (Pitch, Yaw)
            panVel: new BABYLON.Vector3(0, 0, 0),    // Panning velocity (X, Y)
            zoomVel: 0,                              // Zoom velocity
            damping: 0.92,                           // How fast it stops (lower = faster stop)
            isRotating: false,
            isPanning: false,
            lastPointerX: 0,
            lastPointerY: 0
        };

        // Sensitivity scaling based on height (Lower is more precise, Higher is faster)
        var getSensitivity = function () {
            var height = Math.abs(camera.position.y);
            return Math.max(1, height / 20); // Scale up as camera goes higher
        };

        // --- Mouse Interaction ---
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());

        scene.onPointerObservable.add((pointerInfo) => {
            var event = pointerInfo.event;

            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    state.lastPointerX = scene.pointerX;
                    state.lastPointerY = scene.pointerY;
                    if (event.button === 0) state.isRotating = true;
                    if (event.button === 2) state.isPanning = true;
                    break;

                case BABYLON.PointerEventTypes.POINTERUP:
                    state.isRotating = false;
                    state.isPanning = false;
                    break;

                case BABYLON.PointerEventTypes.POINTERMOVE:
                    var dx = scene.pointerX - state.lastPointerX;
                    var dy = scene.pointerY - state.lastPointerY;
                    var sens = getSensitivity();

                    if (state.isRotating) {
                        // Rotation Inertia (Invert Y for standard feel)
                        state.rotVel.y += dx * 0.002;
                        state.rotVel.x += dy * 0.002;
                    }

                    if (state.isPanning) {
                        // Panning Inertia (Adjusted by height sensitivity)
                        var panFactor = 0.02 * sens;
                        state.panVel.x -= dx * panFactor;
                        state.panVel.y += dy * panFactor;
                    }

                    state.lastPointerX = scene.pointerX;
                    state.lastPointerY = scene.pointerY;
                    break;

                case BABYLON.PointerEventTypes.POINTERWHEEL:
                    var delta = event.deltaY || event.detail || -event.wheelDelta;
                    var sens = getSensitivity();
                    // Zoom towards mouse position or forward? User asked for Zoom to cursor.
                    state.zoomVel += (delta > 0 ? -1 : 1) * 2.0 * sens;
                    break;
            }
        });

        // --- Frame-by-Frame Physics Application ---
        scene.onBeforeRenderObservable.add(() => {
            // 1. Damping (Inertia effect)
            state.rotVel.scaleInPlace(state.damping);
            state.panVel.scaleInPlace(state.damping);
            state.zoomVel *= state.damping;

            // 2. Apply Rotation
            camera.rotation.x += state.rotVel.x;
            camera.rotation.y += state.rotVel.y;

            // 3. Apply Panning (Relative to camera orientation)
            var localRight = camera.getDirection(BABYLON.Vector3.Right());
            var localUp = camera.getDirection(BABYLON.Vector3.Up());

            camera.position.addInPlace(localRight.scale(state.panVel.x));
            camera.position.addInPlace(localUp.scale(state.panVel.y));

            // 4. Apply Zoom (Targeting cursor direction)
            if (Math.abs(state.zoomVel) > 0.01) {
                var pickingRay = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);
                var dir = pickingRay.direction;
                camera.position.addInPlace(dir.scale(state.zoomVel * 0.5));
            }

            // Limit Pitch to avoid flipping (Standard Editor constraint)
            camera.rotation.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, camera.rotation.x));
        });

        // --- Lighting & Environment ---
        var hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.5;

        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogStart = 200;      // Start much farther
        scene.fogEnd = 1500;       // End very far for infinite feel
        scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.12);

        // --- Grid Optimization (User's improved spacing) ---
        var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 4000, height: 4000 }, scene);
        var gridMaterial = new BABYLON.GridMaterial("gridMat", scene);
        gridMaterial.majorUnitFrequency = 10;
        gridMaterial.gridRatio = 10;
        gridMaterial.minorUnitVisibility = 0.2;
        gridMaterial.mainColor = new BABYLON.Color3(0.05, 0.05, 0.06);
        gridMaterial.lineColor = new BABYLON.Color3(0.3, 0.3, 0.35); // Subtle professional lines
        gridMaterial.opacity = 0.8;
        gridMaterial.backFaceCulling = false;
        ground.material = gridMaterial;

        return scene;
    };

    var scene = createScene();

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });

    // Instructions UI
    var welcome = document.getElementById("welcomeUI");
    if (welcome) {
        welcome.innerHTML = "<h1>BLACKMAGIC-X</h1><p style='color:#777'>Advanced Physics Viewport</p>";
    }

    var instructions = document.getElementById("instructions");
    if (instructions) {
        instructions.innerHTML = "Left Click: Rotate (Inertia) | Right Click: Pan (Altitude Scaling) | Scroll: Zoom to Cursor";
    }
});
