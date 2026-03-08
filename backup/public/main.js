// BlackMagic-X: The Ultimate Web Engine - Clean Engine Core
document.addEventListener("DOMContentLoaded", function () {
    // --- Phase 2: WASM Engine Initialization ---
    var wasmEngine = null;

    // Load the WASM module
    if (typeof createEngineModule !== 'undefined') {
        createEngineModule().then(Module => {
            wasmEngine = new Module.BlackMagicEngine();
            console.log("%c[WASM Engine] Initialization Successful!", "color: #00ff00; font-weight: bold;");
            console.log("[WASM Engine] Version:", wasmEngine.getVersion());

            // Initial performance test
            let start = performance.now();
            let result = wasmEngine.calculateComplexSum(1000000);
            let end = performance.now();
            console.log(`[WASM Engine] Perf Test (1M Iterations): ${result.toFixed(2)} in ${(end - start).toFixed(2)}ms`);

            if (instructions) {
                instructions.innerHTML += " | <span style='color:#00ff00'>WASM Active</span>";
            }
        }).catch(err => {
            console.error("[WASM Engine] Failed to load:", err);
        });
    }

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
        camera.maxZ = 20000; // Much higher view distance for professional editor feel
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

        // --- Lighting, Environment & Glow ---
        var hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.05; // Very low

        // Glow Layer for high-energy cartoonish effects
        var glow = new BABYLON.GlowLayer("glow", scene);
        glow.intensity = 0.8; // Increased for cartoonish punch

        // --- Phase 1.5: Exact Reference Replication ---
        // 1. Precise Isometric Viewpoint
        camera.position = new BABYLON.Vector3(40, 35, -40);
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1.0); // Full Black

        // 2. Localized Room Geometry
        var roomParent = new BABYLON.TransformNode("roomParent", scene);

        // 3D Slab-Grid Floor (Matching Reference)
        var floorParent = new BABYLON.TransformNode("floorParent", scene);
        floorParent.parent = roomParent;

        var tileMat = new BABYLON.PBRMaterial("tileMat", scene);
        tileMat.albedoColor = new BABYLON.Color3(0.005, 0.0, 0.01);
        tileMat.roughness = 0.05;
        tileMat.metallic = 0.8;
        tileMat.reflectivityColor = new BABYLON.Color3(1.5, 0.8, 2.0); // Further intensified purple shine

        var neonMat = new BABYLON.StandardMaterial("neonMat", scene);
        neonMat.emissiveColor = new BABYLON.Color3(1, 1, 1); // Pure White glow
        neonMat.disableLighting = true; // Fixes movement/shading artifacts on thin lines

        // Create Sharp Center Texture (Removes side brightness)
        var neonTex = new BABYLON.DynamicTexture("neonTex", { width: 128, height: 128 }, scene);
        var nCtx = neonTex.getContext();
        nCtx.fillStyle = "black";
        nCtx.fillRect(0, 0, 128, 128);
        nCtx.fillStyle = "white";
        nCtx.fillRect(54, 0, 20, 128); // Sharp 20px line in middle (out of 128px)
        neonTex.update();
        neonMat.emissiveTexture = neonTex;

        // Unified directional light for consistent highlights on all floor blocks
        var floorDirLight = new BABYLON.DirectionalLight("floorDirLight", new BABYLON.Vector3(0, -1, 0.2), scene);
        floorDirLight.intensity = 1.0;
        floorDirLight.diffuse = new BABYLON.Color3(0.4, 0.2, 0.5); // Subtle purple tint to highlights

        var gridSize = 9; // Larger slabs
        var totalSize = 40;
        var tileSize = totalSize / gridSize;
        var gap = 0.1; // Slightly increased for better glow visibility

        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                var xPos = (i - gridSize / 2) * tileSize + tileSize / 2;
                var zPos = (j - gridSize / 2) * tileSize + tileSize / 2;

                // Main Slab
                var tile = BABYLON.MeshBuilder.CreateBox("tile_" + i + "_" + j, {
                    width: tileSize - gap,
                    height: 1.2,
                    depth: tileSize - gap
                }, scene);
                tile.position = new BABYLON.Vector3(xPos, 0.6, zPos);
                tile.parent = floorParent;

                // All blocks are now identical as requested
                tile.material = tileMat;
            }
        }

        // Create Tubular Neon Sticks (Cylindrical instead of flat boxes)
        for (var i = 1; i < gridSize; i++) {
            var pos = (i - gridSize / 2) * tileSize;

            // Vertical Strips (Along Z axis)
            var vStick = BABYLON.MeshBuilder.CreateCylinder("vStick_" + i, { height: totalSize, diameter: 0.12, tessellation: 12 }, scene);
            vStick.rotation.x = Math.PI / 2; // Lie flat along Z
            vStick.position = new BABYLON.Vector3(pos, 1.15, 0); // Lowered slightly
            vStick.parent = floorParent;
            vStick.material = neonMat;

            // Horizontal Strips (Along X axis)
            var hStick = BABYLON.MeshBuilder.CreateCylinder("hStick_" + i, { height: totalSize, diameter: 0.12, tessellation: 12 }, scene);
            hStick.rotation.z = Math.PI / 2; // Lie flat along X
            hStick.position = new BABYLON.Vector3(0, 1.15, pos); // Lowered slightly
            hStick.parent = floorParent;
            hStick.material = neonMat;
        }

        // Glowing Valley Surface (Underneath the slabs)
        // Static emissive plane - NO point lights here to avoid movement artifacts
        var floorGlowBase = BABYLON.MeshBuilder.CreateGround("floorGlowBase", { width: 40.5, height: 40.5 }, scene);
        floorGlowBase.position.y = 0.05;
        floorGlowBase.parent = roomParent;
        var glowBaseMat = new BABYLON.StandardMaterial("glowBaseMat", scene);
        glowBaseMat.emissiveColor = new BABYLON.Color3(0.5, 0.05, 0.9); // Moody Purple
        floorGlowBase.material = glowBaseMat;

        // Dark Walls with Neon Circuit Pattern
        var wallTextureWidth = 1024;
        var wallTextureHeight = 1024;
        var wallTexture = new BABYLON.DynamicTexture("wallTex", { width: wallTextureWidth, height: wallTextureHeight }, scene, false);
        var ctx = wallTexture.getContext();

        // Cartoonish purple wall with stars (like reference image)
        // Background fill
        ctx.fillStyle = "#160636"; // Dark navy purple
        ctx.fillRect(0, 0, wallTextureWidth, wallTextureHeight);

        // Circular glow in the middle for atmospheric depth
        var centerGlow = ctx.createRadialGradient(512, 512, 100, 512, 512, 800);
        centerGlow.addColorStop(0, "#3e1273");
        centerGlow.addColorStop(1, "#160636");
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, wallTextureWidth, wallTextureHeight);

        // --- Light Beams from Tubes (Procedural on texture) ---
        // Since wall1 has width 40 and wall2 has depth 40, and the texture covers them,
        // we can add a fixed light glow at the top center.
        var lightBeam = ctx.createRadialGradient(512, 0, 50, 512, 0, 600);
        lightBeam.addColorStop(0, "rgba(224, 112, 255, 0.4)");
        lightBeam.addColorStop(0.5, "rgba(138, 43, 226, 0.15)");
        lightBeam.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lightBeam;
        ctx.fillRect(0, 0, wallTextureWidth, 600);

        // --- Stars and Glowing Particles ---
        // Small White Dots
        ctx.fillStyle = "#ffffff";
        for (var s = 0; s < 120; s++) {
            var sx = Math.random() * wallTextureWidth;
            var sy = Math.random() * wallTextureHeight;
            var sRadius = Math.random() * 1.8 + 0.5;
            ctx.beginPath();
            ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Glowing Star Crosses
        ctx.shadowColor = "#f4aaff";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ffffff";
        for (var sc = 0; sc < 15; sc++) {
            var scx = Math.random() * wallTextureWidth;
            var scy = Math.random() * wallTextureHeight;
            var scSize = Math.random() * 8 + 5;

            // Vertical bar
            ctx.fillRect(scx - 1, scy - scSize, 2, scSize * 2);
            // Horizontal bar
            ctx.fillRect(scx - scSize, scy - 1, scSize * 2, 2);

            // Core dot
            ctx.beginPath();
            ctx.arc(scx, scy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Thinner Black Cartoonish Stroke (Only black, no purple border)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(10, 10, wallTextureWidth - 20, wallTextureHeight - 20);

        wallTexture.update();

        var wallMat = new BABYLON.StandardMaterial("wallMat", scene);
        wallMat.diffuseTexture = wallTexture;
        wallMat.emissiveTexture = wallTexture;
        wallMat.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.25); // Subtle glow
        wallMat.specularColor = new BABYLON.Color3(0, 0, 0);
        wallMat.roughness = 0.95;
        wallMat.metallic = 0.0;
        wallMat.reflectivityColor = new BABYLON.Color3(0, 0, 0); // Kill specular movement

        var wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 40, height: 25, depth: 1 }, scene);
        wall1.position = new BABYLON.Vector3(0, 12.5, 20);
        wall1.parent = roomParent;
        wall1.material = wallMat;

        var wall2 = BABYLON.MeshBuilder.CreateBox("wall2", { width: 1, height: 25, depth: 40 }, scene);
        wall2.position = new BABYLON.Vector3(-20, 12.5, 0);
        wall2.parent = roomParent;
        wall2.material = wallMat;

        // Removed corner line mesh to eliminate the "three lines" issue

        // --- Neon Tube Lights (White with Purple Ambient Effect) ---
        var tubeMat = new BABYLON.StandardMaterial("tubeMat", scene);
        tubeMat.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0); // Pure White
        tubeMat.disableLighting = true;

        var tubeCapMat = new BABYLON.StandardMaterial("tubeCapMat", scene);
        tubeCapMat.emissiveColor = new BABYLON.Color3(0.01, 0.01, 0.01);
        tubeCapMat.disableLighting = true;

        var createShortTube = function (name, position, rotAxis, scene) {
            var tubeParent = new BABYLON.TransformNode(name, scene);
            tubeParent.position = position;
            if (rotAxis === "z") {
                tubeParent.rotation.z = Math.PI / 2;
            } else {
                tubeParent.rotation.x = Math.PI / 2;
            }

            var tL = 6.0; // Shortened length
            var tR = 0.15; // Radius
            var glowPart = BABYLON.MeshBuilder.CreateCylinder(name + "_glow", { height: tL, diameter: tR * 2 }, scene);
            glowPart.material = tubeMat;
            glowPart.parent = tubeParent;

            // Black End Caps
            var capLeft = BABYLON.MeshBuilder.CreateCylinder(name + "_capL", { height: 0.3, diameter: tR * 2 + 0.1 }, scene);
            capLeft.position.y = tL / 2 + 0.1;
            capLeft.material = tubeCapMat;
            capLeft.parent = tubeParent;

            var capRight = BABYLON.MeshBuilder.CreateCylinder(name + "_capR", { height: 0.3, diameter: tR * 2 + 0.1 }, scene);
            capRight.position.y = -tL / 2 - 0.1;
            capRight.material = tubeCapMat;
            capRight.parent = tubeParent;
        };

        createShortTube("w1Tube", new BABYLON.Vector3(0, 24, 19.3), "z", scene);
        createShortTube("w2Tube", new BABYLON.Vector3(-19.3, 24, 0), "x", scene);

        // Add subtle light sources for the tubes (to cast glow on room)
        var tLight1 = new BABYLON.PointLight("tLight1", new BABYLON.Vector3(0, 23, 15), scene);
        tLight1.diffuse = new BABYLON.Color3(1.0, 0.4, 0.8); // Vibrant purple-pink light
        tLight1.specular = new BABYLON.Color3(3.0, 1.5, 4.0); // Extremely intense purple specular hotspots
        tLight1.intensity = 350;
        tLight1.range = 90;

        var tLight2 = new BABYLON.PointLight("tLight2", new BABYLON.Vector3(-15, 23, 0), scene);
        tLight2.diffuse = new BABYLON.Color3(1.0, 0.4, 0.8);
        tLight2.specular = new BABYLON.Color3(3.0, 1.5, 4.0);
        tLight2.intensity = 350;
        tLight2.range = 90;

        // --- Thin Black Top Borders Only ---
        var borderMat = new BABYLON.StandardMaterial("borderMat", scene);
        borderMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        borderMat.disableLighting = true;

        // Back wall top cap (exact wall width: 40, depth: 1)
        var w1Top = BABYLON.MeshBuilder.CreateBox("w1Top", { width: 40, height: 0.08, depth: 1 }, scene);
        w1Top.position = new BABYLON.Vector3(0, 25.04, 20);
        w1Top.material = borderMat;

        // Left wall top cap (exact wall depth: 40, width: 1)
        var w2Top = BABYLON.MeshBuilder.CreateBox("w2Top", { width: 1, height: 0.08, depth: 40 }, scene);
        w2Top.position = new BABYLON.Vector3(-20, 25.04, 0);
        w2Top.material = borderMat;

        // Left wall front vertical edge (z = -20 side)
        var w2FrontEdge = BABYLON.MeshBuilder.CreateBox("w2FrontEdge", { width: 1, height: 25, depth: 0.08 }, scene);
        w2FrontEdge.position = new BABYLON.Vector3(-20, 12.5, -20.04);
        w2FrontEdge.material = borderMat;

        // Back wall right vertical edge (x = +20 side)
        var w1RightEdge = BABYLON.MeshBuilder.CreateBox("w1RightEdge", { width: 0.08, height: 25, depth: 1 }, scene);
        w1RightEdge.position = new BABYLON.Vector3(20.04, 12.5, 20);
        w1RightEdge.material = borderMat;

        // --- Half-Tile Black Marble on Open Floor Edges ---
        var halfTile = tileSize / 2;
        var blackTileMat = new BABYLON.PBRMaterial("blackTileMat", scene);
        blackTileMat.albedoColor = new BABYLON.Color3(0.005, 0.005, 0.005);
        blackTileMat.roughness = 0.95;

        for (var fx = 0; fx < gridSize; fx++) {
            var fxPos = (fx - gridSize / 2) * tileSize + tileSize / 2;
            var frontTile = BABYLON.MeshBuilder.CreateBox("frontTile_" + fx, {
                width: tileSize - gap, height: 1.2, depth: halfTile - gap
            }, scene);
            frontTile.position = new BABYLON.Vector3(fxPos, 0.6, -totalSize / 2 - halfTile / 2);
            frontTile.parent = floorParent;
            frontTile.material = blackTileMat;
        }

        for (var rz = 0; rz < gridSize; rz++) {
            var rzPos = (rz - gridSize / 2) * tileSize + tileSize / 2;
            var rightTile = BABYLON.MeshBuilder.CreateBox("rightTile_" + rz, {
                width: halfTile - gap, height: 1.2, depth: tileSize - gap
            }, scene);
            rightTile.position = new BABYLON.Vector3(totalSize / 2 + halfTile / 2, 0.6, rzPos);
            rightTile.parent = floorParent;
            rightTile.material = blackTileMat;
        }

        // Corner tile to fill gap between front and right edges
        var cornerTile = BABYLON.MeshBuilder.CreateBox("cornerTile", {
            width: halfTile - gap, height: 1.2, depth: halfTile - gap
        }, scene);
        cornerTile.position = new BABYLON.Vector3(totalSize / 2 + halfTile / 2, 0.6, -totalSize / 2 - halfTile / 2);
        cornerTile.parent = floorParent;
        cornerTile.material = blackTileMat;

        // 3. Cartoonish Cyberpunk Door
        var doorParent = new BABYLON.TransformNode("doorParent", scene);
        doorParent.position = new BABYLON.Vector3(-19.4, 9, -14);

        // Door Panel
        var doorPanel = BABYLON.MeshBuilder.CreateBox("doorPanel", { width: 0.2, height: 16, depth: 9.0 }, scene);
        doorPanel.parent = doorParent;
        var doorMat = new BABYLON.StandardMaterial("doorMat", scene);
        doorMat.diffuseColor = new BABYLON.Color3(0.08, 0.08, 0.1);
        doorPanel.material = doorMat;

        // Glowing Door Frame
        var frameMat = new BABYLON.StandardMaterial("frameMat", scene);
        frameMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // Full Black
        frameMat.specularColor = new BABYLON.Color3(1, 1, 1); // Shiny highlight
        frameMat.specularPower = 64;
        frameMat.alpha = 0.7; // Transparent black like the doorknob

        var leftFrame = BABYLON.MeshBuilder.CreateBox("leftFrame", { width: 0.25, height: 16.4, depth: 0.2 }, scene);
        leftFrame.position = new BABYLON.Vector3(0.05, 0, -4.6);
        leftFrame.parent = doorParent;
        leftFrame.material = frameMat;

        var rightFrame = BABYLON.MeshBuilder.CreateBox("rightFrame", { width: 0.25, height: 16.4, depth: 0.2 }, scene);
        rightFrame.position = new BABYLON.Vector3(0.05, 0, 4.6);
        rightFrame.parent = doorParent;
        rightFrame.material = frameMat;

        var topFrame = BABYLON.MeshBuilder.CreateBox("topFrame", { width: 0.25, height: 0.2, depth: 9.4 }, scene);
        topFrame.position = new BABYLON.Vector3(0.05, 8.2, 0);
        topFrame.parent = doorParent;
        topFrame.material = frameMat;

        // --- 3.1 Transparent Black Ball Doorknob ---
        var knobMat = new BABYLON.StandardMaterial("knobMat", scene);
        knobMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // Full Black
        knobMat.specularColor = new BABYLON.Color3(1, 1, 1); // Sharp White Highlight
        knobMat.specularPower = 64; // Very shiny
        knobMat.alpha = 0.7; // Slightly more transparent

        // Small neck connecting knob to door
        var knobNeck = BABYLON.MeshBuilder.CreateCylinder("knobNeck", { diameter: 0.2, height: 0.2 }, scene);
        knobNeck.rotation.z = Math.PI / 2;
        knobNeck.position = new BABYLON.Vector3(0.1, -1.0, 3.5);
        knobNeck.parent = doorParent;
        knobNeck.material = knobMat;

        // The main Ball Doorknob
        var doorBall = BABYLON.MeshBuilder.CreateSphere("doorBall", { diameter: 0.8 }, scene);
        doorBall.position = new BABYLON.Vector3(0.5, -1.0, 3.5);
        doorBall.scaling.x = 0.7; // Slightly flattened
        doorBall.parent = doorParent;
        doorBall.material = knobMat;

        // Front Flat Circular Face (The "Circular Plan" - now inset)
        var knobFrontFace = BABYLON.MeshBuilder.CreateCylinder("knobFrontFace", { diameter: 0.6, height: 0.01 }, scene);
        knobFrontFace.rotation.z = Math.PI / 2;
        knobFrontFace.position = new BABYLON.Vector3(0.73, -1.0, 3.5); // Moved back to fit INSIDE the sphere
        knobFrontFace.parent = doorParent;
        knobFrontFace.material = knobMat;

        // 3. Glowing Handle Lever
        // Removed old lever because it's replaced above


        // 4. Large White Cartoonish Computer Table
        var deskParent = new BABYLON.TransformNode("deskParent", scene);
        deskParent.position = new BABYLON.Vector3(-14, 0, 6);
        deskParent.rotation.y = -Math.PI / 2;

        var dWhite = new BABYLON.StandardMaterial("dWhite", scene);
        dWhite.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.73); // Matte off-white to eliminate glare
        dWhite.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05); // Low specular for a soft finish
        dWhite.emissiveColor = new BABYLON.Color3(0, 0, 0);

        var dFrameMat = new BABYLON.StandardMaterial("dFrameMat", scene);
        dFrameMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.82); // Softer frame color

        var dGlow = new BABYLON.StandardMaterial("dGlow", scene);
        dGlow.emissiveColor = new BABYLON.Color3(0.8, 0.2, 1.0); // Intense Purple Riser Glow

        // --- 4.1 Specialized Angled Table Top ---
        // Main Surface (Extended to touch the legs at x=5.2)
        var mainSurf = BABYLON.MeshBuilder.CreateBox("mainSurf", { width: 12.2, height: 0.4, depth: 6 }, scene);
        mainSurf.position.set(-0.9, 5.8, 0);
        mainSurf.material = dWhite;
        mainSurf.parent = deskParent;

        // Fully Rebuilt PC Shelf (Moved away from wall and centered under table)
        var pcBottomSupport = BABYLON.MeshBuilder.CreateBox("pcBottomSupport", { width: 2.6, height: 0.3, depth: 6.0 }, scene);
        pcBottomSupport.position.set(-4.5, 1.6, 0);
        pcBottomSupport.material = dWhite;
        pcBottomSupport.parent = deskParent;

        // Rebuilt Legs for PC Shelf area (Placed accurately under corner edges)
        var createPCLeg = function (name, lx, lz) {
            var pl = BABYLON.MeshBuilder.CreateBox(name, { width: 0.2, height: 5.8, depth: 0.2 }, scene);
            pl.position.set(lx, 2.9, lz);
            pl.material = dFrameMat;
            pl.parent = deskParent;
        };
        createPCLeg("pcLeg1", -3.5, 2.6);
        createPCLeg("pcLeg2", -5.5, 2.6);
        createPCLeg("pcLeg3", -3.5, -2.6);
        createPCLeg("pcLeg4", -5.5, -2.6);

        // Front edge extension (Extended to touch at x=5.2)
        var frontExtension = BABYLON.MeshBuilder.CreateBox("frontExt", { width: 8.2, height: 0.4, depth: 1 }, scene);
        frontExtension.position.set(1.1, 5.8, 2.5);
        frontExtension.material = dWhite;
        frontExtension.parent = deskParent;

        // --- 4.6 The Wing (Specially shaped extension) ---
        var wing = new BABYLON.Mesh("wing", scene);
        var wingPoints = [
            new BABYLON.Vector3(0, 0, 2),    // 0: Inner Front
            new BABYLON.Vector3(-2.4, 0, 2), // 1: Outer Front (Reduced from 3.0)
            new BABYLON.Vector3(-2.4, 0, 0.5), // 2: Outer Slant Start
            new BABYLON.Vector3(-1.6, 0, -2),// 3: Outer Back (Increased from 1.0)
            new BABYLON.Vector3(0, 0, -2)    // 4: Inner Back
        ];

        var wingThickness = 0.4;
        var wingVertices = [];
        var wingIndices = [];
        var wingNormals = [];

        // Vertices: Bottom Face (y=0) then Top Face (y=0.4)
        wingPoints.forEach(p => wingVertices.push(p.x, 0, p.z));
        wingPoints.forEach(p => wingVertices.push(p.x, wingThickness, p.z));

        // Indices:
        // Bottom Face (Visible from bottom: CW from top-view is CCW from bottom-view)
        wingIndices.push(0, 4, 3);
        wingIndices.push(0, 3, 2);
        wingIndices.push(0, 2, 1);

        // Top Face (Visible from top: CCW from top-view)
        wingIndices.push(5, 6, 7);
        wingIndices.push(5, 7, 8);
        wingIndices.push(5, 8, 9);
        // Sides
        for (var i = 0; i < 5; i++) {
            var next = (i + 1) % 5;
            var b1 = i;
            var b2 = next;
            var t1 = i + 5;
            var t2 = next + 5;
            // Face b1 -> b2 is CW from top, so b1-t1-t2 is CCW from outside
            wingIndices.push(b1, t1, t2);
            wingIndices.push(b1, t2, b2);
        }

        var vertexData = new BABYLON.VertexData();
        vertexData.positions = wingVertices;
        vertexData.indices = wingIndices;
        BABYLON.VertexData.ComputeNormals(wingVertices, wingIndices, wingNormals);
        vertexData.normals = wingNormals;
        vertexData.applyToMesh(wing);

        // Visibility Fix: Ensure it's never invisible from top/bottom
        var wingMaterial = dWhite.clone("wingMaterial");
        wingMaterial.backFaceCulling = false;
        wing.material = wingMaterial;

        wing.parent = deskParent;
        wing.rotation.y = -Math.PI / 2;
        wing.position.set(-5.0, 5.6, -3.0); // Lowered to 5.6 to be flush with table top



        // (Removed lTop as requested, table now ends at the shelving unit boundary)

        // Shelves: Rebuilt with Rounded Front Corners
        var createShelf = function (name, y, sw, sx) {
            var sWidth = sw || 2.8;
            var sPosX = sx || 6.3;
            var radius = 0.4; // Radius for the front curves
            var halfW = sWidth / 2;
            var halfD = 3.0; // Depth is 6.0, centered at 0

            var shapePoints = [];
            // Back corners (Straight)
            shapePoints.push(new BABYLON.Vector3(halfW, 0, 3.0));
            shapePoints.push(new BABYLON.Vector3(-halfW, 0, 3.0));

            // Front-Left Curve (Approximating with points)
            // Starts at z = -2.6, ends at x = -halfW + 0.4
            for (var a = 180; a <= 270; a += 15) {
                var rad = a * Math.PI / 180;
                shapePoints.push(new BABYLON.Vector3(
                    -halfW + radius + radius * Math.cos(rad),
                    0,
                    -halfD + radius + radius * Math.sin(rad)
                ));
            }

            // Front-Right Curve
            for (var a = 270; a <= 360; a += 15) {
                var rad = a * Math.PI / 180;
                shapePoints.push(new BABYLON.Vector3(
                    halfW - radius + radius * Math.cos(rad),
                    0,
                    -halfD + radius + radius * Math.sin(rad)
                ));
            }

            var shelfMesh = new BABYLON.Mesh(name, scene);
            var vertices = [];
            var indices = [];
            var shelfThickness = 0.3;
            var count = shapePoints.length;

            // Bottom & Top vertices
            shapePoints.forEach(p => vertices.push(p.x, 0, p.z));
            shapePoints.forEach(p => vertices.push(p.x, shelfThickness, p.z));

            // Face Triangulation (Fan approach for the top/bottom faces)
            for (var i = 1; i < count - 1; i++) {
                // Bottom face
                indices.push(0, i + 1, i);
                // Top face
                indices.push(count + 0, count + i, count + i + 1);
            }
            // Vertical Side Panels
            for (var i = 0; i < count; i++) {
                var next = (i + 1) % count;
                var b1 = i;
                var b2 = next;
                var t1 = i + count;
                var t2 = next + count;
                indices.push(b1, t1, t2);
                indices.push(b1, t2, b2);
            }

            var vd = new BABYLON.VertexData();
            vd.positions = vertices;
            vd.indices = indices;
            var normals = [];
            BABYLON.VertexData.ComputeNormals(vertices, indices, normals);
            vd.normals = normals;
            vd.applyToMesh(shelfMesh);

            shelfMesh.position.set(sPosX, y, 0);
            var sMat = dWhite.clone(name + "_mat");
            sMat.backFaceCulling = false;
            shelfMesh.material = sMat;
            shelfMesh.parent = deskParent;
        };
        createShelf("shelf_bottom", 1.6);
        createShelf("shelf_mid", 3.4);
        // Top shelf shifted right and widened (hides poles, touches riser)
        createShelf("shelf_top", 7.2, 3.3, 6.65);

        // (Removed redundant left bottom shelf)

        // --- Monitor Riser (Touching Top shelf and legs at x=5.2) ---
        var riserTop = BABYLON.MeshBuilder.CreateBox("riserTop", { width: 12.2, height: 0.3, depth: 2.2 }, scene);
        riserTop.position.set(-0.9, 7.2, 1.9);
        riserTop.material = dWhite;
        riserTop.parent = deskParent;

        // (Removed riserGlowStrip as requested to eliminate the horizontal stick look)

        // Riser Supports (Positionally adjusted for shorter riser)
        for (var i = 0; i < 3; i++) {
            var sup = BABYLON.MeshBuilder.CreateBox("riserSup_" + i, { width: 0.2, height: 1.4, depth: 0.2 }, scene);
            sup.position.set(-6.0 + i * 5.0, 6.5, 1.9);
            sup.material = dWhite;
            sup.parent = deskParent;
        }

        // --- 4.5 Support Frame Architecture ---
        // Shelf Pillars (Fixed heights to match image)
        var createPole = function (name, x, y, z, h) {
            var p = BABYLON.MeshBuilder.CreateBox(name, { width: 0.2, height: h, depth: 0.2 }, scene);
            p.position.set(x, y, z);
            p.material = dFrameMat;
            p.parent = deskParent;
        };
        createPole("pole1", 5.2, 3.675, 2.7, 7.35); // Front Inner (Tucked under shelf)
        createPole("pole2", 7.4, 3.675, 2.7, 7.35); // Front Outer (Tucked under shelf)
        createPole("pole3", 5.2, 3.675, -2.7, 7.35); // Back Inner (Tucked under shelf)
        createPole("pole4", 7.4, 3.675, -2.7, 7.35); // Back Outer (Tucked under shelf)

        // (Removed xFrameGroup as requested to rebuild legs)

        // (Removed vSupGroup cross-support as requested)

        // 5. Final Lighting Setup (Stable & Atmospheric)

        // Purple Wall Glow (Center-out) 
        var wallGlow = new BABYLON.PointLight("wallGlow", new BABYLON.Vector3(-10, 12, 10), scene);
        wallGlow.diffuse = new BABYLON.Color3(0.6, 0.2, 1);
        wallGlow.intensity = 400; // Reduced to let texture emissives shine
        wallGlow.range = 35;

        // Base Ambient/Area light
        var areaLight = new BABYLON.PointLight("areaLight", new BABYLON.Vector3(10, 15, -10), scene);
        areaLight.diffuse = new BABYLON.Color3(0.3, 0.3, 0.5);
        areaLight.intensity = 300; // Balanced visibility

        // Materials Refinement
        wallMat.roughness = 0.9;
        wallMat.metallic = 0.0;
        wallMat.reflectivityColor = new BABYLON.Color3(0, 0, 0);

        tileMat.roughness = 0.95;
        tileMat.metallic = 0.0;
        tileMat.reflectivityColor = new BABYLON.Color3(0, 0, 0);

        // Final Glow
        glow.intensity = 0.4;

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
