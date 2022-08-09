import { assertDefined } from "./usefulFunctions";
import './custom-alert.css';


const template = `
  <div class="alert">
    <h3 class="alert__header">Alert</h3>
    <div class="alert__content">Content</div>
    <button class="alert__button">Ok</button>
  </div>
`;

export default class Alert extends HTMLElement {
  constructor(header: string, content: string) {
    super();
    this.classList.add('alert-backdrop');
    this.addEventListener('click', (event) => this.destroy(event));
    this.innerHTML = template;
    const headerElement = assertDefined(this.querySelector('.alert__header'))
    if (headerElement instanceof HTMLHeadingElement) headerElement.innerText = header;
    const contentElement = assertDefined(this.querySelector('.alert__content'))
    if (contentElement instanceof HTMLDivElement) contentElement.innerHTML = content;
  }

  destroy(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('alert__button')
      || (event.target as HTMLElement).classList.contains('alert-backdrop'))
    this.remove();
  }

}

customElements.define('custom-alert', Alert);