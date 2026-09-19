import { ARCHETYPE } from './archetypes'
import { RINGS, RING_FORCE, ZERO_SCORES, identityLine } from './rings'
import { classify } from './classify'
import type { Option, Result, Ring, Trial } from './types'

// Weight vectors are in RINGS order: green, yellow, red, orange, blue, indigo, violet.
const opt = (text: string, weights: number[]): Option => ({ text, weights })

/** Trial I: five options that spread weight across all seven rings. */
const OPENERS: Trial[] = [
  {
    title: 'TRIAL I · LOSS',
    scenario:
      'You spend three years building something that matters to you. The week before it finally goes public, a single mistake, not yours, erases most of it. The people who could fix it are gone. Nobody is watching. Nobody would blame you for walking away.',
    question: 'What do you do in the first hour?',
    options: [
      opt('Start rebuilding tonight. It was never about the version. It was about finishing.', [5, 0, 0, 1, 2, 0, 1]),
      opt('Find out exactly who made the mistake and make sure they never forget it.', [0, 1, 5, 2, 0, 0, 0]),
      opt('Sit with it. Then call the people who believed in it and tell them it is not over.', [0, 0, 0, 0, 5, 2, 2]),
      opt('Quietly walk away and never put yourself in a position to lose like that again.', [0, 5, 0, 1, 0, 1, 0]),
      opt('Work out what can be salvaged and sold. Something has to come out of this.', [2, 0, 1, 5, 0, 0, 0]),
    ],
  },
  {
    title: 'TRIAL I · BETRAYAL',
    scenario:
      'Someone you trusted completely has been quietly working against you for months. You find out by accident, from a message they never meant you to see. They do not know you know. Tomorrow you will be in a room with them, and they will smile at you.',
    question: 'What happens in that room?',
    options: [
      opt('Confront them in front of everyone. Let the room see what they are.', [1, 0, 5, 1, 0, 0, 0]),
      opt('Say nothing. Cut them out of every plan and let them notice too late.', [0, 3, 1, 3, 0, 0, 0]),
      opt('Ask them why. Somewhere in there is a person who was afraid of something.', [0, 0, 0, 0, 1, 5, 1]),
      opt('Smile back. Then tell them plainly that you know, and that it changes nothing about what you will do next.', [5, 0, 0, 0, 1, 0, 1]),
      opt('Grieve it. You loved this person, and that was real even if they were not.', [0, 0, 0, 0, 2, 1, 5]),
    ],
  },
  {
    title: 'TRIAL I · THE OFFER',
    scenario:
      'A stranger offers you exactly what you have wanted for years. No catch you can see. The only condition is that you decide before you leave the room, and you can never tell anyone how you got it.',
    question: 'What do you say?',
    options: [
      opt('Yes. And the people who doubted me get to watch.', [0, 0, 2, 4, 0, 0, 0]),
      opt('No. Anything I cannot say out loud is not mine.', [4, 1, 0, 0, 1, 1, 0]),
      opt('First tell me what happens to the people I cannot tell.', [0, 0, 0, 0, 0, 4, 3]),
      opt('Not yet. Something this good has a trap in it, and I would rather find it than fall into it.', [1, 5, 0, 1, 0, 0, 0]),
      opt('Yes. And I will use it to build the thing nobody thought I could.', [2, 0, 0, 1, 4, 0, 0]),
    ],
  },
]

/**
 * Trials II and III carry one option per ring. Only options whose dominant ring
 * is still in play are shown, so the player sees 5 options, then 3.
 */
const SECOND: Trial[] = [
  {
    title: 'TRIAL II · THE FALL',
    scenario:
      'Someone you are responsible for makes a mistake in public that costs everyone. Whispers, the whole room turning. They look at you.',
    question: 'What do you do?',
    options: [
      opt('Step in front of them and take the room. This is what being in charge means.', [5, 0, 0, 0, 1, 1, 0]),
      opt('Get them out of there before it gets worse. Damage control first, questions later.', [0, 5, 0, 1, 0, 1, 0]),
      opt('Let them feel it. Then find whoever set them up to fail.', [0, 0, 5, 0, 0, 0, 1]),
      opt('Distance yourself. Your name still matters more than theirs tonight.', [0, 1, 0, 5, 0, 0, 0]),
      opt('Tell the room it is recoverable, and mean it. It always is.', [1, 0, 0, 0, 5, 1, 0]),
      opt('Cross the room and stand next to them. Say nothing. Just be there.', [0, 0, 0, 0, 1, 5, 1]),
      opt('Go to them first. The room can wait. They cannot.', [0, 0, 0, 0, 0, 1, 5]),
    ],
  },
  {
    title: 'TRIAL II · THE DOOR',
    scenario:
      'It is 3am. A knock. Someone you barely know is on the other side, in trouble, asking for something you cannot easily give.',
    question: 'What do you do?',
    options: [
      opt('Open it. Decide what you can do once you have seen their face.', [5, 0, 0, 0, 1, 1, 0]),
      opt('Talk through the door. Find out what you are dealing with first.', [0, 5, 0, 1, 0, 0, 0]),
      opt('Open it ready. If someone put them there, they will answer for it.', [0, 0, 5, 0, 0, 1, 0]),
      opt('Ask what it is worth to them. Nobody knocks at 3am for free.', [0, 1, 0, 5, 0, 0, 0]),
      opt('Let them in. Tonight is bad. Tomorrow does not have to be.', [0, 0, 0, 0, 5, 1, 1]),
      opt('Let them in, put the kettle on, and let them talk until they stop shaking.', [0, 0, 0, 0, 1, 5, 1]),
      opt('Let them in without a second thought. Once they are yours, they are yours.', [0, 0, 0, 0, 0, 1, 5]),
    ],
  },
  {
    title: 'TRIAL II · THE LAST WORD',
    scenario:
      'You have one chance to say something to a person who hurt you deeply. They are leaving, and you will never see them again.',
    question: 'What do you say?',
    options: [
      opt('"I am still here. You did not stop me."', [5, 0, 1, 0, 1, 0, 0]),
      opt('Nothing. Some doors are safer closed.', [0, 5, 0, 0, 0, 1, 0]),
      opt('"You will remember this longer than I will."', [0, 0, 5, 1, 0, 0, 0]),
      opt('"You owe me. One day I will collect."', [0, 0, 1, 5, 0, 0, 0]),
      opt('"I hope you find whatever you were looking for."', [0, 0, 0, 0, 5, 1, 0]),
      opt('"I know why you did it. I am sorry you had to."', [0, 0, 0, 0, 1, 5, 1]),
      opt('"I loved you. That part was never a lie."', [0, 0, 0, 0, 0, 1, 5]),
    ],
  },
]

const FINAL: Trial[] = [
  {
    title: 'TRIAL III · THE LINE',
    scenario:
      'Everything you have built is on one side of a line. Everyone you care about is on the other. You can only cross once.',
    question: 'Which way do you go?',
    options: [
      opt('Pick up what you built and carry it across to them. You refuse the terms.', [5, 0, 0, 0, 1, 0, 1]),
      opt('Stay where you are. Whatever is on the other side, you cannot unsee it.', [0, 5, 0, 0, 0, 0, 0]),
      opt('Burn the line. Then nobody gets to make you choose.', [0, 0, 5, 0, 0, 0, 0]),
      opt('Cross to what you built. People come and go. This is yours.', [0, 0, 0, 5, 0, 0, 0]),
      opt('Cross to them. You can build again, and next time they will help.', [1, 0, 0, 0, 5, 0, 1]),
      opt('Cross to them, and look back only to make sure nobody is left behind.', [0, 0, 0, 0, 1, 5, 1]),
      opt('Cross to them without looking back. There was never a choice.', [0, 0, 0, 0, 0, 1, 5]),
    ],
  },
  {
    title: 'TRIAL III · THE MIRROR',
    scenario: 'Late at night. No audience. Honestly.',
    question: 'What is the thing you cannot stop being, even when it costs you?',
    options: [
      opt('Stubborn. When I decide, I do not stop.', [5, 0, 1, 0, 0, 0, 0]),
      opt('Careful. I see the exit before I see the room.', [0, 5, 0, 1, 0, 0, 0]),
      opt('Angry. Some things should never be forgiven.', [0, 0, 5, 0, 0, 0, 1]),
      opt('Hungry. Enough has never once been enough.', [0, 0, 1, 5, 0, 0, 0]),
      opt('Hopeful. I keep believing it gets better.', [0, 0, 0, 0, 5, 1, 0]),
      opt('Soft. Other people’s pain lands on me.', [0, 0, 0, 0, 0, 5, 1]),
      opt('Devoted. When I love, I go all the way.', [0, 0, 0, 0, 0, 1, 5]),
    ],
  },
  {
    title: 'TRIAL III · THE GIFT',
    scenario: 'Someone hands you a ring that will make you more of what you already are. Forever.',
    question: 'What do you do with it?',
    options: [
      opt('Put it on. I know exactly what I will do with it.', [5, 0, 0, 0, 1, 0, 0]),
      opt('Put it in a drawer. Power like that should be earned slowly.', [0, 5, 0, 0, 0, 1, 0]),
      opt('Put it on and go find the people who deserve what is coming.', [0, 0, 5, 1, 0, 0, 0]),
      opt('Put it on and never take it off. It is mine now.', [0, 0, 0, 5, 0, 0, 0]),
      opt('Put it on and go where it is darkest. That is where it is needed.', [1, 0, 0, 0, 5, 1, 0]),
      opt('Put it on and go looking for whoever is hurting most.', [0, 0, 0, 0, 1, 5, 1]),
      opt('Put it on and go home. There is someone who needs to see this first.', [0, 0, 0, 0, 0, 1, 5]),
    ],
  },
]

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

export function openingTrial(): Trial {
  return pick(OPENERS)
}

function dominant(o: Option): Ring {
  let best = 0
  o.weights.forEach((w, i) => {
    if (w > o.weights[best]) best = i
  })
  return RINGS[best]
}

/** Next trial, with options narrowed to the rings still in play. */
export function nextTrial(stage: 2 | 3, remaining: Ring[]): Trial {
  const base = pick(stage === 2 ? SECOND : FINAL)
  return { ...base, options: base.options.filter((o) => remaining.includes(dominant(o))) }
}

export function tally(trials: Trial[]): Record<Ring, number> {
  const scores = { ...ZERO_SCORES }
  for (const t of trials) {
    if (t.choice === undefined) continue
    t.options[t.choice].weights.forEach((w, i) => {
      scores[RINGS[i]] += w
    })
  }
  return scores
}

/** Order rings by score, highest first, with a stable tie-break that varies by play. */
function ranked(scores: Record<Ring, number>, rings: Ring[], salt: number): Ring[] {
  const rotated = [...RINGS.slice(salt % 7), ...RINGS.slice(0, salt % 7)]
  return [...rings].sort((a, b) => scores[b] - scores[a] || rotated.indexOf(a) - rotated.indexOf(b))
}

function salt(trials: Trial[]): number {
  return trials.reduce((n, t) => n * 7 + (t.choice ?? 0) + 1, 0)
}

/** The two rings losing interest after this trial. */
export function eliminate(trials: Trial[], remaining: Ring[]): Ring[] {
  const order = ranked(tally(trials), remaining, salt(trials))
  return order.slice(-2)
}

/** Convert raw weights into the displayed spectrum. Primary lands between 76 and 97. */
function toSpectrum(scores: Record<Ring, number>, order: Ring[]): Record<Ring, number> {
  const max = scores[order[0]] || 1
  const second = scores[order[1]] ?? 0
  const primaryPct = Math.min(97, 76 + 3 * (max - second))
  const out = { ...ZERO_SCORES }
  for (const r of RINGS) out[r] = Math.round((primaryPct * scores[r]) / max)
  return out
}

export function finalResult(trials: Trial[]): Result {
  const scores = tally(trials)
  const order = ranked(scores, RINGS, salt(trials))
  const primary = order[0]
  const secondary = order[1]
  const spectrum = toSpectrum(scores, order)
  const archetype = ARCHETYPE[primary][secondary] ?? `The ${RING_FORCE[primary]} Bearer`
  return {
    primary,
    primary_force: RING_FORCE[primary],
    primary_score: spectrum[primary],
    secondary,
    secondary_force: RING_FORCE[secondary],
    secondary_score: spectrum[secondary],
    archetype,
    summary: SUMMARY[primary],
    secondary_summary: SECONDARY_SUMMARY[secondary],
    evidence: trials.filter((t) => t.choice !== undefined).map((t) => t.options[t.choice!].text),
    identity: identityLine(primary, secondary),
    spectrum,
    classification: classify(spectrum, primary, secondary),
  }
}

const SUMMARY: Record<Ring, string> = {
  green:
    'When everything falls apart, you get to work. You do not wait for permission, rescue, or the right moment. Your answers kept choosing the hard, direct thing, and choosing it without drama.',
  yellow:
    'You see the trap before anyone else walks into it. Your answers kept the exits open and the damage contained. That caution is not weakness. It is what keeps the people around you alive.',
  red: 'Something in you refuses to let a wrong go unanswered. Your answers ran hot and honest, and they never once pretended the hurt was fine. Rage like yours is fuel. The question is what you point it at.',
  orange:
    'You know what things are worth, and you refuse to leave value on the table. Your answers kept score when others were pretending not to. Wanting more is not a flaw. Forgetting why you wanted it is.',
  blue: 'You keep believing it gets better, and you say so out loud when nobody else will. Your answers reached for tomorrow every time. Hope like yours is contagious, and the room knows it.',
  indigo:
    'Other people’s pain lands on you, and you go toward it instead of away. Your answers kept asking about the person nobody else was looking at. That is rarer than it should be.',
  violet:
    'When you love, you go all the way. Your answers put people before plans, before pride, before safety. Every time. That kind of devotion is a force. It can also be a blind spot.',
}

const SECONDARY_SUMMARY: Record<Ring, string> = {
  green: 'Underneath it, there is a spine. When it matters, you follow through.',
  yellow: 'Underneath it, you are watching the exits. You feel the risk before you act on it.',
  red: 'Underneath it, there is heat. Cross a line and it shows.',
  orange: 'Underneath it, you keep score. You know what you are owed.',
  blue: 'Underneath it, you believe. Even on the worst day, you think tomorrow is coming.',
  indigo: 'Underneath it, you feel other people. Their weight becomes yours.',
  violet: 'Underneath it, you are devoted. Someone, somewhere, comes first.',
}
