import './car-fire.css';

export default class CarFire extends HTMLElement {
    constructor() {
        super();
        this.classList.add('car-fire');
        for (let i = 0; i < 30; i += 1) {
            const particle = document.createElement('div');
            particle.classList.add('car-fire__particle');
            const smokiness = 0.5 + 0.5 * Math.random();
            if (Math.random() > smokiness) particle.classList.add('car-fire__particle--smoke');
            particle.style.setProperty('--anim-delay-rand', Math.random().toString());
            particle.style.setProperty('--offset', ((i - 1) / 30).toString());
            this.append(particle);
        }
    }
}

customElements.define('car-fire', CarFire);
