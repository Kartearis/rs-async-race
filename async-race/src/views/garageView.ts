

export default class GarageView {
  #rootElement: HTMLElement

  constructor(element: HTMLElement) {
    this.#rootElement = element;
  }

  show(): void {
    this.#rootElement.innerText = "Garage view";
  }
}