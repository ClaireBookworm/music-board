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
    audio = document.querySelector("audio"),
    analyser,
    frequencyData;


//////////////////////////////////////////////////////

// Set up dat.gui
const playlist = {
   "drone song": "https://cloud-9hfebwzq5-hack-club-bot.vercel.app/0drone_song.mp3",
  "Final Defiance": "https://cloud-9hfebwzq5-hack-club-bot.vercel.app/1final_defiance.mp3",
  "Empty Space Above": "https://cloud-9hfebwzq5-hack-club-bot.vercel.app/3the_empty_space_above.mp3",
  "Celeste Prologue": "https://cloud-9hfebwzq5-hack-club-bot.vercel.app/2prologue_-_celeste_soundtrack.mp3",
  // "another man": "https://res.cloudinary.com/broregard/video/upload/v1550441401/Another_Man_wl53nr.mp3",
  "chillhop": "https://cloud-4slzggtp2-hack-club-bot.vercel.app/0chilly.mp3",
  
  "synthwave": "https://cloud-4slzggtp2-hack-club-bot.vercel.app/1synthwavey.mp3"
};


const VizCtrl = function() {
  this.song = "";
  this.song = playlist["chillhop"];
  this.spread = 3;
  this.width = 40;
  this.sphereFrequency = 10;
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

fetchSong(playlist["blackbird"])

function fetchSong(mp3 = Viz.song) {
  fetch(mp3)
    .then(mp3 => mp3.blob())
    .then(mp3 => {
    if (!initAudio) {
      initAudio = true;
      window.addEventListener("click", function allowAudio() {
        window.removeEventListener("click", allowAudio);
        playMusic(mp3);
        render()
      });
    }
    else playMusic(mp3);
  });
}

function playMusic(mp3) {
  const audioContext = window.webkitAudioContext || window.AudioContext;
  const files = this.files;

  audio.src = URL.createObjectURL(mp3);
  audio.play();

  const context = new audioContext();
  const src = context.createMediaElementSource(audio);
  analyser = context.createAnalyser();

  src.connect(analyser);
  analyser.connect(context.destination);

  const bufferLength = analyser.frequencyBinCount;
  frequencyData = new Uint8Array(bufferLength);
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

file.onchange = function() {
  playMusic(this.files[0]);
}


//////////////////////////////////////////////////////
// Render called in fetchSong

function render() {
  camera.translateZ(Math.sin(cameraCount * .55) * .6);
  cameraCount += cameraCountIncrement;

  visualize()
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}


//////////////////////////////////////////////////////
// midi input code 

var log = console.log.bind(console),
  keyData = document.getElementById("key_data"),
  deviceInfoInputs = document.getElementById("inputs"),
  deviceInfoOutputs = document.getElementById("outputs"),
  midi;
var AudioContext;
var context;
var btnBox = document.getElementById("content"),
  btn = document.getElementsByClassName("button");
var data, cmd, channel, type, note, velocity;

// Existing code unchanged.
window.onload = function () {
  var context = new AudioContext();
  // Setup all nodes
  // ...
};

try {
  AudioContext = window.AudioContext || window.webkitAudioContext; // for ios/safari
  context = new AudioContext().resume();
  // getAudioContext().resume();
} catch (e) {
  alert(
    "Web Audio API is not supported in this browser or there has been an error."
  );
}
// request MIDI access
if (navigator.requestMIDIAccess) {
  navigator
    .requestMIDIAccess({
      sysex: false,
    })
    .then(onMIDISuccess, onMIDIFailure);
} else {
  alert("No MIDI support in your browser.");
}

// add event listeners
document.addEventListener("keydown", keyController);
document.addEventListener("keyup", keyController);
for (var i = 0; i < btn.length; i++) {
  btn[i].addEventListener("mousedown", clickPlayOn);
  btn[i].addEventListener("mouseup", clickPlayOff);
}
// prepare audio files
for (var i = 0; i < btn.length; i++) {
  addAudioProperties(btn[i]);
}
// TODO: restore this later for drums!! 
// this maps the MIDI key value (60 - 64) to our samples
// var sampleMap = {
//   key60: 1,
//   key61: 2,
//   key62: 3,
//   key63: 4,
//   key64: 5,
// };
// user interaction, mouse click
function clickPlayOn(e) {
  e.target.classList.add("active");
  e.target.play();
}

function clickPlayOff(e) {
  e.target.classList.remove("active");
}
// qwerty keyboard controls. [q,w,e,r,t]
function keyController(e) {
  if (e.type == "keydown") {
    switch (e.keyCode) {
      case 81:
        btn[0].classList.add("active");
        btn[0].play();
        break;
      case 87:
        btn[1].classList.add("active");
        btn[1].play();
        break;
      case 69:
        btn[2].classList.add("active");
        btn[2].play();
        break;
      case 82:
        btn[3].classList.add("active");
        btn[3].play();
        break;
      case 84:
        btn[4].classList.add("active");
        btn[4].play();
        break;
      default:
      //console.log(e);
    }
  } else if (e.type == "keyup") {
    switch (e.keyCode) {
      case 81:
        btn[0].classList.remove("active");
        break;
      case 87:
        btn[1].classList.remove("active");
        break;
      case 69:
        btn[2].classList.remove("active");
        break;
      case 82:
        btn[3].classList.remove("active");
        break;
      case 84:
        btn[4].classList.remove("active");
        break;
      default:
      //console.log(e.keyCode);
    }
  }
}
// midi functions
function onMIDISuccess(midiAccess) {
  midi = midiAccess;
  var inputs = midi.inputs.values();
  // loop through all inputs
  for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
    // listen for midi messages
    input.value.onmidimessage = onMIDIMessage;
    // this just lists our inputs in the console
    listInputs(input);
  }
  // listen for connect/disconnect message
  midi.onstatechange = onStateChange;
}

function onMIDIMessage(event) {
  (data = event.data),
    (cmd = data[0] >> 4),
    (channel = data[0] & 0xf),
    (type = data[0] & 0xf0), // channel agnostic message type. Thanks, Phil Burk.
    (note = data[1]),
    (velocity = data[2]);
	// with pressure and tilt off
	// note off: 128, cmd: 8
	// note on: 144, cmd: 9
	// pressure / tilt on
	// pressure: 176, cmd 11:
	// bend: 224, cmd: 14
	var key;
	var num = (note - 48) % 12;
	switch (num){
		case 0:
			key = 'C';
			break;
		case 1:
			key = 'C#';
			break;
		case 2:
			key = 'D';
			break;
		case 3:
			key = 'D#';
			break;
		case 4:
			key = 'E';
			break;
		case 5:
			key = 'F';
			break;
		case 6:
			key = 'F#';
			break;
		case 7:
			key = 'G';
			break;
		case 8:
			key = 'G#';
			break;
		case 9:
			key = 'A';
			break;
		case 10:
			key = 'A#';
			break;
		case 11:
			key = 'B';
			break;
		default:
			key = 'C';
	}
	console.log("NOTE IS " + key);

	if (velocity) {
		noteOn(note, velocity);
	} else {
		noteOff(note, velocity);
	}
	console.log("data", data, "cmd", cmd, "channel", channel, "note", key);
	logger(keyData, "Data for your key:", data);
	//   switch (type) {
	//     case 144: // noteOn message
	//       noteOn(note, velocity);
	//       break;
	//     case 128: // noteOff message
	//       noteOff(note, velocity);
	//       break;
	//   }

//   console.log("data", data, "cmd", cmd, "channel", channel);
//   logger(keyData, "key data", data);
}

function onStateChange(event) {
  var port = event.port,
    state = port.state,
    name = port.name,
    type = port.type;
  if (type == "input") console.log("name", name, "port", port, "state", state);
}

function listInputs(inputs) {
  var input = inputs.value;
  log(
    "Input port : [ type:'" +
      input.type +
      "' id: '" +
      input.id +
      "' manufacturer: '" +
      input.manufacturer +
      "' name: '" +
      input.name +
      "' version: '" +
      input.version +
      "']"
  );
}

function noteOn(midiNote, velocity) {
  player(midiNote, velocity);
}

function noteOff(midiNote, velocity) {
  player(midiNote, velocity);
}

// TODO: restore for player! 
function player(note, velocity) {
  // var sample = sampleMap["key" + note];
  // if (sample) {
  //   if (type == (0x80 & 0xf0) || velocity == 0) {
  //     //QuNexus always returns 144
  //     btn[sample - 1].classList.remove("active");
  //     return;
  //   }
  //   btn[sample - 1].classList.add("active");
  //   btn[sample - 1].play(velocity);
  // }
}

function onMIDIFailure(e) {
  log(
    "No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " +
      e
  );
}

// audio functions
// We'll go over these in detail in future posts
function loadAudio(object, url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function () {
    context.decodeAudioData(request.response, function (buffer) {
      object.buffer = buffer;
    });
  };
  request.send();
}

function addAudioProperties(object) {
  object.name = object.id;
  object.source = object.dataset.sound;
  loadAudio(object, object.source);
  object.play = function (volume) {
    var s = context.createBufferSource();
    var g = context.createGain();
    var v;
    s.buffer = object.buffer;
    s.playbackRate.value = randomRange(0.5, 2);
    if (volume) {
      v = rangeMap(volume, 1, 127, 0.2, 2);
      s.connect(g);
      g.gain.value = v * v;
      g.connect(context.destination);
    } else {
      s.connect(context.destination);
    }

    s.start();
    object.s = s;
  };
}

// utility functions
function randomRange(min, max) {
  return Math.random() * (max + min) + min;
}

function rangeMap(x, a1, a2, b1, b2) {
  return ((x - a1) / (a2 - a1)) * (b2 - b1) + b1;
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function logger(container, label, data) {
  messages =
    label +
    " [channel: " +
    (data[0] & 0xf) +
    ", cmd: " +
    (data[0] >> 4) +
    ", type: " +
    (data[0] & 0xf0) +
    " , note: " +
    data[1] +
    " , velocity: " +
    data[2] +
    "]";
  //   container.textContent = messages;
  document.getElementById("type").innerHTML = messages;
}

// MIDI utility functions
function showMIDIPorts(midiAccess) {
  var inputs = midiAccess.inputs,
    outputs = midiAccess.outputs,
    html;
  html = '<h4>MIDI Inputs:</h4><div class="info">';
  inputs.forEach(function (port) {
    html += "<p>" + port.name + "<p>";
    html += '<p class="small">connection: ' + port.connection + "</p>";
    html += '<p class="small">state: ' + port.state + "</p>";
    html += '<p class="small">manufacturer: ' + port.manufacturer + "</p>";
    if (port.version) {
      html += '<p class="small">version: ' + port.version + "</p>";
    }
  });
  deviceInfoInputs.innerHTML = html + "</div>";

  html = '<h4>MIDI Outputs:</h4><div class="info">';
  outputs.forEach(function (port) {
    html += "<p>" + port.name + "<br>";
    html += '<p class="small">manufacturer: ' + port.manufacturer + "</p>";
    if (port.version) {
      html += '<p class="small">version: ' + port.version + "</p>";
    }
  });
  deviceInfoOutputs.innerHTML = html + "</div>";
}


