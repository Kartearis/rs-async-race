import { CarData } from "../controllers/requestController";
import { assertDefined } from "./usefulFunctions";

import './car-track.css';

const template = `
  <div class="car-track__head">
    <button class="car-track__head-button" data-action="select">Select</button>
    <button class="car-track__head-button" data-action="delete">Delete</button>
    <h5 class="car-track__header">Some car</h5>
  </div>
  <div class="car-track__engine">
    <button class="car-track__engine-button" data-action="go">Go</button>
    <button disabled class="car-track__engine-button" data-action="stop">S</button>
  </div>
  <div class="car-track__track">
    <div class="car-track__car">
    </div>
  </div>
  <div class="car-track__goal">
  </div>
`;

export default class CarTrack extends HTMLElement {
  #data: CarData
  #nameElement: HTMLHeadingElement
  #carElement: HTMLDivElement
  #selectButton: HTMLButtonElement
  #deleteButton: HTMLButtonElement
  #runButton: HTMLButtonElement
  #stopButton: HTMLButtonElement

  constructor(data: CarData) {
    super();
    this.#data = data;
    this.classList.add('car-track');
    this.innerHTML = template;
    this.#carElement = assertDefined(this.querySelector('.car-track__car'));
    this.#nameElement = assertDefined(this.querySelector('.car-track__header'));
    this.#selectButton = assertDefined(this.querySelector('[data-action="select"]'));
    this.#deleteButton = assertDefined(this.querySelector('[data-action="delete"]'));
    this.#runButton = assertDefined(this.querySelector('[data-action="go"]'));
    this.#stopButton = assertDefined(this.querySelector('[data-action="stop"]'));
    this.#nameElement.innerText = this.#data.name;
    this.#carElement.style.background = this.#data.color;
    this.#deleteButton.addEventListener('click', () => this.emitEvent('delete'));
    this.#selectButton.addEventListener('click', () => this.select());
    this.#runButton.addEventListener('click', () => this.emitEvent('run'));
    this.#stopButton.addEventListener('click', () => this.emitEvent('stop'));
  }

  getId(): number {
    return this.#data.id;
  }

  getCarData(): CarData {
    return this.#data;
  }

  select(): void {
    this.classList.add('car-track--selected');
    this.emitEvent('select');
  }

  deSelect(): void {
    this.classList.remove('car-track--selected');
  }

  run(): void {
    this.#stopButton.disabled = false;
    this.#runButton.disabled = true;
  }

  stop(): void {
    this.#stopButton.disabled = true;
    this.#runButton.disabled = false;
    this.#carElement.classList.remove('car-track__car--running');
    this.#carElement.style.animationPlayState = 'running';
  }

  startDriving(velocity: number, range: number): void {
    const eta: number = range / velocity;
    this.#carElement.style.setProperty('--eta', `${eta}ms`);
    this.#carElement.classList.add('car-track__car--running');
  }

  finishDriving(): void {
    this.#carElement.style.animationPlayState = 'paused';
  }

  emitEvent(eventName: string): void {
    const event: CustomEvent<CarData> = new CustomEvent(eventName, {detail: this.#data});
    this.dispatchEvent(event);
  }

}

customElements.define('car-track', CarTrack);