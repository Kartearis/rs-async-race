
import './setup-form.css';

const template: string = `
    <input type="text" class="setup__name">
    <input type="color" class="setup__color">
    <button class="setup__button">Create</button>
    <button class="setup__button">Update</button>
    <button class="setup__button setup__button--wide">Generate cars</button>
`;

export default class SetupForm extends HTMLElement {

  constructor() {
    super();
    this.classList.add('setup');
    this.innerHTML = template;
  }


}

customElements.define('setup-form', SetupForm);