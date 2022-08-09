
import './setup-form.css';
import { CarData } from "../controllers/requestController";
import { assertDefined } from "./usefulFunctions";
export type CarSettings = Omit<CarData, 'id'>;

const template: string = `
    <input type="text" class="setup__name">
    <input type="color" class="setup__color">
    <button class="setup__button" id="create">Create</button>
    <button class="setup__button" id="update">Update</button>
    <button class="setup__button setup__button--wide" id="generate">Generate cars</button>
`;

export default class SetupForm extends HTMLElement {

  #nameInput: HTMLInputElement
  #colorInput: HTMLInputElement
  #createButton: HTMLButtonElement
  #updateButton: HTMLButtonElement
  #generateButton: HTMLButtonElement
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
    this.#createButton.addEventListener('click', () => this.emitCreate());
    this.#updateButton.addEventListener('click', () => this.emitUpdate());
    this.#updateButton.disabled = true;
    this.#generateButton.addEventListener('click', () => this.emitGenerate());
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


}

customElements.define('setup-form', SetupForm);