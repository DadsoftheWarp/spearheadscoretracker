// Named Spearhead forces per faction (official GW warband names)
export const spearheads = {
  // Order
  'Cities of Sigmar': ['Castelite Company', 'Fusil-Platoon'],
  'Daughters of Khaine': ['Heartflayer Troupe'],
  Fyreslayers: ['Saga Axeband'],
  'Idoneth Deepkin': ['Akhelian Tide Guard', 'Soulraid Hunt'],
  'Kharadron Overlords': ['Grundstok Trailblazers', 'Skyhammer Task Force'],
  'Lumineth Realm-lords': ['Glittering Phalanx', 'Hurakan Vangaurd'],
  Seraphon: ['Starscale Warhost', 'Sunblooded Prowlers'],
  'Stormcast Eternals': ['Vigilant Brotherhood', "Yndrasta's Spearhead"],
  Sylvaneth: ['Bitterbark Copse', 'Spitewing Flight'],
  // Chaos
  'Blades of Khorne': ['Bloodbound Gore Pilgrims', 'Fangs of the Blood God'],
  'Disciples of Tzeentch': ['Fluxblade Coven', 'Tzaangor Warflock'],
  'Hedonites of Slaanesh': ['Blades of the Lurid Dream'],
  'Helsmiths of Hashut': ['Helforge Host'],
  'Maggotkin of Nurgle': ['Bleak Host', 'Bubonic Cell'],
  Skaven: ['Gnawfeast Clawpack', 'Warpspark Clawpack'],
  'Slaves to Darkness': ['Darkoath Raiders', 'Bloodwind Legion'],
  // Death
  'Flesh-eater Courts': ['Carrion Retainers', 'Charnel Watch'],
  Nighthaunt: ['Cursed Shacklehorde', 'Slasher Host'],
  'Ossiarch Bonereapers': [
    'Mortisan Elite',
    'Kavalos Vanguard',
    'Tithe-Reaper Echelon',
  ],
  'Soulblight Gravelords': ['Deathrattle Tomb Host', 'Bloodcrave Hunt'],
  // Destruction
  'Gloomspite Gitz': ['Bad Moon Madmob', 'Snarlpack Huntaz'],
  'Orruk Warclans': ['Ironjawz Bigmob', 'Swampskulla Gang'],
  'Ogor Mawtribes': ["Tyrant's Bellow", 'Scrapglutt'],
  'Sons of Behemat': ['Wallsmasher Stomp'],
};

export const factions = {
  Order: [
    'Cities of Sigmar',
    'Daughters of Khaine',
    'Fyreslayers',
    'Idoneth Deepkin',
    'Kharadron Overlords',
    'Lumineth Realm-lords',
    'Seraphon',
    'Stormcast Eternals',
    'Sylvaneth',
  ],
  Chaos: [
    'Blades of Khorne',
    'Disciples of Tzeentch',
    'Hedonites of Slaanesh',
    'Helsmiths of Hashut',
    'Maggotkin of Nurgle',
    'Skaven',
    'Slaves to Darkness',
  ],
  Death: [
    'Flesh-eater Courts',
    'Nighthaunt',
    'Ossiarch Bonereapers',
    'Soulblight Gravelords',
  ],
  Destruction: [
    'Gloomspite Gitz',
    'Ogor Mawtribes',
    'Orruk Warclans',
    'Sons of Behemat',
  ],
};

export const alliances = Object.keys(factions);

export function getAllianceForFaction(factionName) {
  for (const [alliance, list] of Object.entries(factions)) {
    if (list.includes(factionName)) return alliance;
  }
  return null;
}

// Unit rosters for each named Spearhead team.
// general = the team's leader/hero; units = remaining warscrolls in the force.
export const rosters = {
  // ── Order ───────────────────────────────────────────────────
  'Castelite Company': {
    general: 'Knight of the Empty Throne',
    units: [
      'Freeguild Steelhelms',
      'Freeguild Steelhelms',
      'Freeguild Cavaliers',
    ],
  },
  'Fusil-Platoon': {
    general: 'Cogsmith',
    units: [
      'Freeguild Fusiliers',
      'Freeguild Fusiliers',
      'Ironweld Great Cannon',
    ],
  },
  'Heartflayer Troupe': {
    general: 'Slaughter Queen',
    units: ['Witch Aelves', 'Blood Sisters', 'Khinerai Heartrenders'],
  },
  'Saga Axeband': {
    general: 'Auric Runemaster',
    units: [
      'Hearthguard Berzerkers',
      'Vulkite Berzerkers',
      'Vulkite Berzerkers',
    ],
  },
  'Akhelian Tide Guard': {
    general: 'Akhelian King',
    units: ['Namarti Thralls', 'Akhelian Morrsarr Guard', 'Namarti Reavers'],
  },
  'Soulraid Hunt': {
    general: 'Soulscryer',
    units: ['Namarti Reavers', 'Namarti Thralls', 'Akhelian Allopexes'],
  },
  'Grundstok Trailblazers': {
    general: 'Aether-Khemist',
    units: ['Arkanaut Company', 'Grundstok Thunderers', 'Grundstok Gunhauler'],
  },
  'Skyhammer Task Force': {
    general: 'Endrinmaster with Dirigible Suit',
    units: ['Arkanaut Company', 'Grundstok Thunderers', 'Arkanaut Frigate'],
  },
  'Glittering Phalanx': {
    general: 'Scinari Cathallar',
    units: [
      'Vanari Auralan Wardens',
      'Vanari Auralan Sentinels',
      'Vanari Bladelords',
    ],
  },
  'Hurakan Vanguard': {
    general: 'Hurakan Windmage',
    units: [
      'Hurakan Windchargers',
      'Hurakan Windchargers',
      'Vanari Auralan Sentinels',
    ],
  },
  'Starscale Warhost': {
    general: 'Saurus Scar-Veteran on Cold One',
    units: ['Saurus Warriors', 'Saurus Knights', 'Aggradon Lancers'],
  },
  'Sunblood Prowlers': {
    general: 'Skink Starseer',
    units: ['Skinks', 'Skinks', 'Ripperdactyl Riders'],
  },
  'Vigilant Brotherhood': {
    general: 'Lord-Relictor',
    units: ['Vindictors', 'Vindictors', 'Praetors', 'Annihilators'],
  },
  "Yndrasta's Spearhead": {
    general: 'Yndrasta, the Celestial Spear',
    units: ['Gryph-Hounds', 'Praetors', 'Knight-Arcanum'],
  },
  'Bitterbark Copse': {
    general: 'Treelord Ancient',
    units: ['Dryads', 'Tree-Revenants', 'Kurnoth Hunters'],
  },
  'Spitewing Flight': {
    general: 'Arch-Revenant',
    units: ['Spiterider Lancers', 'Spiterider Lancers', 'Gossamid Archers'],
  },
  // ── Chaos ───────────────────────────────────────────────────
  'Bloodbound Gore Pilgrims': {
    general: 'Bloodsecrator',
    units: ['Bloodreavers', 'Blood Warriors', 'Khorgoraths'],
  },
  'Fangs of the Blood God': {
    general: 'Skullgrinder',
    units: ['Wrathmongers', 'Bloodcrushers', 'Skull Cannon'],
  },
  'Fluxblade Coven': {
    general: 'Curseling, Eye of Tzeentch',
    units: ['Kairic Acolytes', 'Tzaangors', 'Flamers of Tzeentch'],
  },
  'Tzaangor Warflock': {
    general: 'Tzaangor Shaman',
    units: [
      'Tzaangors',
      'Tzaangor Enlightened on Disc',
      'Screamers of Tzeentch',
    ],
  },
  'Blades of the Lurid Dream': {
    general: 'Shardspeaker of Slaanesh',
    units: ['Blissbarb Archers', 'Symbaresh Twinsouls', 'Slickblade Seekers'],
  },
  'Bleak Host': {
    general: 'Harbinger of Decay',
    units: ['Putrid Blightkings', 'Putrid Blightkings', 'Rotmire Creed'],
  },
  'Bubonic Cell': {
    general: 'Poxbringer, Herald of Nurgle',
    units: ['Plaguebearers', 'Plague Drones', 'Beasts of Nurgle'],
  },
  'Gnawfeast Clawpack': {
    general: 'Grey Seer',
    units: ['Clanrats', 'Clanrats', 'Rat Ogors', 'Warp Lightning Cannon'],
  },
  'Warpspark Clawpack': {
    general: 'Warlock Engineer',
    units: ['Stormfiends', 'Warplock Jezzails', 'Clanrats'],
  },
  'Darkoath Raiders': {
    general: 'Darkoath Chieftain on Warsteed',
    units: ['Darkoath Marauders', 'Darkoath Marauders', 'Chaos Knights'],
  },
  'Bloodwind Legion': {
    general: 'Chaos Lord on Karkadrak',
    units: ['Chaos Warriors', 'Chaos Knights', 'Varanguard'],
  },
  // ── Death ───────────────────────────────────────────────────
  'Carrion Retainers': {
    general: 'Abhorrant Archregent',
    units: ['Crypt Ghouls', 'Crypt Flayers', 'Crypt Horrors'],
  },
  'Charnel Watch': {
    general: 'Abhorrant Ghoul King',
    units: ['Crypt Ghouls', 'Crypt Horrors', 'Royal Terrorgheist'],
  },
  'Cursed Shacklehorde': {
    general: 'Knight of Shrouds on Ethereal Steed',
    units: ['Chainrasps', 'Bladegheist Revenants', 'Grimghast Reapers'],
  },
  'Slasher Host': {
    general: 'Guardian of Souls',
    units: ['Hexwraiths', 'Craventhrone Guard', 'Chainrasps'],
  },
  'Mortisan Elite': {
    general: 'Mortisan Soulmason',
    units: ['Mortek Guard', 'Necropolis Stalkers', 'Gothizzar Harvester'],
  },
  'Kavalos Vanguard': {
    general: 'Liege-Kavalos',
    units: ['Kavalos Deathriders', 'Kavalos Deathriders', 'Mortek Guard'],
  },
  'Tith-Reaper Echelon': {
    general: 'Mortisan Ossifector',
    units: ['Mortek Guard', 'Gothizzar Harvester', 'Morghast Archai'],
  },
  'Deathrattle Tomb Host': {
    general: 'Wight King on Skeletal Steed',
    units: ['Deathrattle Skeletons', 'Grave Guard', 'Black Knights'],
  },
  'Bloodcrave Hunt': {
    general: 'Vampire Lord',
    units: ['Deathrattle Skeletons', 'Blood Knights', 'Fell Bats'],
  },
  // ── Destruction ─────────────────────────────────────────────
  'Bad Moon Madmob': {
    general: 'Squigboss with Gnasha-squig',
    units: ['Squig Hoppers', 'Boingrot Bounderz', 'Squig Herd'],
  },
  'Snarlpack Huntaz': {
    general: 'Loonboss on Mangler Squigs',
    units: ['Sneaky Snufflers', 'Fellwater Troggoths', 'Spider Riders'],
  },
  'Ironjawz Bigmob': {
    general: 'Megaboss on Maw-Krusha',
    units: ['Ardboyz', 'Brutes', 'Gore-gruntas'],
  },
  'Swampskulka Gang': {
    general: 'Killaboss on Corpse-rippa Vulcha',
    units: ['Gutrippaz', 'Man-skewer Boltboyz', 'Hobgrot Slittaz'],
  },
  "Tyrant's Bellow": {
    general: 'Tyrant',
    units: ['Ironguts', 'Leadbelchers', 'Gluttons'],
  },
  Scrapglutt: {
    general: 'Slaughtermaster',
    units: ['Gluttons', 'Ironblaster', 'Gnoblars'],
  },
  'Wallsmasher Stomp': {
    general: 'Gatebreaker Mega-Gargant',
    units: ['Mancrusher Gargants', 'Mancrusher Gargants'],
  },
};

// Returns the parent faction for a named spearhead team, or null if the name is itself a faction.
export function getFactionForTeam(teamName) {
  for (const [faction, teams] of Object.entries(spearheads)) {
    if (teams.includes(teamName)) return faction;
  }
  return null;
}
