import './App.css';
import { names } from './modules/names';
import { useMetronome, useConfig, useMidi, polyhponyModes, cvSources, polyphonyKinds, cvModes, pitchbendRanges, ccCommands, clockDividers, resetBeats, gateSources, midiNotes, MONOPHONIC, TRIPHONIC, DUOPHONIC, calibration_values, calibration_note_names, tempos, midiNotesInRange } from './modules/midi';
import { useState } from 'react';

function App() {
  const config = useConfig()
  const {sendMidiRealtime, sendNoteOn, sendNoteOnOff, sendNoteOff, sendConfigSysex, sendSysexRequest, sendCalStart, sendCalStop} = useMidi(config)
  const {setMetronome, blink, tempo, setTempo} = useMetronome(sendMidiRealtime)
  const [page, setPage] = useState("home")
  return (
    <div className="App">
      {
        config.showModal &&
        <>
          <div className='modal-hazer'/>
          <div className='modal-container'>
            <div className='modal'>
              <div className='modal-content'>
                {config.modalText}
              </div>
            </div>
          </div>
        </>
      }
      <span className='header'>
        <span 
          className='button'
          onClick={()=>setPage("home")}  
        >
          CONFIG
        </span>
        <span 
          className='button'
          onClick={()=>setPage("cal")}  
        >
          CALIBRATION
        </span>
        <span 
          className='button'
          onClick={()=>setPage("tools")}  
        >
          TOOLS
        </span>
        <span 
          className='button'
          onClick={()=>setPage("midi")}  
        >
          MIDI
        </span>
        <h2>
          UNHOLY HOST
        </h2>
        <span 
          className='button'
          onClick={sendSysexRequest}  
        >
          DOWNLOAD
        </span>
        <span 
          className='button'
          onClick={sendConfigSysex}  
          style={{marginRight:50}}
        >
          UPLOAD
        </span>
      </span>
        <div className={"App" + (page != "home" ? " visually-hidden" : "")}>
          <div className='title'>
            polyphony mode
          </div>
          <div className='select-group group'>
            {
              polyhponyModes.map((mode,i)=>
                <label key={i}>
                  {names.polyhponyModes[mode]}
                  <input 
                    type="radio" 
                    value={mode}
                    checked={config.POLYPHONY_MODE == mode}
                    onChange={e=>e.target.value && config.setPOLYPHONY_MODE(mode)}
                  />
                </label>
              )
            }
          </div>
          <div className='title'>
            source of CV output value
          </div>
          <div className="select-group group">
            {
              [
                { get: config.CV_1_SOURCE, set: config.setCV_1_SOURCE, abled: config.POLYPHONY_MODE == MONOPHONIC },
                { get: config.CV_2_SOURCE, set: config.setCV_2_SOURCE, abled: config.POLYPHONY_MODE == MONOPHONIC },
                { get: config.CV_3_SOURCE, set: config.setCV_3_SOURCE, abled: config.POLYPHONY_MODE != TRIPHONIC },
              ].map(({get, set, abled}, i)=>
                <label key={i}>
                  {"CV " +(i + 1) + " SOURCE"}
                  <select
                    value={get}
                    onChange={e=>set(e.target.value)}
                    disabled={!abled}
                  >
                    {
                      cvSources.map((source,i)=>
                        <option value={source} key={i}>
                          {names.cvSources[source]}
                        </option>
                      )
                    }
                  </select>
                </label>          
              )
            }
          </div>
          <div className='title'>
            polyphony mode for each CV group
          </div>
          <div className="select-group group">
            {
              [
                { get: config.CV_1_AND_2_MODE,       set: config.setCV_1_AND_2_MODE,       abled: config.POLYPHONY_MODE == DUOPHONIC },
                { get: config.CV_1_AND_2_AND_3_MODE, set: config.setCV_1_AND_2_AND_3_MODE, abled: config.POLYPHONY_MODE == TRIPHONIC },
              ].map(({get, set, abled}, i)=>
                <label key={i}>
                  {i ? "CV 1/2/3 POLYPHONY MODE" : "CV 1/2 POLYPHONY MODE"}
                  <select
                    value={get}
                    onChange={e=>set(e.target.value)}
                    disabled={!abled}
                  >
                    {
                      polyphonyKinds.map((kind,i)=>
                        <option value={kind} key={i}>
                          {names.polyphonyKinds[kind]}
                        </option>
                      )
                    }
                  </select>
                </label>          
              )
            }
          </div>
          <div className='title'>
            volts per octave or hz per volt
          </div>
          <div className="select-group group">
            {
              [
                { get: config.CV_1_SCALE, set: config.setCV_1_SCALE },
                { get: config.CV_2_SCALE, set: config.setCV_2_SCALE },
                { get: config.CV_3_SCALE, set: config.setCV_3_SCALE },
              ].map(({get, set}, i)=>
                <label key={i}>
                  {"CV " + (i + 1) + " MODE"}
                  <select
                    value={get}
                    onChange={e=>set(e.target.value)}
                  >
                    {
                      cvModes.map((mode,i)=>
                        <option value={mode} key={i}>
                          {names.cvModes[mode]}
                        </option>
                      )
                    }
                  </select>
                </label>          
              )
            }
          </div>
          <div className='title'>
            how far the pitchbend goes
          </div>
          <div className="select-group group">
              <label>
                PITCHBEND RANGE
                <select
                  value={config.PITCH_BEND_RANGE}
                  onChange={e=>config.setPITCH_BEND_RANGE(e.target.value)}
                >
                  {
                    pitchbendRanges.map((range, i)=>
                      <option value={range} key={i}>
                        {range}
                      </option>
                    )
                  }
                </select>
              </label>          
          </div>
          <div className='title'>
            CC1 CC2 and CC3 each listen on one CC channel
          </div>
          <div className="select-group group">
            {
              [
                { get: config.CC1_COMMAND, set: config.setCC1_COMMAND },
                { get: config.CC2_COMMAND, set: config.setCC2_COMMAND },
                { get: config.CC3_COMMAND, set: config.setCC3_COMMAND },
              ].map(({get, set}, i)=>
                <label key={i}>
                  {"CC " + (i + 1) + " COMMAND"}
                  <select
                    value={get}
                    onChange={e=>set(e.target.value)}
                  >
                    {
                      ccCommands.map((cmd,i)=>
                        <option value={cmd} key={i}>
                          {cmd}
                        </option>
                      )
                    }
                  </select>
                </label>          
              )
            }
          </div>
          <div className='title'>
            All 8 clocks can be divided independently
          </div>
          <div className="group">
            <div className="select-group">
              {
                [
                  { get: config.CLOCK_1_DIVIDER, set: config.setCLOCK_1_DIVIDER },
                  { get: config.CLOCK_2_DIVIDER, set: config.setCLOCK_2_DIVIDER },
                  { get: config.CLOCK_3_DIVIDER, set: config.setCLOCK_3_DIVIDER },
                  { get: config.CLOCK_4_DIVIDER, set: config.setCLOCK_4_DIVIDER },
                ].map(({get, set}, i)=>
                  <label key={i}>
                    {"CLOCK " + (i + 1) + " DIVIDER"}
                    <select
                      value={get}
                      onChange={e=>set(e.target.value)}
                    >
                      {
                        clockDividers.map((div,i)=>
                          <option value={div} key={i}>
                            {div}
                          </option>
                        )
                      }
                    </select>
                  </label>          
                )
              }
            </div>
            <div className="select-group">
              {
                [
                  { get: config.CLOCK_5_DIVIDER, set: config.setCLOCK_5_DIVIDER },
                  { get: config.CLOCK_6_DIVIDER, set: config.setCLOCK_6_DIVIDER },
                  { get: config.CLOCK_7_DIVIDER, set: config.setCLOCK_7_DIVIDER },
                  { get: config.CLOCK_8_DIVIDER, set: config.setCLOCK_8_DIVIDER },
                ].map(({get, set}, i)=>
                <label key={i}>
                    {"CLOCK " + (i + 5) + " DIVIDER"}
                    <select
                      value={get}
                      onChange={e=>set(e.target.value)}
                    >
                      {
                        clockDividers.map((div,i)=>
                          <option value={div} key={i}>
                            {div}
                          </option>
                        )
                      }
                    </select>
                  </label>          
                )
              }
            </div>
          </div>
          <div className='title'>
            In transport mode, gates can send a trigger every x beats
          </div>
          <div className="select-group group">
            {
              [
                { get: config.RESET_1_BEATS, set: config.setRESET_1_BEATS },
                { get: config.RESET_2_BEATS, set: config.setRESET_2_BEATS },
                { get: config.RESET_3_BEATS, set: config.setRESET_3_BEATS },
              ].map(({get, set}, i)=>
                <label key={i}>
                  {"RESET " + (i + 1) + " BEATS"}
                  <select
                    value={get}
                    onChange={e=>set(e.target.value)}
                  >
                    {
                      resetBeats.map((div,i)=>
                        <option value={div} key={i}>
                          {div}
                        </option>
                      )
                    }
                  </select>
                </label>          
              )
            }
          </div>
          <div className='title'>
            What controls each gate
          </div>
          <div className="group">
            <div className="select-group">
              {
                [
                  {getGate: config.GATE_1_SOURCE, setGate: config.setGATE_1_SOURCE, getNote: config.GATE_1_NOTE, setNote: config.setGATE_1_NOTE, getInv: config.GATE_1_INVERT, setInv: config.setGATE_1_INVERT},
                  {getGate: config.GATE_2_SOURCE, setGate: config.setGATE_2_SOURCE, getNote: config.GATE_2_NOTE, setNote: config.setGATE_2_NOTE, getInv: config.GATE_2_INVERT, setInv: config.setGATE_2_INVERT},
                  {getGate: config.GATE_3_SOURCE, setGate: config.setGATE_3_SOURCE, getNote: config.GATE_3_NOTE, setNote: config.setGATE_3_NOTE, getInv: config.GATE_3_INVERT, setInv: config.setGATE_3_INVERT},
                  {getGate: config.GATE_4_SOURCE, setGate: config.setGATE_4_SOURCE, getNote: config.GATE_4_NOTE, setNote: config.setGATE_4_NOTE, getInv: config.GATE_4_INVERT, setInv: config.setGATE_4_INVERT},
                ].map(({getGate, setGate, getNote, setNote, getInv, setInv}, i)=>          
                  <div className='gate-group' key={i}>
                    <label>
                      {"GATE " + (i + 1) + " SOURCE"}
                      <select
                        value={getGate}
                        onChange={e=>setGate(e.target.value)}
                      >
                        {
                          gateSources.map((src,i)=>
                            <option value={src} key={i}>
                              {names.gateSources[src]}
                            </option>
                          )
                        }
                      </select>
                    </label>       
                    <label className={getGate != 0 ? "grey" : ""}>
                      {"GATE " + (i + 1) + " NOTE"}
                      <select
                        value={getNote}
                        onChange={e=>setNote(e.target.value)}
                        disabled={getGate != 0}
                      >
                        {
                          midiNotes.map((note,i)=>
                            <option value={note} key={i}>
                              {names.midiNotes[note]}
                            </option>
                          )
                        }
                      </select>
                    </label> 
                    <label>
                      INVERT
                      <input 
                        onChange={()=>{}} // shut up react
                        type="checkbox" 
                        checked={getInv}
                        onClick={()=>setInv(!getInv)}
                      />
                    </label>
                  </div>
                )
              }
              
            </div>
            <div className="select-group">
              {
                [
                  {getGate: config.GATE_5_SOURCE, setGate: config.setGATE_5_SOURCE, getNote: config.GATE_5_NOTE, setNote: config.setGATE_5_NOTE, getInv: config.GATE_5_INVERT, setInv: config.setGATE_5_INVERT},
                  {getGate: config.GATE_6_SOURCE, setGate: config.setGATE_6_SOURCE, getNote: config.GATE_6_NOTE, setNote: config.setGATE_6_NOTE, getInv: config.GATE_6_INVERT, setInv: config.setGATE_6_INVERT},
                  {getGate: config.GATE_7_SOURCE, setGate: config.setGATE_7_SOURCE, getNote: config.GATE_7_NOTE, setNote: config.setGATE_7_NOTE, getInv: config.GATE_7_INVERT, setInv: config.setGATE_7_INVERT},
                  {getGate: config.GATE_8_SOURCE, setGate: config.setGATE_8_SOURCE, getNote: config.GATE_8_NOTE, setNote: config.setGATE_8_NOTE, getInv: config.GATE_8_INVERT, setInv: config.setGATE_8_INVERT},
                ].map(({getGate, setGate, getNote, setNote, getInv, setInv}, i)=>          
                  <div className='gate-group' key={i}>
                    <label>
                      {"GATE " + (i + 5) + " SOURCE"}
                      <select
                        value={getGate}
                        onChange={e=>setGate(e.target.value)}
                      >
                        {
                          gateSources.map((src,i)=>
                            <option value={src} key={i}>
                              {names.gateSources[src]}
                            </option>
                          )
                        }
                      </select>
                    </label>          
                    <label>
                      {"GATE " + (i + 1) + " NOTE"}
                      <select
                        value={getNote}
                        onChange={e=>setNote(e.target.value)}
                      >
                        {
                          midiNotes.map((note,i)=>
                            <option value={note} key={i}>
                              {names.midiNotes[note]}
                            </option>
                          )
                        }
                      </select>
                    </label> 
                    <label>
                      INVERT
                      <input 
                        onChange={()=>{}}
                        type="checkbox" 
                        checked={getInv}
                        onClick={()=>setInv(!getInv)}
                      />
                    </label>
                  </div>
              )
            }
            </div>
          </div>
        </div>
        <div className={"App" + (page != "cal" ? " visually-hidden" : "")}>
          <div 
            className='big-button'
            onClick={()=>{
              if(config.calibrating){
                sendCalStop()
                config.setCalibrating(false)
              } else {
                sendCalStart()
                config.setCalibrating(true)
              }
            }}
          >
            {config.calibrating ? "STOP CALIBRATION" : "START CALIBRATION"}
          </div>
          <div className='cal-buttons'>
            <div className='row-label'>
              SELECT
            </div>
            {
              calibration_values.map((val, i)=>
                <div className='button-container' key={i}>
                  <div 
                    key={i}
                    className='cal-button'
                    style={{outlineWidth: i == config.calibrationPitch ? 3 : 0}}
                    onClick={()=>{
                      config.setCalibrationPitch(i)
                      sendNoteOnOff(val)
                    }}
                  >
                    {calibration_note_names[i]}
                    {/* {val} */}
                  </div>  
                </div>
              )
            }
          </div>
          {
            [
              [
                {set:config.setCAL_1_0, get: config.CAL_1_0},
                {set:config.setCAL_1_1, get: config.CAL_1_1},
                {set:config.setCAL_1_2, get: config.CAL_1_2},
                {set:config.setCAL_1_3, get: config.CAL_1_3},
                {set:config.setCAL_1_4, get: config.CAL_1_4},
                {set:config.setCAL_1_5, get: config.CAL_1_5},
                {set:config.setCAL_1_6, get: config.CAL_1_6},
              ],
              [
                {set:config.setCAL_2_0, get: config.CAL_2_0},
                {set:config.setCAL_2_1, get: config.CAL_2_1},
                {set:config.setCAL_2_2, get: config.CAL_2_2},
                {set:config.setCAL_2_3, get: config.CAL_2_3},
                {set:config.setCAL_2_4, get: config.CAL_2_4},
                {set:config.setCAL_2_5, get: config.CAL_2_5},
                {set:config.setCAL_2_6, get: config.CAL_2_6},
              ],
              [
                {set:config.setCAL_3_0, get: config.CAL_3_0},
                {set:config.setCAL_3_1, get: config.CAL_3_1},
                {set:config.setCAL_3_2, get: config.CAL_3_2},
                {set:config.setCAL_3_3, get: config.CAL_3_3},
                {set:config.setCAL_3_4, get: config.CAL_3_4},
                {set:config.setCAL_3_5, get: config.CAL_3_5},
                {set:config.setCAL_3_6, get: config.CAL_3_6},
              ]
          
            ].map((cv, i)=>
              <div className='cal-readings' key={i}>
                <div className='row-label'>
                  {"CV " + (i + 1)}
                </div>
                {
                  cv.map(({get, set}, i)=>
                    <div className='cal' key={i}>
                      <div className='input-container'>
                        <input
                          type="text"
                          value={typeof get == 'string' ? get : get.toFixed(3)}
                          onBlur={e=>{
                            const val = parseFloat(e.target.value)
                            if((val < 0) || (val > 9.999)){
                              set(0.00)
                              return alert("must be between 0.000 and 9.999")
                            }
                            set(last => parseFloat(e.target.value) || 0)
                          }}
                          onChange={e=>set(e.target.value)}
                        />
                      </div>
                    </div>
                  )
                }
              </div>
            )
          }
        </div>
        <div className={"App" + (page != "tools" ? " visually-hidden" : "")}>
          <div className='metronome'>
            <h2>
              METRONOME and KEYPAD
            </h2>
            <div>
              <label>
                TEMPO
                <select
                  style={{margin:8}}
                  value={tempo}
                  onChange={e=>setTempo(e.target.value)}
                >
                  {
                    tempos.map((t,i)=>
                      <option value={t} key={i}>
                        {t}
                      </option>
                    )
                  }
                </select>
              </label>          
            </div>
            <div 
              className='button'
              onClick={()=>setMetronome(true)}
              >
              START
            </div>
            <div 
              className='button'
              onClick={()=>setMetronome(false)}
            >
              STOP
            </div>
            <div 
              className='metronome-light'
              style={{opacity: blink ? 1 : 0}}  
            />
          </div>
          <div className='keyboard'>
            {
              midiNotesInRange.map((note,i)=>
                <Key key={i} note={note} sendNoteOn={sendNoteOn} sendNoteOff={sendNoteOff}/>
              )
            }
          </div>
        </div>
        <div className={"App" + (page != "midi" ? " visually-hidden" : "")}>
          <div className="select-group group">
            <label>
              MIDI CHANNEL
              <select
                value={config.midiChannel}
                onChange={e=>config.setMidiChannel(e.target.value)}
              >
                {
                  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map((chan, i)=>
                    <option value={chan} key={i}>
                      {chan == 0 ? "omni" : chan}
                    </option>
                  )
                }
              </select>
            </label>          
            <label>
              MERGE/ROUTE MIDI
              <select
                value={config.mergeMidi}
                onChange={e=>config.setMergeMidi(e.target.value)}
              >
                <option value={0}>
                  NONE
                </option>
                <option value={1}>
                  USB TO MIDI OUT
                </option>
                <option value={2}>
                  MIDI IN AND USB TO MIDI OUT
                </option>
                <option value={3}>
                  MIDI IN TO MIDI OUT
                </option>
              </select>
            </label>          
          </div>
        </div>
    </div>
    
  );
}

const Key = ({note, sendNoteOn, sendNoteOff}) => {
  const [on, setOn] = useState(false)
  return(
    <div 
      className='key'
      style={{backgroundColor: on ? 'green' : 'black'}}
      onClick={()=>{
        on ? sendNoteOff(note) : sendNoteOn(note)
        setOn(!on)
      }}
    >
      {names.midiNotes[note]}
    </div>

  )
}

export default App;
