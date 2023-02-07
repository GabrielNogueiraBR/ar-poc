import React, { useEffect } from "react";

import * as THREE from "three";
import * as THREEx from "ar-js-org/three.js/build/ar-threex.js";

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

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
      detectionMode: "color_and_matrix",
    });

    ArToolkitContext.init(function () {
      camera.projectionMatrix.copy(ArToolkitContext.getProjectionMatrix());
    });

    const ArMarkerControls = new THREEx.ArMarkerControls(
      ArToolkitContext,
      camera,
      {
        type: "barcode",
        barcodeValue: "07889200",
        changeMatrixMode: "cameraTransformMatrix",
      }
    );

    scene.visible = false;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.8,
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

  return <canvas></canvas>;
}

export default App;
