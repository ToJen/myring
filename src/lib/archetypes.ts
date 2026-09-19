import type { Ring } from './types'

/** Archetype names keyed primary ring → secondary ring. Shared by the game engine and the social card generator. */
export const ARCHETYPE: Record<Ring, Partial<Record<Ring, string>>> = {
  green: { yellow: 'The Sentinel', red: 'The Warlord', orange: 'The Empire Builder', blue: 'The Architect', indigo: 'The Guardian', violet: 'The Oath-Keeper' },
  yellow: { green: 'The Strategist', red: 'The Executioner', orange: 'The Keeper of Exits', blue: 'The Survivor', indigo: 'The Watchful Healer', violet: 'The Protector' },
  red: { green: 'The Juggernaut', yellow: 'The Cornered Animal', orange: 'The Conqueror', blue: 'The Avenger', indigo: 'The Wounded Shield', violet: 'The Furious Heart' },
  orange: { green: 'The Magnate', yellow: 'The Collector', red: 'The Raider', blue: 'The Gambler', indigo: 'The Patron', violet: 'The Possessive Flame' },
  blue: { green: 'The Vanguard', yellow: 'The Cautious Dreamer', red: 'The Rebel', orange: 'The Prospector', indigo: 'The Beacon', violet: 'The Believer' },
  indigo: { green: 'The Steady Hand', yellow: 'The Quiet Mender', red: 'The Broken Healer', orange: 'The Benefactor', blue: 'The Lantern', violet: 'The Open Heart' },
  violet: { green: 'The Devoted Blade', yellow: 'The Keeper', red: 'The Star-Crossed', orange: 'The Jealous Heart', blue: 'The Romantic', indigo: 'The Whole Heart' },
}

/** Public site root used in absolute Open Graph URLs. */
export const SITE = 'https://tojen.github.io/myring'
