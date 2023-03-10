/* eslint-disable no-use-before-define */
/* eslint-disable import/extensions */
import './style.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const loadingManager = new THREE.LoadingManager();
const progressBar = document.getElementById('progress-bar');
loadingManager.onProgress = (_url, loaded, total) => {
  progressBar.value = (loaded / total) * 100;
};

const progressBarContainer = document.querySelector('.progress-bar-container');
loadingManager.onLoad = () => {
  progressBarContainer.style.display = 'none';
};

const origin = new THREE.Mesh();
scene.add(origin);

const environmentURL = new URL('./public/environmentMap.hdr', import.meta.url);
const hdrLoader = new RGBELoader(loadingManager);
hdrLoader.load(environmentURL, (hdr) => {
  // eslint-disable-next-line no-param-reassign
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr;
});

const modelUrl = new URL('./public/apocryphon.glb', import.meta.url);
const loader = new GLTFLoader(loadingManager);
loader.load(
  modelUrl.href,
  (gltf) => {
    const model = gltf.scene;
    origin.add(model);
  },
);

const sizes = {

  width: window.innerWidth,
  height: window.innerHeight,

};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
});

const renderer = new THREE.WebGLRenderer({

  antialias: true,
  canvas,
  alpha: true,

});

renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMappingExposure = 0.45;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1;
scene.add(camera);

// * All lights are children of camera, not scene because we want the lightning to be ambient.
const punctualLight = new THREE.PointLight('LightSteelBlue', 2.5);
punctualLight.position.x = -1;
punctualLight.position.y = 1;
punctualLight.position.z = -1;
camera.add(punctualLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 0.5;
controls.maxDistance = 5;
controls.target.set(0, 0, 0);
controls.update();

const clock = new THREE.Clock();

async function tick() {
  const elapsedTime = clock.getElapsedTime();
  origin.rotation.y = 0.2 * elapsedTime;
  origin.rotation.z = 0.1 * elapsedTime;
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

await tick();
