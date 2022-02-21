import React from "react";
import { Song, Track, Instrument } from "reactronica";
import * as Tone from 'tone'

function Synth(props) {
  	const [isPlaying, setIsPlaying] = React.useState(false);
  	const [notes, setNotes] = React.useState(null);
	const notelist = ['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'A1', 'B1', 'C1', 'D1']
	notelist.map(function(element) { return element; });
	var buffer = new Tone.Buffer("/public/piano/E0vh.wav", function(){
		//the buffer is now available.
		var buff = buffer.get();
	});

  return (
    <div className="App">
		    {/* <div className={[css.drumPads, className || ''].join(' ')}> */}

      {/* <button
				onClick={() => setNotes([{name: (props.note)}])}>
				// onMouseUp={() => setNotes(null)}
				// onClick={this.handleClick}>
				// {props.note} 
			</button> */}
      <Song isPlaying={isPlaying} bpm={60}>
        <Track steps={[(props.note)]}>
          {/* <Instrument type="monoSynth" notes={['C3']} envelope={{attack: 0.2,release: 0.5,}} /> */}
          <Instrument
            type="sampler"
            notes={notes}
            samples={{
              A0: "/public/piano/A0vH.wav",
              B0: "/public/piano/B0vH.wav",
              C0: "/public/piano/C0vH.wav",
              D0: "/public/piano/D0vH.wav",
              E0: "/public/piano/E0vH.wav",
              F0: "/public/piano/F0vH.wav",
              G0: "/public/piano/G0vH.wav",
              A1: "/public/piano/A1vH.wav",
              B1: "/public/piano/B1vH.wav",
              C1: "/public/piano/C1vH.wav",
              D1: "/public/piano/D1vH.wav",
              E1: "/public/piano/E1vH.wav",
              F1: "/public/piano/F1vH.wav",
              G1: "/public/piano/G1vH.wav",
              A2: "/public/piano/A2vH.wav",
              B2: "/public/piano/B2vH.wav",
              C2: "/public/piano/C2vH.wav",
              D2: "/public/piano/D2vH.wav",
              E2: "/public/piano/E2vH.wav",
              F2: "/public/piano/F2vH.wav",
              G2: "/public/piano/G2vH.wav",
              A3: "/public/piano/A3vH.wav",
              B3: "/public/piano/B3vH.wav",
              C3: "/public/piano/C3vH.wav",
              D3: "/public/piano/D3vH.wav",
              E3: "/public/piano/E3vH.wav",
              F3: "/public/piano/F3vH.wav",
              G3: "/public/piano/G3vH.wav",
              A4: "/public/piano/A4vH.wav",
              B4: "/public/piano/B4vH.wav",
              C4: "/public/piano/C4vH.wav",
              D4: "/public/piano/D4vH.wav",
              E4: "/public/piano/E4vH.wav",
              F4: "/public/piano/F4vH.wav",
              G4: "/public/piano/G4vH.wav",
              A5: "/public/piano/A5vH.wav",
              B5: "/public/piano/B5vH.wav",
              C5: "/public/piano/C5vH.wav",
              D5: "/public/piano/D5vH.wav",
              E5: "/public/piano/E5vH.wav",
              F5: "/public/piano/F5vH.wav",
              G5: "/public/piano/G5vH.wav",
              A6: "/public/piano/A6vH.wav",
              B6: "/public/piano/B6vH.wav",
              C6: "/public/piano/C6vH.wav",
              D6: "/public/piano/D6vH.wav",
              E6: "/public/piano/E6vH.wav",
              F6: "/public/piano/F6vH.wav",
              G6: "/public/piano/G6vH.wav",
              A7: "/public/piano/A7vH.wav",
              B7: "/public/piano/B7vH.wav",
              C7: "/public/piano/C7vH.wav",
              D7: "/public/piano/D7vH.wav",
              E7: "/public/piano/E7vH.wav",
              F7: "/public/piano/F7vH.wav",
              G7: "/public/piano/G7vH.wav",
              A8: "/public/piano/A8vH.wav",
              B8: "/public/piano/B8vH.wav",
              C8: "/public/piano/C8vH.wav",
              D8: "/public/piano/D8vH.wav",
              E8: "/public/piano/E8vH.wav",
              F8: "/public/piano/F8vH.wav",
              G8: "/public/piano/G8vH.wav",
            }}

            onLoad={(buffers) => {
            	// runs when all samples are loaded
            }}
          />
        </Track>
      </Song>

      <header className="App-header">
	  {[
        { note: (props.note), name: (props.note) },
      ].map((pad) => (
        <button
          onMouseDown={() =>
            setNotes([
              {
                name: pad.note,
              },
            ])
          }
          onMouseUp={() => {
            setNotes(null);
          }}
        //   className={css.pad}
          key={pad.note}
		  style={{
            fontSize: "2rem",
            padding: "10px",
			margin: "10px",
            width: "5rem",
            borderRadius: "5px",
            border: "black solid 1px",
            fontFamily: "Gill Sans",
            color: "white",
            backgroundColor: "black",
          }}
        >
          {pad.name}
        </button>
      ))}
        {/* <button
          style={{
            fontSize: "1rem",
            padding: "10px",
            width: "5rem",
            borderRadius: "5px",
            border: "black solid 1px",
            fontFamily: "Avenir",
            color: "white",
            backgroundColor: "black",
          }}
          onClick={() => {
            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? "Stop" : props.note}
        </button> */}
      </header>
    </div>
  );
}

export default Synth;

// import * as Tone from 'tone'

//create a synth and connect it to the main output (your speakers)
// const synth = new Tone.Synth().toDestination();

//play a middle 'C' for the duration of an 8th note
// synth.triggerAttackRelease("C4", "8n");
