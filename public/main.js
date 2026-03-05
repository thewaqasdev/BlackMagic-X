document.addEventListener("DOMContentLoaded", function () {
    // Get the canvas DOM element
    var canvas = document.getElementById("renderCanvas");

    // Load the 3D engine
    var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

    // Create professional viewport scene
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        
        // Professional gradient background (dark to light like image)
        scene.clearColor = new BABYLON.Color4(0.15, 0.15, 0.18, 1.0);

        // Camera setup - Unreal Engine style
        var camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 8, -15), scene);
        camera.setTarget(new BABYLON.Vector3(0, 0, 10));
        camera.attachControl(canvas, true);
        
        // WASD controls
        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D
        camera.speed = 2.0;        // Fast movement
        camera.angularSensibility = 2000;
        camera.maxZ = 1000;        // Can see up to 1000 units away

        // Pointer lock for FPS-style control
        scene.onPointerDown = function () {
            if (!engine.isPointerLock) {
                engine.enterPointerlock();
            }
        };

        // Professional lighting setup
        var hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.4;
        hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.25);

        // Professional fog (smooth fadeout - extended view distance)
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogStart = 50;       // Fog starts farther away
        scene.fogEnd = 300;        // Can see much farther before fadeout
        scene.fogColor = new BABYLON.Color3(0.15, 0.15, 0.18);

        // Create perfect grid ground (extended size for far viewing)
        var ground = BABYLON.MeshBuilder.CreateGround("ground", { 
            width: 600,            // Much larger grid
            height: 600, 
            subdivisions: 150      // More grid lines for detail
        }, scene);

        var gridMaterial = new BABYLON.GridMaterial("gridMat", scene);
        gridMaterial.majorUnitFrequency = 5;
        gridMaterial.minorUnitVisibility = 0.45;
        gridMaterial.gridRatio = 4;
        gridMaterial.backFaceCulling = false;
        gridMaterial.mainColor = new BABYLON.Color3(0.15, 0.15, 0.18);
        gridMaterial.lineColor = new BABYLON.Color3(0.5, 0.5, 0.55);
        gridMaterial.opacity = 1.0;

        ground.material = gridMaterial;

        return scene;
    };

    // Create and run scene
    var scene = createScene();

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });

    // Hide welcome UI on interaction
    canvas.addEventListener("pointerdown", function () {
        var welcome = document.getElementById("welcomeUI");
        if (welcome) welcome.classList.add("hidden");
    }, { once: true });
});
