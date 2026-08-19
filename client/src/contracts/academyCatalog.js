import marvelWeblaunch from '../assets/shop/marvel-weblaunch.png'
import universeImg from '../assets/img/xsolla-universe-landing.webp'
import verseBanner from '../assets/shop/verse-banner.png'
import cookingCover from '../assets/shop/cooking-cover.jpg'

export const ACADEMY_LINKS = {
  home: 'https://xsolla.com/',
  art: 'https://xsolla.com/game-services/art/',
  development: 'https://xsolla.com/game-services/development/',
  qa: 'https://xsolla.com/game-services/quality-assurance/',
  localization: 'https://xsolla.com/game-services/localization/',
  engagement: 'https://xsolla.com/game-services/player-engagement/',
  contact: 'https://xsolla.com/contact-us/',
}

export const ACADEMY_TRACKS = [
  {
    id: 'play',
    quest: 'academyPlay',
    image: marvelWeblaunch,
    steps: 3,
    jump: 'hub',
  },
  {
    id: 'economy',
    quest: 'academyEco',
    image: universeImg,
    steps: 3,
    jump: 'profile',
  },
  {
    id: 'playtest',
    quest: 'academyTest',
    image: verseBanner,
    steps: 3,
    jump: 'playtest',
  },
  {
    id: 'studio',
    quest: 'academyStudio',
    image: cookingCover,
    steps: 4,
    jump: 'contact',
  },
]

export const ACADEMY_SERVICES = [
  { id: 'art', href: ACADEMY_LINKS.art },
  { id: 'dev', href: ACADEMY_LINKS.development },
  { id: 'qa', href: ACADEMY_LINKS.qa },
  { id: 'loc', href: ACADEMY_LINKS.localization },
  { id: 'engage', href: ACADEMY_LINKS.engagement },
]

export const ACADEMY_STATS = [
  { id: 'titles', num: '3,000+' },
  { id: 'clients', num: '250+' },
  { id: 'downloads', num: '30B+' },
  { id: 'studios', num: '8' },
]
