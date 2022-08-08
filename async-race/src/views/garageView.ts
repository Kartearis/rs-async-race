import PaginationController, { EventTypes } from "../controllers/paginationController";
import RequestController, { CarData, CarListData } from "../controllers/requestController";
import { assertDefined } from "../components/usefulFunctions";
import './garage-view.css';
import SetupForm, { CarSettings } from "../components/setupForm";
import generateCars from "../controllers/carGenerator";
import CarTrack from "../components/carTrack";

const template = `
  <section class="setup-form">
  </section>
  <section class="garage">
    <h3>Garage (<span id="totalCars">1</span>)</h3>
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
// TODO: Reload state on view show
export default class GarageView {
  #rootElement: HTMLElement
  #paginationController: PaginationController
  #requestController: RequestController
  #setupForm: SetupForm | null = null


  constructor(element: HTMLElement) {
    this.#rootElement = element;
    this.#paginationController = new PaginationController();
    this.#requestController = new RequestController('http://127.0.0.1:3000');
  }

  show(): void {
    this.#rootElement.innerHTML = template;
    this.#setupForm = new SetupForm();
    assertDefined(this.#rootElement.querySelector('.setup-form')).append(this.#setupForm);
    this.setupHandlers();
    (assertDefined(this.#rootElement.querySelector('[data-last]')) as HTMLElement)
      .dataset['page'] = this.#paginationController.totalPages.toString();
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
    assertDefined(this.#setupForm).addEventListener('create', (event: Event) => this.newCar(event as CustomEvent<CarSettings>));
    assertDefined(this.#setupForm).addEventListener('update', (event: Event) => this.updateCar(event as CustomEvent<CarData>));
    assertDefined(this.#setupForm).addEventListener('generate', () => this.generateCars());
  }

  async newCar(event: CustomEvent<CarSettings>): Promise<void> {
    await this.#requestController.createCar(event.detail);
    await this.fillData(this.#paginationController.pageNumber);
  }

  async updateCar(event: CustomEvent<CarData>): Promise<void> {
    await this.#requestController.updateCar(event.detail.id, {
      name: event.detail.name,
      color: event.detail.color
    });
    // TODO: Replace only updated car (if it is required)
    await this.fillData(this.#paginationController.pageNumber);
  };

  async deleteCar(event: CustomEvent<CarData>): Promise<void> {
    await this.#requestController.deleteCar(event.detail.id);
    await this.fillData(this.#paginationController.pageNumber);
  }

  async generateCars() {
    await Promise.all(generateCars(100).map((car) => this.#requestController.createCar(car)));
    await this.fillData(this.#paginationController.pageNumber);
  }

  async fillData(currentPage: number | null): Promise<void> {
    const cars: CarListData = await this.#requestController.getCars(7, currentPage);
    this.#paginationController.totalPages = Math.ceil(cars.totalCars / 7);
    const carContainer: HTMLElement = assertDefined(this.#rootElement.querySelector('.garage__car-container'));
    (assertDefined(this.#rootElement.querySelector('#totalCars')) as HTMLElement)
      .innerText = cars.totalCars.toString();
    carContainer.innerHTML = "";
    cars.carList.forEach((car: CarData) => {
      const carElement = new CarTrack(car);
      carContainer.append(carElement);
    });
  }
}