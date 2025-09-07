import './year_update.js';
import { updateYear } from './year_update.js';
import {moveMusic} from './move_Music.js'

document.addEventListener('DOMContentLoaded', () => {
    updateYear();
    moveMusic("#move");
})