import PaginationController, { EventTypes } from "../controllers/paginationController";
import RequestController, { CarData, CarListData } from "../controllers/requestController";
import { assertDefined } from "../components/usefulFunctions";
import './garage-view.css';
import SetupForm from "../components/setupForm";

const template = `
  <section class="setup-form">
  </section>
  <section class="garage">
    <h3>Garage <span id="totalCars">1</span></h3>
    <div class="garage__car-container"></div>
    <div class="garage__pagination-container">
      <button disabled class="garage__pagination-button" data-page="1" data-first><<</button>
      <button disabled class="garage__pagination-button" data-direction="prev"><</button>
      <button disabled class="garage__pagination-number" data-page="1">1</button>
      <button disabled class="garage__pagination-button" data-direction="next">></button>
      <button disabled class="garage__pagination-button" data-page="1" data-last>>></button>
    </div>
  </section>
`;

export default class GarageView {
  #rootElement: HTMLElement
  #paginationController: PaginationController
  #requestController: RequestController


  constructor(element: HTMLElement) {
    this.#rootElement = element;
    this.#paginationController = new PaginationController();
    this.#requestController = new RequestController('http://127.0.0.1:3000');
  }

  show(): void {
    this.#rootElement.innerHTML = template;
    const setupForm = new SetupForm();
    assertDefined(this.#rootElement.querySelector('.setup-form')).append(setupForm);
    this.setupHandlers();
    this.fillData(1).then(() => {
      this.#paginationController.pageNumber = 1;
    });
  }

  setupHandlers(): void {
    const paginationContainer: HTMLElement = assertDefined(this.#rootElement.querySelector('.garage__pagination-container'));
    paginationContainer
      .addEventListener('click', (event: Event) => {
        if (event.target instanceof  HTMLElement)
          if (event.target.dataset['direction'] === 'prev') this.#paginationController.previous();
          else if (event.target.dataset['direction'] === 'next') this.#paginationController.next();
          else if (event.target.dataset['page'] !== undefined) this.#paginationController.goto(parseInt(event.target.dataset['page']));
      });
    const prevButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-direction="prev"]'));
    const firstButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-first]'));
    const pageNumber: HTMLButtonElement = assertDefined(paginationContainer.querySelector('.garage__pagination-number'));
    const lastButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-last]'));
    const nextButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-direction="next"]'));
    this.#paginationController.addHandler(EventTypes.pageChange, (currentPage?: number, totalPages?: number) => {
      this.fillData(assertDefined(currentPage));
      prevButton.disabled = true;
      nextButton.disabled = true;
      firstButton.disabled = true;
      lastButton.disabled = true;
      if (currentPage !== 1) {
        prevButton.disabled = false;
        firstButton.disabled = false;
      }
      if (assertDefined(currentPage) < assertDefined(totalPages)) {
        nextButton.disabled = false;
        lastButton.disabled = false;
      }
      pageNumber.innerText = pageNumber.dataset['page'] = assertDefined(currentPage).toString();
    });
    this.#paginationController.addHandler(EventTypes.totalChange, (currentPage?: number, totalPages?: number) => {
      lastButton.dataset['page'] = assertDefined(totalPages).toString();
    });
  }

  async fillData(currentPage: number | null): Promise<void> {
    const cars: CarListData = await this.#requestController.getCars(2, currentPage);
    this.#paginationController.totalPages = cars.totalCars / 2;
    const carContainer: HTMLElement = assertDefined(this.#rootElement.querySelector('.garage__car-container'));
    carContainer.innerHTML = "";
    console.log("Data filled");
    cars.carList.forEach((car: CarData) => {
      const tmp = document.createElement('div');
      tmp.innerText = car.name + car.color;
      carContainer.append(tmp);
    });
  }
}