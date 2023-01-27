import './style.css'
import './style.css'
import * as THREE from '/node_modules/three'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { Color } from '/node_modules/three'
import { RGBELoader } from '/node_modules/three/examples/jsm/loaders/RGBELoader.js'

// URLs
const environmentURL = new URL('./public/environmentMap.hdr', import.meta.url)
const modelUrl = new URL('./public/apocryphon.glb' , import.meta.url);

// Canvas

const canvas = document.querySelector('canvas.webgl')


// Scene

const scene = new THREE.Scene()

scene.background = new Color('lightgray');


// HDR Mapping

const rgbeLoader = new RGBELoader();
rgbeLoader.load(environmentURL, function(texture){

    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
})


// Origin

const geometry = new THREE.BoxGeometry( 0, 0, 0 );
const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
const origin = new THREE.Mesh( geometry, material );

scene.add( origin )


// GLTF Loader 

const loader = new GLTFLoader();


loader.load( modelUrl.href, function ( gltf ) {

		let model = gltf.scene;
    origin.add( model );

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}

);


// Sizes

const sizes = {

    width: window.innerWidth,
    height: window.innerHeight

}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

// Renderer

const renderer = new THREE.WebGLRenderer({
  
  antialias: true,
  canvas: canvas,

})

renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMappingExposure = .45

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0 ))


// Base camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.x = 0
camera.position.y = 0
camera.position.z = 1
scene.add(camera)


// Lights
// * The reason we add all lights to the scene as a child of camera is because we dont want the lightning to be changed by rotation of the ring. It makes the light ambient.

const punctualLight = new THREE.PointLight('LightSteelBlue', 2.5)
punctualLight.position.x = -1
punctualLight.position.y = 1
punctualLight.position.z = -1
camera.add(punctualLight)

// Controls

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 0.5;
controls.maxDistance = 5;
controls.target.set( 0, 0, 0 );
controls.update();


// Animate

const clock = new THREE.Clock()

async function tick() {

    const elapsedTime = clock.getElapsedTime()
    // Update objects
    
    // 
    origin.rotation.y = .2 * elapsedTime
    origin.rotation.z = .1 * elapsedTime
    
    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick();

