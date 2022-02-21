import { Song, Track, Instrument } from 'reactronica';
import React from 'react';

// Simplified Drum Pads
const DrumPads = () => {
  const [notes, setNotes] = React.useState(null);

  return (
    <>
      <button
        onMouseDown={() => setNotes([{ name: 'C3' }])}
        onMouseUp={() => setNotes(null)}
      >
        Kick
      </button>
      {/* ...other pads */}

      {/* Reactronica Components */}
      <Song>
        <Track>
          <Instrument
            type="sampler"
            notes={notes}
            samples={{
              C3: '/drums/kick.wav',
              D3: '/drums/snare.wav',
              E3: '/drums/hat.wav',
            }}
            onLoad={(buffers) => {
              // Runs when all samples are loaded
            }}
          />
        </Track>
      </Song>
    </>
  );
};

export default DrumPads;