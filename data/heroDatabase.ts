
import { HeroTemplate } from '../types';

export const HERO_DATABASE: HeroTemplate[] = [
    {
        id: 'hawkeye',
        defaultName: 'Clint Barton',
        defaultClass: 'SCOUT',
        defaultStats: { strength: 6, agility: 9, intellect: 6 },
        imageUrl: 'https://i.pinimg.com/736x/e6/79/1b/e6791b4527960309995c653f8202476d.jpg'
    },
    {
        id: 'lukecage',
        defaultName: 'Carl Lucas',
        defaultClass: 'BRAWLER',
        defaultStats: { strength: 10, agility: 6, intellect: 5 },
        imageUrl: 'https://i.pinimg.com/736x/a2/22/e0/a222e0322237894a4f891b979505869d.jpg'
    },
    {
        id: 'daredevil',
        defaultName: 'Matt Murdock',
        defaultClass: 'BRAWLER',
        defaultStats: { strength: 7, agility: 9, intellect: 8 },
        imageUrl: 'https://i.pinimg.com/736x/8d/8a/80/8d8a8027773206037775537505372336.jpg'
    },
    {
        id: 'thor',
        defaultName: 'Thor Odinson',
        defaultClass: 'BLASTER',
        defaultStats: { strength: 10, agility: 6, intellect: 6 },
        imageUrl: 'https://i.pinimg.com/736x/43/45/8b/43458b29272370723226334336066223.jpg' 
    },
    {
        id: 'storm',
        defaultName: 'Ororo Munroe',
        defaultClass: 'BLASTER',
        defaultStats: { strength: 6, agility: 8, intellect: 8 },
        imageUrl: 'https://i.pinimg.com/736x/32/33/21/32332155621526365215151216515151.jpg' 
    }
];
