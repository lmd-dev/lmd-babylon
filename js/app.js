var AppSolarSystem = /** @class */ (function () {
    /**
     * Constructor of the application
     * Initializes ant creates scene content
     */
    function AppSolarSystem() {
        this.initialize();
        //this.createBox();
        this.createPlanet("mercury", 0.4, 3, 0.6, 0.8, "img/textures/mercury/planet.jpg");
        this.createPlanet("venus", 1, 5, 0.6, 0.7, "img/textures/venus/planet.jpg");
        this.createPlanet("earth", 1, 8, 0.5, 0.5, "img/textures/earth/planet.jpg", "img/textures/earth/specular.jpg");
        this.createPlanet("mars", 0.6, 10, 0.5, 0.3, "img/textures/mars/planet.jpg");
        this.createSun();
    }
    Object.defineProperty(AppSolarSystem.prototype, "canvas", {
        get: function () { return this._canvas; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppSolarSystem.prototype, "engine", {
        get: function () { return this._engine; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppSolarSystem.prototype, "scene", {
        get: function () { return this._scene; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppSolarSystem.prototype, "camera", {
        get: function () { return this._camera; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppSolarSystem.prototype, "spot", {
        get: function () { return this._spot; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppSolarSystem.prototype, "shadowGenerator", {
        get: function () { return this._shadowGenerator; },
        enumerable: false,
        configurable: true
    });
    /**
     * Initializes 3D context (Babylon Engine, scene, camera lights and shadows generator)
     */
    AppSolarSystem.prototype.initialize = function () {
        var _this = this;
        //Gets the HTML canvas of the web page 
        this._canvas = document.querySelector('canvas');
        //Creates a rendering engine
        this._engine = new BABYLON.Engine(this.canvas, true, {}, true);
        //Creates the scene
        this._scene = new BABYLON.Scene(this.engine);
        //Define the background color of the scene (here, background is transparent RVBA => 0 0 0 0)
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        //Creates a camera which defines the point of view of the scene
        this._camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 0, -5), this.scene);
        //Redirects mouse events on the canvas to move the camera
        this.camera.attachControl(this.canvas);
        //Creates a spot light
        this._spot = new BABYLON.PointLight("spot", new BABYLON.Vector3(0, 0, 0), this.scene);
        //Creates a shadows generator
        this._shadowGenerator = new BABYLON.ShadowGenerator(4096, this.spot);
        //Start the rendering loop which generates rendering frames
        this._engine.runRenderLoop(function () {
            _this.scene.render();
        });
    };
    /**
     * Creates a grey box with a 2 units size
     */
    AppSolarSystem.prototype.createBox = function () {
        var box = BABYLON.Mesh.CreateBox("box", 2, this.scene);
        var material = new BABYLON.StandardMaterial("material", this.scene);
        //Défine the color of the box when it is lightened
        material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        //Défine the specular color to make the material shiny or mat (here is mat)
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        box.material = material;
    };
    /**
     * Creates a planet
     * @param planetName Name of the planet
     * @param planetSize Size of the planet
     * @param distanceFromSun Distance of the planet from sun
     * @param planetRotationSpeed Planet rotation speed
     * @param planetTrajectorySpeed Planet rotation speed around the sun
     * @param groundTextureURL Ground texture of the planet
     * @param groundSpecularURL Specular texture of the planet (to manage brightness) [facultative - default is null]
     */
    AppSolarSystem.prototype.createPlanet = function (planetName, planetSize, distanceFromSun, planetRotationSpeed, planetTrajectorySpeed, groundTextureURL, groundSpecularURL) {
        if (groundSpecularURL === void 0) { groundSpecularURL = null; }
        //Creates a sphere for the planet
        var planet = BABYLON.Mesh.CreateSphere(planetName, 32, planetSize, this.scene);
        //Creates a pivot a the center of the scene. The planet will turn arround this pivot
        var pivot = new BABYLON.TransformNode(planetName + "-pivot", this.scene);
        //Sets planet a a child of the pivot => when the pivot moves, the planet moves too because its coordinates are relative to the coordinates of the pivot
        planet.parent = pivot;
        //Places the planet at distanceFromSun units of the pivot / center of the scene
        planet.position.x = distanceFromSun;
        //Indicates planet can receive shadows
        planet.receiveShadows = true;
        //Add the planet to objects produce shadows
        this.shadowGenerator.getShadowMap().renderList.push(planet);
        //Creates a new material for the planet
        var material = new BABYLON.StandardMaterial(planetName + "-material", this.scene);
        //Set the texture of the planet
        material.diffuseTexture = new BABYLON.Texture(groundTextureURL, this.scene);
        //If a specular texture URL has been specified, a specular texture will be created, else the planet will be mat 
        if (groundSpecularURL)
            material.specularTexture = new BABYLON.Texture(groundSpecularURL, this.scene);
        else
            material.specularColor = new BABYLON.Color3(0, 0, 0);
        planet.material = material;
        //Animates the planet to rotate 360°
        //Creates an animation on the rotation.y property
        var animation = new BABYLON.Animation(planetName + "-animation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        //Add key frames to define the evolution of the property values
        var keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 120, value: 2 * Math.PI });
        //Set the animation key frames
        animation.setKeys(keys);
        //Set the planet animation
        planet.animations.push(animation);
        //Start the planet rotation animation
        this.scene.beginAnimation(planet, 0, 120, true, planetRotationSpeed);
        //Animates the rotation of the planet arround the sun
        //Creates an animation on the rotation.y property
        var animation2 = new BABYLON.Animation(planetName + "-pivot-animation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        //Add key frames to define the evolution of the property values
        keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 120, value: 2 * Math.PI });
        //Set the animation key frames
        animation2.setKeys(keys);
        //Set the pivot animation
        pivot.animations.push(animation2);
        //Start the animation of the pivot (rotate pivot will move the associated planet)
        this.scene.beginAnimation(pivot, 0, 120, true, planetTrajectorySpeed);
    };
    /**
     * Creates the sun
     */
    AppSolarSystem.prototype.createSun = function () {
        //Creates a shepre for the sun
        var sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 2 }, this.scene);
        //Creates a material for the sun
        var material = new BABYLON.StandardMaterial("sun-material", this.scene);
        //set an emissive texture (does't react to the lights)
        material.emissiveTexture = new BABYLON.Texture('img/textures/sun/sun.jpg', this.scene);
        sun.material = material;
        //Creates an animation to rotate sun 360°
        var animation = new BABYLON.Animation("sunanimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var keys = [];
        var lastValue = 0;
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 300, value: 2 * Math.PI });
        animation.setKeys(keys);
        sun.animations.push(animation);
        this.scene.beginAnimation(sun, 0, 300, true);
    };
    return AppSolarSystem;
}());
window.onload = function () { var app = new AppSolarSystem(); };
//# sourceMappingURL=app.js.map