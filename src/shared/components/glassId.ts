// One counter for the whole build, so every <Glass /> gets its own gradient id.
let n = 0
export const glassId = () => `glass-${++n}`
