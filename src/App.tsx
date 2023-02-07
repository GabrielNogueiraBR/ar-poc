import React, { useEffect } from "react";

import * as THREE from "three";
import * as THREEx from "@ar-js-org/ar.js/three.js/build/ar-threex.js";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const ktx2Loader = new KTX2Loader();

    const canvas = document.querySelector("#ar-poc-canvas")!;

    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.4.1/"
    );
    ktx2Loader.setTranscoderPath(
      "https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/"
    );

    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);

    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      canvas,
    });

    renderer.setClearColor("", 0);
    renderer.setClearAlpha(0);

    // Realistic render
    renderer.autoClear = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Exposure
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Light
    const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
    scene.add(ambientLight);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ArToolkitSource = new THREEx.ArToolkitSource({
      sourceType: "webcam",
    });

    ArToolkitSource.init(function () {
      setTimeout(function () {
        ArToolkitSource.onResizeElement();
        ArToolkitSource.copyElementSizeTo(renderer.domElement);
      }, 2000);
    });

    const ArToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: "/camera_para.dat",
      detectionMode: "mono_and_matrix",
    });

    ArToolkitContext.init(function () {
      camera.projectionMatrix.copy(ArToolkitContext.getProjectionMatrix());
    });

    const ArMarkerControls = new THREEx.ArMarkerControls(
      ArToolkitContext,
      camera,
      {
        type: "pattern",
        patternUrl: "/pattern-marker.patt",
        changeMatrixMode: "cameraTransformMatrix",
      }
    );

    scene.visible = false;

    // loader.load(
    //   "https://storage.googleapis.com/invoker2u-public/models_3d/23a300f3-d992-4979-ac3c-85da1696d14a.glb",
    //   (gltf: GLTF) => {
    //     const model = gltf.scene;
    //     model.position.set(0, 0, 0);

    //     scene.add(model);
    //     console.log('Model loaded')
    //   },
    //   undefined,
    //   (error: any) => {
    //     console.error(error);
    //     console.log("deu errado");
    //   }
    // );

    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = geometry.parameters.height / 2;
    scene.add(cube);

    function animate() {
      requestAnimationFrame(animate);

      ArToolkitContext.update(ArToolkitSource.domElement);
      scene.visible = camera.visible;

      renderer.render(scene, camera);
    }

    animate();
  }, []);

  return <canvas id="ar-poc-canvas"></canvas>;
}

export default App;
