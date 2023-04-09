
// return the float as an array representing each digit, or an error
export const floatToIntArray = f => {

    const val = f
    const arr = Array.from(val.toString())

    return [parseInt(arr[0]), parseInt(arr[2]), parseInt(arr[3]), parseInt(arr[4])]
}

export const intArrayToFloat = arr => {
    let out = 0
    out += (arr[0])
    out += (arr[1] * 0.1)
    out += (arr[2] * 0.01)
    out += (arr[3] * 0.001)
    return out
}

export const getChecksum = data => {
      let res = 0x7f;
      for(let i = 0; i < data.length; i++) {
        res ^= data[i];
      }
      return res;
}
