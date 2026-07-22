import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createGLBViewer(host, options) {
  if (!host) return;

  const canvas = host.querySelector("canvas");
  const emptyState = host.querySelector("[data-model-empty]");
  const loadingState = host.querySelector("[data-model-loading]");
  const errorState = host.querySelector("[data-model-error]");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfafafa);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.autoRotate = options.autoRotate !== false && !reduceMotion;
  controls.autoRotateSpeed = 0.75;
  controls.enablePan = false;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xe8f1ef, 2.8);
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
  keyLight.position.set(4, 6, 6);
  const fillLight = new THREE.DirectionalLight(0xffeee6, 2.4);
  fillLight.position.set(-5, 3, 2);
  const rimLight = new THREE.DirectionalLight(0xdff8ff, 1.7);
  rimLight.position.set(1, 4, -6);
  scene.add(ambientLight, hemisphereLight, keyLight, fillLight, rimLight);

  const loader = new GLTFLoader();
  let model = null;
  let loadSequence = 0;

  function configureAppearance(method) {
    const isTripoSR = options.correspondence && method === "triposr";
    const scale = (isTripoSR ? 0.65 : 1) * (options.lightScale ?? 1);
    renderer.toneMappingExposure = isTripoSR ? 0.95 : (options.exposure ?? 1.35);
    ambientLight.intensity = 1.6 * scale;
    hemisphereLight.intensity = 2.8 * scale;
    keyLight.intensity = 3.6 * scale;
    fillLight.intensity = 2.4 * scale;
    rimLight.intensity = 1.7 * scale;
  }

  function setState(state) {
    emptyState.hidden = state !== "empty";
    loadingState.hidden = state !== "loading";
    errorState.hidden = state !== "error";
    canvas.hidden = state === "empty" || state === "error";
  }

  function disposeModel() {
    if (!model) return;
    scene.remove(model);
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.geometry?.dispose();
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.filter(Boolean).forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) value.dispose();
        });
        material.dispose();
      });
    });
    model = null;
  }

  function frameModel(object) {
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() * 0.5, 0.001);
    const framePadding = options.framePadding ?? 1.08;
    const distance = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov * 0.5))) * framePadding;
    const [viewX, viewY, viewZ] = options.viewDirection ?? [1.35, 0.85, 1.6];
    const viewDirection = new THREE.Vector3(viewX, viewY, viewZ).normalize();
    object.position.sub(center);
    camera.near = Math.max(radius / 100, 0.001);
    camera.far = radius * 100;
    camera.position.copy(viewDirection.multiplyScalar(distance));
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.minDistance = radius * 0.55;
    controls.maxDistance = radius * 7;
    controls.update();
  }

  async function setSource(source, method = "trellis") {
    const sequence = ++loadSequence;
    disposeModel();
    configureAppearance(method);
    if (!source) {
      setState("empty");
      return;
    }

    setState("loading");
    try {
      const gltf = await loader.loadAsync(source);
      if (sequence !== loadSequence) {
        gltf.scene.traverse((node) => node.geometry?.dispose?.());
        return;
      }

      model = gltf.scene;
      const adjustedMaterials = new Set();
      const scratchColor = new THREE.Color();
      model.traverse((node) => {
        if (!node.isMesh) return;
        const vertexColors = node.geometry?.getAttribute("color");
        if (options.correspondence && method === "triposr" && vertexColors) {
          for (let index = 0; index < vertexColors.count; index += 1) {
            scratchColor.fromBufferAttribute(vertexColors, index).convertSRGBToLinear();
            vertexColors.setXYZ(index, scratchColor.r, scratchColor.g, scratchColor.b);
          }
          vertexColors.needsUpdate = true;
        }
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.filter(Boolean).forEach((material) => {
          if (adjustedMaterials.has(material)) return;
          adjustedMaterials.add(material);
          if ("metalness" in material) material.metalness = 0;
          if ("roughness" in material) material.roughness = 0.72;
          material.needsUpdate = true;
        });
      });
      scene.add(model);
      frameModel(model);
      setState("ready");
    } catch (error) {
      if (sequence !== loadSequence) return;
      console.error(`Unable to load ${options.name} GLB`, error);
      setState("error");
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(host);

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  window.addEventListener(options.eventName, (event) => {
    setSource(event.detail?.src || "", event.detail?.model || "trellis");
  });
  setSource(host.dataset.modelSrc || "", host.dataset.modelKey || "trellis");
}

createGLBViewer(document.querySelector("[data-corr-model]"), {
  name: "correspondence",
  eventName: "correspondence-model-change",
  correspondence: true,
});

createGLBViewer(document.querySelector("[data-main-model]"), {
  name: "Main Results",
  eventName: "main-result-model-change",
  correspondence: false,
  autoRotate: false,
  exposure: 0.62,
  lightScale: 0.72,
  framePadding: 0.75,
  viewDirection: [-1.35, 0.85, 1.6],
});
