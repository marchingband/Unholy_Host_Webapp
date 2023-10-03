
import { useCallback, useEffect, useState, useRef } from "react"
import { names } from "./names"
import { floatToIntArray, intArrayToFloat, getChecksum } from "./util"

export const MIDI_CLOCK = 0xF8
export const MIDI_START = 0xFA
export const MIDI_CONTINUE = 0xFB
export const MIDI_STOP = 0xFC

const MANUFACTURER_ID_1 = 0x00
const MANUFACTURER_ID_2 = 0x21
const MANUFACTURER_ID_3 = 0x75 // 117, ascii value for "u" for ultrapalace, should be between 0x60 and 0x7F for sysex spec

const SYSEX_TYPE_CONFIG =  0x00
const SYSEX_TYPE_ACK =  0x01
const SYSEX_TYPE_REQUEST_CONFIG =  0x02
const SYSEX_TYPE_CAL_MODE_ON = 0x03
const SYSEX_TYPE_CAL_MODE_OFF = 0x04

// polyphony modes
export const MONOPHONIC = 0
export const DUOPHONIC = 1
export const TRIPHONIC = 2

export const polyhponyModes = [
    MONOPHONIC,
    DUOPHONIC,
    TRIPHONIC,
]

// cv sources
export const NOTE = 0
export const VELOCITY = 1
export const CC1 = 2
export const CC2 = 3
export const CC3 = 4

export const cvSources = [
    NOTE,
    VELOCITY,
    CC1,
    CC2,
    CC3
]

// polyphony kinds
export const HIGHEST = 0
export const LOWEST = 1
export const LAST = 2

export const polyphonyKinds = [
    HIGHEST,
    LOWEST,
    LAST
]

// cv modes
export const V_OCT = 0
export const HZ_V = 1

export const cvModes = [
    V_OCT,
    HZ_V
]

export const pitchbendRanges = Array(127).fill().map((_,i)=>i)

export const ccCommands = Array(120).fill().map((_,i)=>i)

export const clockDividers = Array(124).fill().map((_,i)=>i)

export const resetBeats = Array(127).fill().map((_,i)=>i)

export const midiNotes = Array(127).fill().map((_,i)=>i)

export const midiNotesInRange = Array(60).fill().map((_,i)=>i+33)

export const tempos = Array(200).fill().map((_,i)=>i+40)

export const calibration_values = [0, 1, 13, 25, 37, 49, 59];
export const calibration_note_names = ["A1", "Bb1", "Bb2", "Bb3", "Bb4", "Bb5", "Ab6"];


// gate sources
export const NOTE_ON_OFF = 0
export const CLOCK_1 = 1
export const CLOCK_2 = 2 
export const CLOCK_3 = 3
export const CLOCK_4 = 4
export const CLOCK_5 = 5
export const CLOCK_6 = 6
export const CLOCK_7 = 7
export const CLOCK_8 = 8
export const RESET_1 = 9
export const RESET_2 = 10
export const RESET_3 = 11
export const TRANSPORT = 12
export const MONOPHONIC_ON_OFF = 13
export const DUOPHONIC_ON_OFF_VOICE_1 = 14
export const DUOPHONIC_ON_OFF_VOICE_2 = 15
export const TRIPHONIC_ON_OFF_VOICE_1 = 16
export const TRIPHONIC_ON_OFF_VOICE_2 = 17
export const TRIPHONIC_ON_OFF_VOICE_3 = 18
export const CC1_HI_LOW = 19
export const CC2_HI_LOW = 20
export const CC3_HI_LOW = 21

export const gateSources = [
    NOTE_ON_OFF,
    MONOPHONIC_ON_OFF,
    DUOPHONIC_ON_OFF_VOICE_1,
    DUOPHONIC_ON_OFF_VOICE_2,
    TRIPHONIC_ON_OFF_VOICE_1,
    TRIPHONIC_ON_OFF_VOICE_2,
    TRIPHONIC_ON_OFF_VOICE_3,
    CC1_HI_LOW,
    CC2_HI_LOW,
    CC3_HI_LOW,
    RESET_1,
    RESET_2,
    RESET_3,
    TRANSPORT,
    CLOCK_1,
    CLOCK_2,
    CLOCK_3,
    CLOCK_4,
    CLOCK_5,
    CLOCK_6,
    CLOCK_7,
    CLOCK_8
]

export const useConfig = () => {

    const [POLYPHONY_MODE, setPOLYPHONY_MODE] = useState(MONOPHONIC)

    const [CV_1_SOURCE, setCV_1_SOURCE] = useState(NOTE)
    const [CV_2_SOURCE, setCV_2_SOURCE] = useState(NOTE)
    const [CV_3_SOURCE, setCV_3_SOURCE] = useState(NOTE)

    const [CV_1_AND_2_MODE, setCV_1_AND_2_MODE] = useState(LAST)
    const [CV_1_AND_2_AND_3_MODE, setCV_1_AND_2_AND_3_MODE] = useState(LAST)
    const [CV_1_SCALE, setCV_1_SCALE] = useState(V_OCT)
    const [CV_2_SCALE, setCV_2_SCALE] = useState(V_OCT)
    const [CV_3_SCALE, setCV_3_SCALE] = useState(V_OCT)
    
    const [PITCH_BEND_RANGE, setPITCH_BEND_RANGE] = useState(12)
    
    const [CC1_COMMAND, setCC1_COMMAND] = useState(7)
    const [CC2_COMMAND, setCC2_COMMAND] = useState(10)
    const [CC3_COMMAND, setCC3_COMMAND] = useState(11)
    
    const [CLOCK_1_DIVIDER, setCLOCK_1_DIVIDER] = useState(3)
    const [CLOCK_2_DIVIDER, setCLOCK_2_DIVIDER] = useState(6)
    const [CLOCK_3_DIVIDER, setCLOCK_3_DIVIDER] = useState(12)
    const [CLOCK_4_DIVIDER, setCLOCK_4_DIVIDER] = useState(24)
    const [CLOCK_5_DIVIDER, setCLOCK_5_DIVIDER] = useState(48)
    const [CLOCK_6_DIVIDER, setCLOCK_6_DIVIDER] = useState(96)
    const [CLOCK_7_DIVIDER, setCLOCK_7_DIVIDER] = useState(96)
    const [CLOCK_8_DIVIDER, setCLOCK_8_DIVIDER] = useState(96)

    const [RESET_1_BEATS, setRESET_1_BEATS] = useState(4)
    const [RESET_2_BEATS, setRESET_2_BEATS] = useState(16)
    const [RESET_3_BEATS, setRESET_3_BEATS] = useState(32)

    const [GATE_1_SOURCE, setGATE_1_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_1_NOTE, setGATE_1_NOTE] = useState()
    const [GATE_1_INVERT, setGATE_1_INVERT] = useState(false)

    const [GATE_2_SOURCE, setGATE_2_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_2_NOTE, setGATE_2_NOTE] = useState()
    const [GATE_2_INVERT, setGATE_2_INVERT] = useState(false)

    const [GATE_3_SOURCE, setGATE_3_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_3_NOTE, setGATE_3_NOTE] = useState()
    const [GATE_3_INVERT, setGATE_3_INVERT] = useState(false)

    const [GATE_4_SOURCE, setGATE_4_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_4_NOTE, setGATE_4_NOTE] = useState()
    const [GATE_4_INVERT, setGATE_4_INVERT] = useState(false)

    const [GATE_5_SOURCE, setGATE_5_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_5_NOTE, setGATE_5_NOTE] = useState()
    const [GATE_5_INVERT, setGATE_5_INVERT] = useState(false)

    const [GATE_6_SOURCE, setGATE_6_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_6_NOTE, setGATE_6_NOTE] = useState()
    const [GATE_6_INVERT, setGATE_6_INVERT] = useState(false)

    const [GATE_7_SOURCE, setGATE_7_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_7_NOTE, setGATE_7_NOTE] = useState()
    const [GATE_7_INVERT, setGATE_7_INVERT] = useState(false)

    const [GATE_8_SOURCE, setGATE_8_SOURCE] = useState(NOTE_ON_OFF)
    const [GATE_8_NOTE, setGATE_8_NOTE] = useState()
    const [GATE_8_INVERT, setGATE_8_INVERT] = useState(false)
    
    const [calibrating, setCalibrating] = useState(false)
    const [calibrationPitch, setCalibrationPitch] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [modalText, setModaltext] = useState("")

    const [CAL_1_0, setCAL_1_0] = useState(0.002)
    const [CAL_1_1, setCAL_1_1] = useState(0.077)
    const [CAL_1_2, setCAL_1_2] = useState(1.074)
    const [CAL_1_3, setCAL_1_3] = useState(2.066)
    const [CAL_1_4, setCAL_1_4] = useState(3.061)
    const [CAL_1_5, setCAL_1_5] = useState(4.053)
    const [CAL_1_6, setCAL_1_6] = useState(4.877)
    const [CAL_2_0, setCAL_2_0] = useState(0.001)
    const [CAL_2_1, setCAL_2_1] = useState(0.084)
    const [CAL_2_2, setCAL_2_2] = useState(1.071)
    const [CAL_2_3, setCAL_2_3] = useState(2.065)
    const [CAL_2_4, setCAL_2_4] = useState(3.056)
    const [CAL_2_5, setCAL_2_5] = useState(4.047)
    const [CAL_2_6, setCAL_2_6] = useState(4.874)
    const [CAL_3_0, setCAL_3_0] = useState(0.022)
    const [CAL_3_1, setCAL_3_1] = useState(0.080)
    const [CAL_3_2, setCAL_3_2] = useState(1.067)
    const [CAL_3_3, setCAL_3_3] = useState(2.051)
    const [CAL_3_4, setCAL_3_4] = useState(3.037)
    const [CAL_3_5, setCAL_3_5] = useState(4.074)
    const [CAL_3_6, setCAL_3_6] = useState(5.148)

    const [midiChannel, setMidiChannel] = useState(0)
    const [mergeMidi, setMergeMidi] = useState(false)

    const state = {

        POLYPHONY_MODE, 
        CV_1_SOURCE, 
        CV_2_SOURCE, 
        CV_3_SOURCE, 
        CV_1_AND_2_MODE, 
        CV_1_AND_2_AND_3_MODE, 
        CV_1_SCALE,
        CV_2_SCALE, 
        CV_3_SCALE, 
        PITCH_BEND_RANGE, 
        CC1_COMMAND, 
        CC2_COMMAND, 
        CC3_COMMAND, 
        CLOCK_1_DIVIDER, 
        CLOCK_2_DIVIDER, 
        CLOCK_3_DIVIDER, 
        CLOCK_4_DIVIDER, 
        CLOCK_5_DIVIDER, 
        CLOCK_6_DIVIDER, 
        CLOCK_7_DIVIDER, 
        CLOCK_8_DIVIDER, 
        RESET_1_BEATS, 
        RESET_2_BEATS, 
        RESET_3_BEATS, 
        GATE_1_SOURCE, 
        GATE_1_NOTE,
        GATE_1_INVERT, 
        GATE_2_SOURCE, 
        GATE_2_NOTE, 
        GATE_2_INVERT, 
        GATE_3_SOURCE, 
        GATE_3_NOTE, 
        GATE_3_INVERT, 
        GATE_4_SOURCE, 
        GATE_4_NOTE, 
        GATE_4_INVERT, 
        GATE_5_SOURCE, 
        GATE_5_NOTE, 
        GATE_5_INVERT,
        GATE_6_SOURCE, 
        GATE_6_NOTE, 
        GATE_6_INVERT, 
        GATE_7_SOURCE, 
        GATE_7_NOTE, 
        GATE_7_INVERT, 
        GATE_8_SOURCE, 
        GATE_8_NOTE, 
        GATE_8_INVERT,
        midiChannel,
        mergeMidi,
        calibrating,
        calibrationPitch,
        showModal, 
        modalText, 
        CAL_1_0,
        CAL_1_1,
        CAL_1_2,
        CAL_1_3,
        CAL_1_4,
        CAL_1_5,
        CAL_1_6,
        CAL_2_0,
        CAL_2_1,
        CAL_2_2,
        CAL_2_3,
        CAL_2_4,
        CAL_2_5,
        CAL_2_6,
        CAL_3_0,
        CAL_3_1,
        CAL_3_2,
        CAL_3_3,
        CAL_3_4,
        CAL_3_5,
        CAL_3_6,
        setPOLYPHONY_MODE,
        setCV_1_SOURCE, 
        setCV_2_SOURCE, 
        setCV_3_SOURCE, 
        setCV_1_AND_2_MODE, 
        setCV_1_AND_2_AND_3_MODE, 
        setCV_1_SCALE,
        setCV_2_SCALE, 
        setCV_3_SCALE, 
        setPITCH_BEND_RANGE, 
        setCC1_COMMAND, 
        setCC2_COMMAND, 
        setCC3_COMMAND, 
        setCLOCK_1_DIVIDER, 
        setCLOCK_2_DIVIDER, 
        setCLOCK_3_DIVIDER, 
        setCLOCK_4_DIVIDER, 
        setCLOCK_5_DIVIDER, 
        setCLOCK_6_DIVIDER, 
        setCLOCK_7_DIVIDER, 
        setCLOCK_8_DIVIDER, 
        setRESET_1_BEATS, 
        setRESET_2_BEATS, 
        setRESET_3_BEATS, 
        setGATE_1_SOURCE, 
        setGATE_1_NOTE,
        setGATE_1_INVERT, 
        setGATE_2_SOURCE, 
        setGATE_2_NOTE, 
        setGATE_2_INVERT, 
        setGATE_3_SOURCE, 
        setGATE_3_NOTE, 
        setGATE_3_INVERT, 
        setGATE_4_SOURCE, 
        setGATE_4_NOTE, 
        setGATE_4_INVERT, 
        setGATE_5_SOURCE, 
        setGATE_5_NOTE, 
        setGATE_5_INVERT,
        setGATE_6_SOURCE, 
        setGATE_6_NOTE, 
        setGATE_6_INVERT, 
        setGATE_7_SOURCE, 
        setGATE_7_NOTE, 
        setGATE_7_INVERT, 
        setGATE_8_SOURCE, 
        setGATE_8_NOTE, 
        setGATE_8_INVERT,
        setMidiChannel,
        setMergeMidi,
        setCalibrating,
        setCalibrationPitch,
        setShowModal,
        setModaltext,
        setCAL_1_0,
        setCAL_1_1,
        setCAL_1_2,
        setCAL_1_3,
        setCAL_1_4,
        setCAL_1_5,
        setCAL_1_6,
        setCAL_2_0,
        setCAL_2_1,
        setCAL_2_2,
        setCAL_2_3,
        setCAL_2_4,
        setCAL_2_5,
        setCAL_2_6,
        setCAL_3_0,
        setCAL_3_1,
        setCAL_3_2,
        setCAL_3_3,
        setCAL_3_4,
        setCAL_3_5,
        setCAL_3_6,
    }

    return state
}

export const useMidi = (config) => {

    useEffect(()=>{
        initWebMidi()
    },[])

    const [midiAccess, setMidiAccess] = useState(null)
    const [midiOut, setMidiOut] = useState(null)
    const [connection, setConnection] = useState(null)
    const [initilized, setinitilized] = useState(false)

    const onMIDISuccess = useCallback(( midi ) => {
        console.log( "MIDI ready!" );
        // midiAccess = midi;  // store in the global (in real usage, would probably keep in an object instance)
        setMidiAccess(midi)
        const output = listInputsAndOutputs(midi);
        startMidi(midi, output)    
    }, [midiOut])

    function onMIDIFailure(msg) {
        console.log( "Failed to get MIDI access - " + msg );
    }

    const listInputsAndOutputs = useCallback( (midi)=> {
        var inputs = []
        for (var entry of midi.inputs) {
            var input = entry[1];
            inputs.push(input.name)
            console.log( "Input port [type:'" + input.type + "'] id:'" + input.id +
                "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
                "' version:'" + input.version + "'" 
            );
        }
        for (var entry of midi.outputs) {
            var output = entry[1];
            console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
            "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
            "' version:'" + output.version + "'" );
            if(output.name == "MIDI2CVBOY"){
            // if(output.name == "Seeeduino XIAO"){
                console.log("found UCB output, connecting")
                setMidiOut(output)
                return output
            }
            midiOut = output
        }
    },[midiOut])

    const onMIDIMessage = useCallback(( event )=> {
        var str = "MIDI message received at timestamp " + event.timeStamp + "[" + event.data.length + " bytes]: ";
        for (var i=0; i<event.data.length; i++) {
          str += "0x" + event.data[i].toString(16) + " ";
        }
        console.log( str );
        handleSysex(event.data)
    },[midiOut])

    const startMidi = useCallback((midi, output) => {
        midi.inputs.forEach(entry => {
            if(entry.name == "MIDI2CVBOY"){
            // if(entry.name == "Seeeduino XIAO"){
                console.log("found UCB input, connecting")
                entry.onmidimessage = onMIDIMessage
                entry.onstatechange = ({port}) => {
                    console.log("usb port state change: " + port.connection)
                    setConnection(port.connection)
                }
            }
        })
    }, [midiOut, config, setConnection])

    const initWebMidi = async () => {
        if(!navigator.requestMIDIAccess){
            // store.midiInputs = []
            console.log("MIDI Access forbidden - see WVR documentation to enable Web MIDI")
            return
        }
        try{
            navigator.requestMIDIAccess({sysex:true}).then( onMIDISuccess, onMIDIFailure )
        } catch (e){
            // store.midiInputs = []
            console.log("requestMIDIaccess Error " + e)
        }
    }

    const sendNoteOnOff = useCallback((note)=>{
        if(!midiOut)return
        sendNoteOn(note)
        setTimeout(()=>{
            sendNoteOff(note)
        },500)
    }, [midiOut, connection])

    const sendNoteOn = useCallback((note)=>{
        if(!midiOut)return
        console.log("send note on " + note)
        midiOut.send([0x90, note, 0x7f])
    }, [midiOut])
    
    const sendNoteOff = useCallback((note)=>{
        if(!midiOut)return
        console.log("send note off " + note)
        midiOut.send([0x80, note, 0x7f])
    }, [midiOut])
    
    const sendMidiRealtime = useCallback((code)=>{
        if(!midiOut)return

        midiOut.send([code])
    }, [midiOut])

    const handleSysex = useCallback((raw_data)=>{
        const [ head, id1, id2, id3, type, ...data] = raw_data
        if(
            (id1 != MANUFACTURER_ID_1) ||
            (id2 != MANUFACTURER_ID_2) ||
            (id3 != MANUFACTURER_ID_3)
        ){
            return console.log("got sysex from a different device")
        }
        if(type == SYSEX_TYPE_CONFIG){
            const len = data.length
            const checksum = data[len - 2] // last byte is tail, second last is checksum
            data.length = len - 2 // remove the last byte
            const check = getChecksum(data)
            if(checksum == check){
                console.log("checksum passed")
                setConfigFromArray(data, config)
            } else {
                console.log("checksum failed")
            }
        } else if(type == SYSEX_TYPE_ACK) {
            console.log("got SYSEX ACK")
            config.setModaltext("Success")
            setTimeout(()=>{
                config.setShowModal(false)
            },1000)
        } else {
            console.log("got unknown sysex type")
        }
    }, [config])

    const maybeShowError = useCallback((ms)=>{
        setTimeout(()=>{
            config.setShowModal(show=>{
                if(show){
                    config.setModaltext("failed")
                    setTimeout(()=>{
                        config.setShowModal(false)
                    },1000)
                }
                return show
            })
        }, ms)
    }, [config.showModal])

    const sendConfigSysex = useCallback(()=>{
        if(connection != "open")return alert("no UCB connected")

        config.setModaltext("sending sysex")
        config.setShowModal(true)
        maybeShowError(2000)
        const data = getConfigArray(config)
        const checksum = getChecksum(data)
        midiOut.send([
            0xf0, 
            MANUFACTURER_ID_1, 
            MANUFACTURER_ID_2, 
            MANUFACTURER_ID_3, 
            SYSEX_TYPE_CONFIG,
            ...data, 
            checksum,
            0xf7
        ])
    },[config, midiOut, connection])

    const sendSysexRequest = useCallback(()=>{
        if(connection != "open")return alert("no UCB connected")

        console.log("sending sysex request")
        midiOut.send([
            0xF0, 
            MANUFACTURER_ID_1, 
            MANUFACTURER_ID_2, 
            MANUFACTURER_ID_3, 
            SYSEX_TYPE_REQUEST_CONFIG,
            0xF7
        ])
    }, [midiOut, connection])

    const sendCalStart = useCallback(()=>{
        if(!midiOut)return

        console.log("sending cal mode start")
        midiOut.send([
            0xF0, 
            MANUFACTURER_ID_1, 
            MANUFACTURER_ID_2, 
            MANUFACTURER_ID_3, 
            SYSEX_TYPE_CAL_MODE_ON,
            0xF7
        ])
    }, [midiOut])

    const sendCalStop = useCallback(()=>{
        if(!midiOut)return

        console.log("sending cal mode stop")
        midiOut.send([
            0xF0, 
            MANUFACTURER_ID_1, 
            MANUFACTURER_ID_2, 
            MANUFACTURER_ID_3, 
            SYSEX_TYPE_CAL_MODE_OFF,
            0xF7
        ])
    }, [midiOut])

    useEffect(()=>{
        console.log("ya")
        if((connection == "open") && (initilized == false)){
            setinitilized(true)
            sendSysexRequest()
        }
    }, [connection, initilized])

    return {sendMidiRealtime, sendNoteOn, sendConfigSysex, sendSysexRequest, sendCalStart, sendCalStop, sendNoteOnOff, sendNoteOff}
}

export const setConfigFromArray = (data, store) => {
    store.setPOLYPHONY_MODE(              data[0])
    store.setCV_1_SOURCE(                 data[1]) 
    store.setCV_2_SOURCE(                 data[2]) 
    store.setCV_3_SOURCE(                 data[3]) 
    store.setCV_1_AND_2_MODE(             data[4]) 
    store.setCV_1_AND_2_AND_3_MODE(       data[5]) 
    store.setCV_1_SCALE(                  data[6])
    store.setCV_2_SCALE(                  data[7]) 
    store.setCV_3_SCALE(                  data[8]) 
    store.setPITCH_BEND_RANGE(            data[9]) 
    store.setCC1_COMMAND(                 data[10]) 
    store.setCC2_COMMAND(                 data[11]) 
    store.setCC3_COMMAND(                 data[12]) 
    store.setCLOCK_1_DIVIDER(             data[13]) 
    store.setCLOCK_2_DIVIDER(             data[14]) 
    store.setCLOCK_3_DIVIDER(             data[15]) 
    store.setCLOCK_4_DIVIDER(             data[16]) 
    store.setCLOCK_5_DIVIDER(             data[17]) 
    store.setCLOCK_6_DIVIDER(             data[18]) 
    store.setCLOCK_7_DIVIDER(             data[19]) 
    store.setCLOCK_8_DIVIDER(             data[20]) 
    store.setRESET_1_BEATS(               data[21]) 
    store.setRESET_2_BEATS(               data[22]) 
    store.setRESET_3_BEATS(               data[23]) 
    store.setGATE_1_SOURCE(               data[24]) 
    store.setGATE_1_NOTE(                 data[25])
    store.setGATE_1_INVERT(               data[26]) 
    store.setGATE_2_SOURCE(               data[27]) 
    store.setGATE_2_NOTE(                 data[28]) 
    store.setGATE_2_INVERT(               data[29]) 
    store.setGATE_3_SOURCE(               data[30]) 
    store.setGATE_3_NOTE(                 data[31]) 
    store.setGATE_3_INVERT(               data[32]) 
    store.setGATE_4_SOURCE(               data[33]) 
    store.setGATE_4_NOTE(                 data[34]) 
    store.setGATE_4_INVERT(               data[35]) 
    store.setGATE_5_SOURCE(               data[36]) 
    store.setGATE_5_NOTE(                 data[37]) 
    store.setGATE_5_INVERT(               data[38])
    store.setGATE_6_SOURCE(               data[39]) 
    store.setGATE_6_NOTE(                 data[40]) 
    store.setGATE_6_INVERT(               data[41]) 
    store.setGATE_7_SOURCE(               data[42]) 
    store.setGATE_7_NOTE(                 data[43]) 
    store.setGATE_7_INVERT(               data[44]) 
    store.setGATE_8_SOURCE(               data[45]) 
    store.setGATE_8_NOTE(                 data[46]) 
    store.setGATE_8_INVERT(               data[47])
    let i = 48
    store.setCAL_1_0(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_1_1(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_1_2(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_1_3(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_1_4(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_1_5(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_1_6(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_0(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_1(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_2(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_3(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_4(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_5(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_2_6(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_0(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_1(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_2(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_3(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_4(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_5(                     intArrayToFloat(data.slice(i, i+4)))
    i+=4
    store.setCAL_3_6(                     intArrayToFloat(data.slice(i, i+4)))
}

export const getConfigArray = store => {
    const data = [
        store.POLYPHONY_MODE, 
        store.CV_1_SOURCE, 
        store.CV_2_SOURCE, 
        store.CV_3_SOURCE, 
        store.CV_1_AND_2_MODE, 
        store.CV_1_AND_2_AND_3_MODE, 
        store.CV_1_SCALE,
        store.CV_2_SCALE, 
        store.CV_3_SCALE, 
        store.PITCH_BEND_RANGE, 
        store.CC1_COMMAND, 
        store.CC2_COMMAND, 
        store.CC3_COMMAND, 
        store.CLOCK_1_DIVIDER, 
        store.CLOCK_2_DIVIDER, 
        store.CLOCK_3_DIVIDER, 
        store.CLOCK_4_DIVIDER, 
        store.CLOCK_5_DIVIDER, 
        store.CLOCK_6_DIVIDER, 
        store.CLOCK_7_DIVIDER, 
        store.CLOCK_8_DIVIDER, 
        store.RESET_1_BEATS, 
        store.RESET_2_BEATS, 
        store.RESET_3_BEATS, 
        store.GATE_1_SOURCE, 
        store.GATE_1_NOTE,
        store.GATE_1_INVERT, 
        store.GATE_2_SOURCE, 
        store.GATE_2_NOTE, 
        store.GATE_2_INVERT, 
        store.GATE_3_SOURCE, 
        store.GATE_3_NOTE, 
        store.GATE_3_INVERT, 
        store.GATE_4_SOURCE, 
        store.GATE_4_NOTE, 
        store.GATE_4_INVERT, 
        store.GATE_5_SOURCE, 
        store.GATE_5_NOTE, 
        store.GATE_5_INVERT,
        store.GATE_6_SOURCE, 
        store.GATE_6_NOTE, 
        store.GATE_6_INVERT, 
        store.GATE_7_SOURCE, 
        store.GATE_7_NOTE, 
        store.GATE_7_INVERT, 
        store.GATE_8_SOURCE, 
        store.GATE_8_NOTE, 
        store.GATE_8_INVERT,
        ...floatToIntArray(store.CAL_1_0),
        ...floatToIntArray(store.CAL_1_1),
        ...floatToIntArray(store.CAL_1_2),
        ...floatToIntArray(store.CAL_1_3),
        ...floatToIntArray(store.CAL_1_4),
        ...floatToIntArray(store.CAL_1_5),
        ...floatToIntArray(store.CAL_1_6),
        ...floatToIntArray(store.CAL_2_0),
        ...floatToIntArray(store.CAL_2_1),
        ...floatToIntArray(store.CAL_2_2),
        ...floatToIntArray(store.CAL_2_3),
        ...floatToIntArray(store.CAL_2_4),
        ...floatToIntArray(store.CAL_2_5),
        ...floatToIntArray(store.CAL_2_6),
        ...floatToIntArray(store.CAL_3_0),
        ...floatToIntArray(store.CAL_3_1),
        ...floatToIntArray(store.CAL_3_2),
        ...floatToIntArray(store.CAL_3_3),
        ...floatToIntArray(store.CAL_3_4),
        ...floatToIntArray(store.CAL_3_5),
        ...floatToIntArray(store.CAL_3_6)
    ]
    return data
}

export const useMetronome = (sendMidiRealtime) => {
    const [metronome, setMetronome] = useState(false)
    const [blink, setBlink] = useState(true)
    const [tempo, setTempo] = useState(120)
    const count = useRef(0)
    const metronome_ref = useRef(false)
    const tempo_ref = useRef(120)

    const tick = useCallback(()=>{
        if(!metronome_ref.current) return
        count.current++
        sendMidiRealtime(MIDI_CLOCK)
        count.current = count.current == 24 ? 0 : count.current
        if(!(count.current % 12)){
            setBlink(b=>!b)
        }
        setTimeout(tick, 1000 / ( tempo_ref.current / 60 ) / 24)
    },[tempo, metronome, setBlink])

    useEffect(()=>{
        metronome_ref.current = metronome
        if(metronome){
            sendMidiRealtime(MIDI_START)
            tick()
        } else {
            sendMidiRealtime(MIDI_STOP)
        }
            
    }, [metronome])

    useEffect(()=>{
        tempo_ref.current = tempo
    }, [tempo])

    return {blink, setMetronome, tempo, setTempo}
}