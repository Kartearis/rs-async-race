

export default class RecordsView {
  #rootElement: HTMLElement

  constructor(element: HTMLElement) {
    this.#rootElement = element;
  }

  show(): void {
    this.#rootElement.innerText = "Records view";
  }

}