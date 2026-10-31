import type { Lang } from '../../shared/i18n/lang'

// Every English string on the EduBra page that is not in the project's content file: the device demo,
// the "How it works" story (its captions, controls and the words drawn in it) and "By the numbers".
// A string with {name} in it is a template, filled by fmt() (src/shared/i18n/runtime.ts).
const en = {
  device: {
    label: 'EduBra device demo',
    hint: 'Press the buttons, turn the knob on its side, or type your own word below.',
    word: 'The word {w} in Braille, shown one letter at a time',
    pause: 'Pause',
    play: 'Play',
    back: 'Back to the start of the word',
    faster: 'Faster',
    slower: 'Slower',
    // the volume knob's three steps: the word shown beside it and in its label
    volumes: { off: 'off', low: 'low', high: 'high' },
    volume: 'Volume: {name}',
    tryLabel: 'Try a word',
    tryHint: 'letters A–Z, up to 6',
    letter: 'Letter {ch}: dots {dots}',
  },
  story: {
    heading: 'How it works',
    // the four captions: a title and one sentence each
    caps: [
      { title: 'Send a file', text: 'Drop in a .txt, .docx or .pdf. Song lyrics, an article, anything.' },
      { title: 'Over Wi-Fi', text: 'The page splits it into words and sends them to the Raspberry Pi inside the box.' },
      { title: 'Audio first', text: "Before reading, the Pi prepares a voice file for every word, so it doesn't stall mid-sentence." },
      { title: 'Read', text: 'It says the word, then each letter, raising the pins as it goes.' },
    ],
    steps: 'Steps',
    goStep: 'Go to step {n}: {title}',
    stepLive: 'Step {n}, {title}. {text}',
    pause: 'Pause',
    pauseLabel: 'Pause the drawing',
    again: 'Play again',
    againLabel: 'Play the story again',
    play: 'Play',
    playLabel: 'Play the story',
    sound: 'Sound',
    hint: 'Tap a part of the hardware to see what it does, or turn on the sound.',
    frame: 'Drawing, scrolls sideways',
    canvas:
      'A file is uploaded to a web page, split into words and sent over Wi-Fi to a Raspberry Pi. The Pi prepares a voice file for each word, then reads the text: it says each word, then each letter, while six pins rise to form the letter in Braille.',
    // a callout's component and its one-line label
    parts: [
      { id: 'gpio', name: 'GPIO header', text: 'Drives the six servos' },
      { id: 'jack', name: 'Audio jack', text: 'Out to your headphones or speaker' },
      { id: 'led', name: 'Green LED', text: 'Blinks while the Pi works' },
      { id: 'soc', name: 'Processor', text: 'Runs the reading loop' },
      { id: 'cell', name: 'Braille cell', text: 'Six pins, one per servo' },
      { id: 'spk', name: 'Headphones or speaker', text: 'Says each word, then each letter' },
    ],
    // The drawing. `word` is the demo text: two words, a to z only. The chips' widths are drawn to fit them.
    word: 'hello world',
    file: 'hello.txt',
    chipWidths: [68, 72],
    drop: 'drop a file',
    run: 'Run',
    interval: 'interval  0.5 s',
    bank: 'a.mp3 … z.mp3  made in advance',
    servos: 'six servos',
    speaker: 'your headphones or speaker',
    reading: 'reading',
  },
  numbers: {
    heading: 'By the numbers',
    labels: [
      'how far each pin rises, measured with a caliper',
      'servos under the lid, one per dot',
      'per letter at full speed. Each pin adds about 0.2 s; the voice takes the rest.',
      'servos we burned on the way there',
    ],
    voice: 'voice',
    pins: 'pins',
  },
}

export const text: Record<Lang, typeof en> = { en, pt: en }
