import logo from './logo.svg';
import './App.css';
import DrumPad from './components/drumpad';
import Synth from './components/synth';

function App() {
  var notes=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
  return (
    <div className="App">
      <header className="App-header">
        <div>
          {/* <Synth note="E0"/> */}
          {/* <Synth note="E3"/> */}
          {/* <Synth note="G3"/> */}
          {/* <Synth note="C6"/> */}
        </div>
        {/* <DrumPad /> */}
      </header>
    </div>
  );
}

export default App;
