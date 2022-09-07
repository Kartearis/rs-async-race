import PaginationController, { EventTypes } from "../controllers/paginationController";
import RequestController, { CarData, CarListData, EngineStates } from "../controllers/requestController";
import { assertDefined } from "../components/usefulFunctions";
import "./garage-view.css";
import SetupForm, { CarSettings, RaceEvents } from "../components/setupForm";
import generateCars from "../controllers/carGenerator";
import CarTrack from "../components/carTrack";
import Alert from "../components/alert";
import StorageController, { GarageStorage } from "../controllers/storageController";

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
  #carTrackElements: CarTrack[] = []
  #raceInProgress = false;
  #storageController: StorageController


  constructor(element: HTMLElement, storageController: StorageController) {
    this.#rootElement = element;
    this.#storageController = storageController;
    this.#paginationController = new PaginationController();
    this.#requestController = new RequestController('https://async-race-api.kartearis.xyz');
  }

  show(): void {
    this.#rootElement.innerHTML = template;
    this.#setupForm = new SetupForm();
    assertDefined(this.#rootElement.querySelector('.setup-form')).append(this.#setupForm);
    this.setupHandlers();
    const saved: GarageStorage = this.#storageController.getStorage('garage') as GarageStorage;
    (assertDefined(this.#rootElement.querySelector('[data-last]')) as HTMLElement)
      .dataset['page'] = this.#paginationController.totalPages.toString();
    this.#paginationController.pageNumber = saved.currentPage;
    this.#setupForm?.setFields(saved.currentNameInput, saved.currentColorInput);
    if (saved.currentlySelectedCar)
      this.#setupForm?.selectCar(saved.currentlySelectedCar);
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
    const managePaginationButtons = (currentPage: number, totalPages: number) => {
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
    };
    this.#paginationController.clearHandlers(EventTypes.totalChange);
    this.#paginationController.clearHandlers(EventTypes.pageChange);
    this.#paginationController.addHandler(EventTypes.pageChange, (currentPage?: number, totalPages?: number) => {
      this.fillData(assertDefined(currentPage));
      this.#storageController.getStorage('garage').currentPage = assertDefined(currentPage);
      managePaginationButtons(assertDefined(currentPage), assertDefined(totalPages));
      pageNumber.innerText = pageNumber.dataset['page'] = assertDefined(currentPage).toString();
    });
    this.#paginationController.addHandler(EventTypes.totalChange, (currentPage?: number, totalPages?: number) => {
      if (assertDefined(totalPages) < assertDefined(currentPage))
        this.#paginationController.goto(assertDefined(totalPages));
      else managePaginationButtons(assertDefined(currentPage), assertDefined(totalPages));
      lastButton.dataset['page'] = assertDefined(totalPages).toString();
    });
    assertDefined(this.#setupForm).addEventListener('create', (event: Event) => this.newCar(event as CustomEvent<CarSettings>));
    assertDefined(this.#setupForm).addEventListener('update', (event: Event) => this.updateCar(event as CustomEvent<CarData>));
    assertDefined(this.#setupForm).addEventListener('generate', () => this.generateCars());
    assertDefined(this.#setupForm).addEventListener('race', () => this.startRace());
    assertDefined(this.#setupForm).addEventListener('reset', () => this.stopRace());
    assertDefined(this.#setupForm).addEventListener('fieldUpdate', (event) => {
      const store: GarageStorage = this.#storageController.getStorage('garage') as GarageStorage;
      store.currentNameInput = (event as CustomEvent<CarSettings>).detail.name;
      store.currentColorInput = (event as CustomEvent<CarSettings>).detail.color;
    });
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
    try {
      await this.#requestController.deleteWinner(event.detail.id);
    }
    catch {}
    this.#setupForm?.clearCarSelection();
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
    this.#carTrackElements = [];
    cars.carList.forEach((car: CarData) => {
      const carElement = new CarTrack(car);
      if (this.#setupForm?.getSelectedCar()?.id === car.id)
        carElement.select();
      // TODO: Move these listeners to car container
      carElement.addEventListener('select', (event) => {
        if (assertDefined(this.#setupForm).getSelectedCar() !== null)
        {
          const selected: CarData = assertDefined(this.#setupForm?.getSelectedCar());
          this.#carTrackElements.find((track: CarTrack) => track.getId() === selected.id)?.deSelect();
          this.#setupForm?.clearCarSelection();
        }
        // Prettier fails on next line for some reason
        if (event instanceof CustomEvent<CarData>)
        {
          this.#setupForm?.selectCar(event.detail);
          (this.#storageController.getStorage('garage') as GarageStorage).currentlySelectedCar = event.detail;
        }
      });
      carElement.addEventListener('delete', (event) => {
        const ev: CustomEvent<CarData> = event as CustomEvent<CarData>;
        this.deleteCar(ev);
        if (assertDefined(this.#setupForm).getSelectedCar()
          && ev.detail.id === assertDefined(this.#setupForm).getSelectedCar()?.id)
          this.#setupForm?.clearCarSelection();
      });
      carElement.addEventListener('run',
        (event) => this.startEngine((event as CustomEvent<CarData>).detail.id, carElement, false));
      carElement.addEventListener('stop', (event) =>
        this.stopEngine((event as CustomEvent<CarData>).detail.id, carElement));
      this.#carTrackElements.push(carElement);
      carContainer.append(carElement);
    });
  }

  async stopEngine(carId: number, carElement: CarTrack) {
    await this.#requestController.toggleEngine(carId, EngineStates.STOP);
    carElement.stop();
  }

  async startEngine(carId: number, carElement: CarTrack, throws = true): Promise<CarTrack> {
    const animationData = await this.#requestController.toggleEngine(carId, EngineStates.START);
    carElement.run();
    carElement.startDriving(animationData.velocity, animationData.distance);
    const result = await this.#requestController.evaluateDriving(carId);
    console.log(result);
    if (!result) {
      carElement.finishDriving();
      if (throws)
        throw new Error("Car engine broke down");
      else return carElement;
    }
    return carElement;
  }

  async startRace() {
    this.#setupForm?.toggleRaceState(RaceEvents.RACE);
    this.#raceInProgress = true;
    const racers = this.#carTrackElements.map((car: CarTrack) => this.startEngine(car.getId(), car));
    try {
      const winner: CarTrack = await Promise.any(racers);
      if (this.#raceInProgress) {
        const winnerData: CarData = winner.getCarData();
        this.#rootElement.append(new Alert('Race Finished!', `Winner is ${winnerData.name} (${winnerData.color})!`));
        try {
          const record = await this.#requestController.getWinner(winnerData.id);
          await this.#requestController.updateWinner(winnerData.id, {
            wins: record.wins + 1,
            time: record.time > winner.getSeconds() ? winner.getSeconds() : record.time
          });
        }
        catch (e: unknown) {
          if ((e as Error).message === "Requested winner not found")
            await this.#requestController.createWinner({
              id: winnerData.id,
              wins: 1,
              time: winner.getSeconds()
            });
        }
      }
    }
    catch {
      this.#rootElement.append(new Alert('Race Finished!', 'All the cars broke down :('));
    }

  }

  async stopRace() {
    this.#setupForm?.toggleRaceState(RaceEvents.BLOCKED);
    this.#raceInProgress = false;
    await Promise.all(this.#carTrackElements.map((car: CarTrack) => this.stopEngine(car.getId(), car)));
    this.#setupForm?.toggleRaceState(RaceEvents.RESET);
  }
}