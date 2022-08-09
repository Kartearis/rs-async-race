
import rsLogo from '../assets/logo/rs_school_js.svg';
import { assertDefined } from "../components/usefulFunctions";
import './main-view.css';
import GarageView from "./garageView";
import RecordsView from "./recordsView";
import StorageController from "../controllers/storageController";

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = `
  <header class="header-container">
      <h1 class="app-header">Async race</h1>
      <ul class="nav-list">
        <li class="nav-list__link" id="garage">Garage</li>
        <li class="nav-list__link" id="records">Records</li>
      </ul>
<!--      <div class="burger-button">-->
<!--          <div class="burger-button__icon"></div>-->
<!--      </div>-->
  </header>
  <main class="content">
  </main>
  <footer class="footer">
      <p class="footer__copyright">
          <a class="footer__copyright-link" href="https://github.com/Kartearis">Kartearis</a>, 2022
      </p>
      <div class="rs-logo">
          <a class="rs-logo__link" href="https://rs.school/js/">
              <img alt="Rs school logo" class="rs-logo__icon" src="">
          </a>
      </div>
  </footer>
`;

export default class MainView {
  garageView: GarageView
  recordsView: RecordsView

  #garageNav: HTMLElement
  #recordsNav: HTMLElement
  #allNavs: HTMLElement
  #contentContainer: HTMLElement

  constructor(rootElement: HTMLElement, storageController: StorageController) {
    const viewContent: Node = template.content.cloneNode(true);
    rootElement.append(viewContent);
    (assertDefined(rootElement.querySelector('.rs-logo__icon')) as HTMLImageElement).src = rsLogo;
    this.#allNavs = assertDefined(rootElement.querySelector('.nav-list'));
    this.#contentContainer = assertDefined(rootElement.querySelector('.content'));
    this.#garageNav = assertDefined(rootElement.querySelector('.nav-list__link#garage'));
    this.#garageNav.addEventListener('click', () => this.showGarage());
    this.#recordsNav = assertDefined(rootElement.querySelector('.nav-list__link#records'));
    this.#recordsNav.addEventListener('click', () => this.showRecords());
    this.garageView = new GarageView(this.#contentContainer, storageController);
    this.recordsView = new RecordsView(this.#contentContainer, storageController);
    // TODO: load last opened from storage
    this.showGarage();
  }

  showGarage(): void {
    this.#allNavs.querySelectorAll('.nav-list__link')
      .forEach((link) => link.classList.remove('nav-list__link--active'));
    this.#garageNav.classList.add('nav-list__link--active');
    // Show garage view
    this.garageView.show();
  }

  showRecords(): void {
    this.#allNavs.querySelectorAll('.nav-list__link')
      .forEach((link) => link.classList.remove('nav-list__link--active'));
    this.#recordsNav.classList.add('nav-list__link--active');
    // Show records view
    this.recordsView.show();
  }
}