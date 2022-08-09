import RequestController, { TypeOrder, TypeSort, WinnerListData } from "../controllers/requestController";
import PaginationController, { EventTypes } from "../controllers/paginationController";
import { assertDefined } from "../components/usefulFunctions";
import "./records-view.css";


const template = `
  <h2 class="view-header"></h2>
  <h3 class="page-header"></h3>
  <table class="table-winners">
    <thead>
    <tr>
        <th class="table-winners__header--asc" data-sorter="id">Number</th>
        <th>Car</th>
        <th>Name</th>
        <th data-sorter="wins">Wins</th>
        <th data-sorter="time">Best time (seconds)</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
  <div class="records__pagination-container">
    <button disabled class="records__pagination-button" data-page="1" data-first><<</button>
    <button disabled class="records__pagination-button" data-direction="prev"><</button>
    <button disabled class="records__pagination-number" data-page="1">1</button>
    <button disabled class="records__pagination-button" data-direction="next">></button>
    <button disabled class="records__pagination-button" data-page="1" data-last>>></button>
  </div>
`;

export default class RecordsView {
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
    this.setupHandlers();
    this.sort();
    this.fillData(1, TypeSort.ID, TypeOrder.ASC).then(() => {
      this.#paginationController.pageNumber = 1;
    });
  }

  async fillData(currentPage: number, sorter: TypeSort, order: TypeOrder): Promise<void> {
    assertDefined(document.querySelector('tbody')).innerHTML = "";
    const winners: WinnerListData = await this.#requestController.getWinners(10, currentPage, sorter, order);
    this.#paginationController.totalPages = Math.ceil(winners.totalWinners / 10);
    if(currentPage !== null) {
      assertDefined(this.#rootElement.querySelector('.view-header')).innerHTML = `Winners (${winners.totalWinners})`;
      assertDefined(this.#rootElement.querySelector('.page-header')).innerHTML = `Page #${currentPage}`;
    }

    for (const resultKey in winners.winnerList) {
      const dataCar = await this.#requestController.getCar(winners.winnerList[resultKey].id);
      let tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${winners.winnerList[resultKey].id}</td>
        <td> <div class="table-winners__svg-car"></div></td>
        <td>${dataCar.name}</td>
        <td>${winners.winnerList[resultKey].wins}</td>
        <td>${winners.winnerList[resultKey].time.toFixed(2)}</td>
      `;
      (tr.querySelector(".table-winners__svg-car") as HTMLDivElement).style.background = dataCar.color;
      assertDefined(document.querySelector('tbody')).appendChild(tr);
    }
  }

  setupHandlers(): void {
    const paginationContainer: HTMLElement = assertDefined(this.#rootElement.querySelector('.records__pagination-container'));
    paginationContainer
      .addEventListener('click', (event: Event) => {
        if (event.target instanceof  HTMLElement)
          if (event.target.dataset['direction'] === 'prev') this.#paginationController.previous();
          else if (event.target.dataset['direction'] === 'next') this.#paginationController.next();
          else if (event.target.dataset['page'] !== undefined) this.#paginationController.goto(parseInt(event.target.dataset['page']));
      });
    const prevButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-direction="prev"]'));
    const firstButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-first]'));
    const pageNumber: HTMLButtonElement = assertDefined(paginationContainer.querySelector('.records__pagination-number'));
    const lastButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-last]'));
    const nextButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-direction="next"]'));
    this.#paginationController.addHandler(EventTypes.pageChange, (currentPage?: number, totalPages?: number) => {
      this.fillData(assertDefined(currentPage), TypeSort.ID, TypeOrder.ASC);
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

  sort(): void {
    assertDefined(document.querySelectorAll('th[data-sorter]')).forEach(th => {
      th.addEventListener('click', (event: Event) => {
        const dataSort: string = (event.target as HTMLElement).dataset.sorter ?? "id";
        let order: TypeOrder = TypeOrder.ASC;
        // TODO: Refactor
        if((event.target as HTMLElement).classList.contains("table-winners__header--asc")) {
          (event.target as HTMLElement).classList.remove("table-winners__header--asc");
          (event.target as HTMLElement).classList.add("table-winners__header--desc");
          order = TypeOrder.DESC;
        }
        else if((event.target as HTMLElement).classList.contains("table-winners__header--desc")){
          (event.target as HTMLElement).classList.remove("table-winners__header--desc");
          (event.target as HTMLElement).classList.add("table-winners__header--asc");
          order = TypeOrder.ASC;
        }
        else {
          assertDefined(document.querySelectorAll('th[data-sorter]')).forEach(th => {
            th.classList.remove("table-winners__header--asc");
            th.classList.remove("table-winners__header--desc");
          });
          (event.target as HTMLElement).classList.add("table-winners__header--asc");
          order = TypeOrder.ASC;
        }
        let sort: TypeSort = TypeSort.ID;
        if (dataSort == "id")
          sort = TypeSort.ID;
        else if (dataSort == "wins")
          sort = TypeSort.WINS;
        else
          sort = TypeSort.TIME;
        this.fillData(assertDefined(this.#paginationController.pageNumber), sort, order);
      })
    })
  }
}
