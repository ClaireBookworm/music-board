// CommonJS:
// const dat = require('dat.gui');

// import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

// ES6:
// import * as dat from 'dat.gui';

//////////////////////////////////////////////////////
// variables
let plane,
    sphere,
    sphereLight,

    planeCount = 0,
    planeCountIncrement = .06,

    cameraCount = 1,
    cameraCountIncrement = Math.PI / 250,

    vert = [],
    initVerts = [],

    initAudio = false,
    audioContextInitialized = false,
    audioSourceConnected = false,
    renderStarted = false,
    audio = document.querySelector("audio"),
    audioContext,
    analyser,
    frequencyData,

    // MIDI synth variables
    midiEnabled = false,
    midiSynthGain,
    activeOscillators = {};


//////////////////////////////////////////////////////

// ytdl https://www.youtube.com/watch?v=fvg01l43XBc | ffmpeg -i pipe:0 -b:a 192K -vn enchanted.mp3 
//  ^ template for audio

// Set up dat.gui
const playlist = {
  "Modern Girl (Bleachers)": "./public/songs/Modern Girl.mp3",
  "Lucifer (A.G. Cook)": "./public/songs/Lucifer.mp3",
  "Float On (Modest Mouse)": "./public/songs/Float On.mp3",
  "Dance Yrself Clean (LCD Soundsystem)": "./public/songs/Dance Yrself Clean.mp3",
  "May I Have This Dance (Francis and the Lights)": "./public/songs/May I Have This Dance.mp3",
  "The New Year (Death Cab for Cutie)": "./public/songs/The New Year.mp3",
  "Go! (M83)": "./public/songs/Go! (feat. Mai Lan).mp3",
  "Behind the Sun (ODESZA)": "./public/songs/Behind The Sun.mp3",
  "Taxes (S. Carey)": "./public/songs/Taxes.mp3",
  "The Place Where He Inserted the Blade (Black Country, New Road)": "./public/songs/The Place Where He Inserted the Blade.mp3"
};


const VizCtrl = function() {
  this.song = "";
  this.song = playlist["Modern Girl (Bleachers)"];
  this.spread = 3;
  this.width = 40;
  this.sphereFrequency = 20;
  this.limit = 105;
  this.animSphere = true;
  this.animWave = true;
  this.animCrunch = true;
  this.resetPlane = () => {
    for (let x = 0; x < plane.geometry.vertices.length; x++) {
      let v = plane.geometry.vertices[x];
      v.x = initVerts[x];
      v.z = 0;
    }  
    plane.geometry.computeFaceNormals();	
    plane.geometry.normalsNeedUpdate = true;  
    plane.geometry.verticesNeedUpdate = true;
  }
};
const Viz = new VizCtrl();
const gui = new dat.GUI();

gui.add(Viz, "song", playlist).onChange(fetchSong);
gui.add(Viz, 'sphereFrequency', 0, 40).step(1)
gui.add(Viz, 'spread', 1, 10).step(.5)
gui.add(Viz, 'width', 10, 80).step(1)
gui.add(Viz, 'limit', 10, 200).step(1)
gui.add(Viz, 'animSphere')
gui.add(Viz, 'animWave')
gui.add(Viz, 'animCrunch')
gui.add(Viz, "resetPlane")
gui.close();


//////////////////////////////////////////////////////
// Set up three.js
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias:true });
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
// const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

scene.add(camera);
camera.rotation.x = Math.PI/180 * 90;
buildScene()

function buildScene(){
  buildPlane();
  buildSphere();
  buildLight();
}

function buildPlane() {
  const g = new THREE.PlaneGeometry(200,200,40,40);
  const m = new THREE.MeshStandardMaterial({flatShading:1,
                                            wireframe:1,
                                            color:0x06414c,
                                            emissive: 0x03223d,
                                            emissiveIntensity:.8,
                                            metalness:.9,
                                            roughness:.5});
  plane = new THREE.Mesh(g,m);
  plane.rotation.x = Math.PI * 270 / 180;
  plane.position.y = -5;
  scene.add(plane);


  // Distort plane
  for (let x = 0; x < plane.geometry.vertices.length; x++) {
    let v = plane.geometry.vertices[x];
    let distanceFromCenterY = Math.abs(v.x)/100;

    v.z += distanceFromCenterY > .2 ? 
      (Math.random() * (20 - .15) + .15) * distanceFromCenterY * 2 : 
    (Math.random() * (.8 - .2) + .2)   + distanceFromCenterY;

    vert[x] = v;
    initVerts[x] = v.x;
  }

  //create separate wireframe
  const wireframe = plane.clone();
  wireframe.material = new THREE.MeshBasicMaterial({wireframe:true, color:0x00ffff});
  wireframe.scale.multiplyScalar(1.001);
  scene.add(wireframe)
}

function buildSphere() {
  const g = new THREE.SphereGeometry( 22, 20, 20 );
  const m = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe:false });
  sphere = new THREE.Mesh(g, m);
  sphere.position.z = -130;
  scene.add(sphere);

  camera.position.z = -20;
  controls.target.set(0,0,-100)
  controls.update();
}

function buildLight() {
  sphereLight = new THREE.SpotLight( 0xff00ff ,5,150,10,0,2);
  sphereLight.position.set( 0, 50, -130 );
  sphereLight.lookAt(sphere)
  scene.add(sphereLight)
  //   let l2 = new THREE.HemisphereLight( 0x000000, 0xffffff, 1 );
  //   let l3 = new THREE.PointLight( 0xff00ff,.6, 250 );
  //   l3.position.set(0, 50, -150 );
  //   scene.add( l2);
  //   scene.add(l3);
}

function visualize() {
  analyser.getByteFrequencyData(frequencyData);

  if (Viz.animSphere) {
    avg = frequencyData[Viz.sphereFrequency]/200;
    avg = (avg * avg) + .001;

    sphere.scale.set(avg, avg, avg)
    sphereLight.intensity = avg * avg * 20;
  }

  if (Viz.animWave || Viz.animCrunch) {
    planeSine = Math.sin(planeCount);
    planeCount += planeCountIncrement;

    for (let x = 0; x < plane.geometry.vertices.length; x++) {
      let v = plane.geometry.vertices[x];

      if (Viz.animWave) {
        v.z = 1 + Math.abs(Math.sin( (v.z) / Viz.width) * (frequencyData[Math.floor(x/Viz.spread)] * (vert[x].x/100) * 2 - 2)) / 3;
        v.z = clamp (v.z, 0, Viz.limit)
      }

      if (Viz.animCrunch)
        v.x += Math.sin(planeCount) * frequencyData[1] * .00005  * v.x;
    }  

    plane.geometry.computeFaceNormals();	
    plane.geometry.normalsNeedUpdate = true;  
    plane.geometry.verticesNeedUpdate = true;
  }
}


//////////////////////////////////////////////////////
// window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


//////////////////////////////////////////////////////
// audio stuff

fetchSong(playlist["Modern Girl (Bleachers)"])

function fetchSong(mp3 = Viz.song) {
  fetch(mp3)
    .then(mp3 => mp3.blob())
    .then(mp3 => {
    if (!initAudio) {
      initAudio = true;
      window.addEventListener("click", function allowAudio() {
        window.removeEventListener("click", allowAudio);
        playMusic(mp3);
        if (!renderStarted) {
          renderStarted = true;
          render();
        }
      });
    }
    else playMusic(mp3);
  });
}

function playMusic(mp3) {
  audio.src = URL.createObjectURL(mp3);
  audio.play();

  // Create AudioContext if not already created (by MIDI or previous playback)
  if (!audioContextInitialized) {
    const AudioContextClass = window.webkitAudioContext || window.AudioContext;
    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    frequencyData = new Uint8Array(bufferLength);

    // Create gain node for MIDI synth
    midiSynthGain = audioContext.createGain();
    midiSynthGain.gain.value = 0.3;
    midiSynthGain.connect(analyser);

    audioContextInitialized = true;
  }

  // Connect audio element source (can only be done once per element)
  if (!audioSourceConnected) {
    const src = audioContext.createMediaElementSource(audio);
    src.connect(analyser);
    audioSourceConnected = true;
  }

  // Resume audio context if suspended (browser autoplay policy)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

file.onchange = function() {
  playMusic(this.files[0]);
  if (!renderStarted) {
    renderStarted = true;
    render();
  }
}


//////////////////////////////////////////////////////
// MIDI Synth - plays notes through Web Audio, visualized by analyser

function initMIDI() {
  if (!navigator.requestMIDIAccess) {
    console.log("Web MIDI not supported in this browser");
    return;
  }

  navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
}

function updateMIDIStatus(connected, deviceName = '') {
  const statusEl = document.getElementById('midi-status');
  if (!statusEl) return;

  if (connected) {
    statusEl.className = 'midi-status connected';
    statusEl.textContent = 'MIDI: ' + (deviceName || 'ON');
  } else {
    statusEl.className = 'midi-status disconnected';
    statusEl.textContent = 'MIDI: OFF';
  }
}

function onMIDISuccess(midiAccess) {
  console.log("MIDI access granted");
  midiEnabled = true;

  // Listen to all MIDI inputs
  let deviceCount = 0;
  let lastName = '';
  for (let input of midiAccess.inputs.values()) {
    console.log("MIDI input detected:", input.name);
    input.onmidimessage = handleMIDIMessage;
    deviceCount++;
    lastName = input.name;
  }

  if (deviceCount > 0) {
    updateMIDIStatus(true, lastName);
  }

  // Listen for new devices
  midiAccess.onstatechange = (e) => {
    if (e.port.type === "input") {
      if (e.port.state === "connected") {
        console.log("MIDI device connected:", e.port.name);
        e.port.onmidimessage = handleMIDIMessage;
        updateMIDIStatus(true, e.port.name);
      } else if (e.port.state === "disconnected") {
        console.log("MIDI device disconnected:", e.port.name);
        // Check if any devices still connected
        let stillConnected = false;
        let name = '';
        for (let input of midiAccess.inputs.values()) {
          if (input.state === "connected") {
            stillConnected = true;
            name = input.name;
            break;
          }
        }
        updateMIDIStatus(stillConnected, name);
      }
    }
  };
}

function onMIDIFailure(error) {
  console.log("MIDI access denied:", error);
}

function ensureAudioContext() {
  if (!audioContextInitialized) {
    const AudioContextClass = window.webkitAudioContext || window.AudioContext;
    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    frequencyData = new Uint8Array(bufferLength);

    // Create gain node for MIDI synth
    midiSynthGain = audioContext.createGain();
    midiSynthGain.gain.value = 0.3;
    midiSynthGain.connect(analyser);

    audioContextInitialized = true;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (!renderStarted) {
    renderStarted = true;
    render();
  }
}

function midiNoteToFrequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function handleMIDIMessage(event) {
  const [status, note, velocity] = event.data;
  const command = status & 0xF0;

  // Note On
  if (command === 0x90 && velocity > 0) {
    noteOn(note, velocity);
  }
  // Note Off (or Note On with velocity 0)
  else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    noteOff(note);
  }
}

function noteOn(note, velocity) {
  ensureAudioContext();

  // Stop existing note if still playing
  if (activeOscillators[note]) {
    noteOff(note);
  }

  const freq = midiNoteToFrequency(note);
  const gain = (velocity / 127) * 0.5;

  // Create oscillator
  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();

  // Use sawtooth for richer harmonics (better visualization)
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);

  // Add a second oscillator slightly detuned for fuller sound
  const osc2 = audioContext.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(freq * 1.005, audioContext.currentTime);

  // Envelope
  oscGain.gain.setValueAtTime(0, audioContext.currentTime);
  oscGain.gain.linearRampToValueAtTime(gain, audioContext.currentTime + 0.02);

  // Connect: oscillators -> gain -> midiSynthGain -> analyser -> destination
  osc.connect(oscGain);
  osc2.connect(oscGain);
  oscGain.connect(midiSynthGain);

  osc.start();
  osc2.start();

  activeOscillators[note] = { osc, osc2, oscGain };
}

function noteOff(note) {
  if (!activeOscillators[note]) return;

  const { osc, osc2, oscGain } = activeOscillators[note];

  // Fade out
  oscGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);

  // Stop oscillators after fade
  setTimeout(() => {
    osc.stop();
    osc2.stop();
  }, 150);

  delete activeOscillators[note];
}

// Initialize MIDI on page load
initMIDI();


//////////////////////////////////////////////////////
// Render called in fetchSong

function render() {
  camera.translateZ(Math.sin(cameraCount * .55) * .6);
  cameraCount += cameraCountIncrement;

  visualize()
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

