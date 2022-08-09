
import './setup-form.css';
import { CarData } from "../controllers/requestController";
import { assertDefined } from "./usefulFunctions";
export type CarSettings = Omit<CarData, 'id'>;

export enum RaceEvents {
  RACE = 'race',
  RESET = 'reset',
  BLOCKED = 'blocked'
}

const template: string = `
    <input type="text" class="setup__name">
    <input type="color" class="setup__color">
    <button class="setup__button" id="create">Create</button>
    <button class="setup__button" id="update">Update</button>
    <button class="setup__button setup__button--wide" id="generate">Generate cars</button>
    <button class="setup__button" id="race">Race</button>
    <button class="setup__button" id="reset-race">Reset race</button>
`;

export default class SetupForm extends HTMLElement {

  #nameInput: HTMLInputElement
  #colorInput: HTMLInputElement
  #createButton: HTMLButtonElement
  #updateButton: HTMLButtonElement
  #generateButton: HTMLButtonElement
  #raceButton: HTMLButtonElement
  #resetButton: HTMLButtonElement
  #selectedCar: CarData | null = null

  constructor() {
    super();
    this.classList.add('setup');
    this.innerHTML = template;
    this.#nameInput = assertDefined(this.querySelector('.setup__name'));
    this.#colorInput = assertDefined(this.querySelector('.setup__color'));
    this.#createButton = assertDefined(this.querySelector('#create'));
    this.#updateButton = assertDefined(this.querySelector('#update'));
    this.#generateButton = assertDefined(this.querySelector('#generate'));
    this.#raceButton = assertDefined(this.querySelector('#race'));
    this.#resetButton = assertDefined(this.querySelector('#reset-race'));
    this.#createButton.addEventListener('click', () => this.emitCreate());
    this.#updateButton.addEventListener('click', () => this.emitUpdate());
    this.#updateButton.disabled = true;
    this.#resetButton.disabled = true;
    this.#generateButton.addEventListener('click', () => this.emitGenerate());
    this.#raceButton.addEventListener('click', () => this.emitRaceEvent(RaceEvents.RACE));
    this.#resetButton.addEventListener('click', () => this.emitRaceEvent(RaceEvents.RESET));
    this.#nameInput.addEventListener('change', () => this.emitFieldUpdate());
    this.#colorInput.addEventListener('change', () => this.emitFieldUpdate());
  }

  selectCar(car: CarData) {
    this.#selectedCar = car;
    this.#nameInput.value = car.name;
    this.#colorInput.value = car.color;
    this.#updateButton.disabled = false;
  }

  clearCarSelection() {
    this.#selectedCar = null;
    this.#updateButton.disabled = true;
  }

  getSelectedCar(): CarData | null {
    return this.#selectedCar;
  }

  setFields(name: string, color: string) {
    this.#nameInput.value = name;
    this.#colorInput.value = color;
  }

  emitFieldUpdate(): void {
    const event: CustomEvent<CarSettings> = new CustomEvent('fieldUpdate', {
      detail: {
        name: this.#nameInput.value,
        color: this.#colorInput.value
      }
    });
    this.dispatchEvent(event);
  }

  emitCreate(): void {
    const event: CustomEvent<CarSettings> = new CustomEvent('create', {
      detail: {
        name: this.#nameInput.value,
        color: this.#colorInput.value
      }
    });
    this.dispatchEvent(event);
  }

  emitUpdate(): void {
    if (this.#selectedCar === null)
      throw new Error("Trying to update car without selecting");
    const event: CustomEvent<CarData> = new CustomEvent('update', {
      detail: {
        id: this.#selectedCar.id,
        name: this.#nameInput.value,
        color: this.#colorInput.value
      }
    });
    this.dispatchEvent(event);
  }

  emitGenerate(): void {
    const event: CustomEvent<void> = new CustomEvent('generate', {});
    this.dispatchEvent(event);
  }

  toggleRaceState(type: RaceEvents): void {
    if (type === RaceEvents.BLOCKED) {
      this.#raceButton.disabled = true;
      this.#resetButton.disabled = true;
    }
    if (type === RaceEvents.RACE) {
      this.#raceButton.disabled = true;
      this.#resetButton.disabled = false;
    }
    if (type === RaceEvents.RESET) {
      this.#raceButton.disabled = false;
      this.#resetButton.disabled = true;
    }
  }


  emitRaceEvent(type: RaceEvents): void {
    const event: CustomEvent<void> = new CustomEvent(type, {});
    this.dispatchEvent(event);
  }


}

customElements.define('setup-form', SetupForm);