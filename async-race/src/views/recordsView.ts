import RequestController, { TypeOrder, TypeSort, WinnerData, WinnerListData } from '../controllers/requestController';
import PaginationController, { EventTypes } from '../controllers/paginationController';
import { assertDefined } from '../components/usefulFunctions';
import './records-view.css';
import StorageController, { RecordStorage } from '../controllers/storageController';

const template = `
  <h2 class="view-header"></h2>
  <h3 class="page-header"></h3>
  <table class="table-winners">
    <thead>
    <tr>
        <th class="table-winners__header--asc" data-sorter="id">Number (Sort by id)</th>
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
    #rootElement: HTMLElement;
    #paginationController: PaginationController;
    #requestController: RequestController;
    #storageController: StorageController;
    #sort: TypeSort = TypeSort.ID;
    #order: TypeOrder = TypeOrder.ASC;

    constructor(element: HTMLElement, storageController: StorageController) {
        this.#rootElement = element;
        this.#storageController = storageController;
        this.#paginationController = new PaginationController();
        this.#requestController = new RequestController('https://async-race-api.kartearis.xyz');
    }

    show(): void {
        this.#rootElement.innerHTML = template;
        this.setupHandlers();
        this.setupSort();
        const saved: RecordStorage = this.#storageController.getStorage('records') as RecordStorage;
        this.setSortSettings(saved.currentSortField, saved.currentSortOrder);
        this.#paginationController.pageNumber = saved.currentPage;
    }

    setSortSettings(field: TypeSort, order: TypeOrder): void {
        this.#sort = field;
        this.#order = order;
        const query = `th[data-sorter="${field}"]`;
        assertDefined(this.#rootElement.querySelector(query)).classList.add(
            order === TypeOrder.ASC ? 'table-winners__header--asc' : 'table-winners__header--desc'
        );
    }

    async fillData(currentPage: number): Promise<void> {
        assertDefined(this.#rootElement.querySelector('tbody')).innerHTML = '';
        const winners: WinnerListData = await this.#requestController.getWinners(
            10,
            currentPage,
            this.#sort,
            this.#order
        );
        this.#paginationController.totalPages = Math.ceil(winners.totalWinners / 10);
        if (currentPage !== null) {
            assertDefined(
                this.#rootElement.querySelector('.view-header')
            ).innerHTML = `Winners (${winners.totalWinners})`;
            assertDefined(this.#rootElement.querySelector('.page-header')).innerHTML = `Page #${currentPage}`;
        }

        let num: number = (currentPage - 1) * 10;
        await Promise.all(
            winners.winnerList.map(async (winner: WinnerData) => {
                const dataCar = await this.#requestController.getCar(winner.id);
                const tr = document.createElement('tr');
                tr.innerHTML = `
        <td>${num + 1}</td>
        <td> <div class="table-winners__svg-car"></div></td>
        <td>${dataCar.name}</td>
        <td>${winner.wins}</td>
        <td>${winner.time.toFixed(2)}</td>
      `;
                num += 1;
                (tr.querySelector('.table-winners__svg-car') as HTMLDivElement).style.background = dataCar.color;
                assertDefined(this.#rootElement.querySelector('tbody')).appendChild(tr);
            })
        );
    }

    setupHandlers(): void {
        const paginationContainer: HTMLElement = assertDefined(
            this.#rootElement.querySelector('.records__pagination-container')
        );
        paginationContainer.addEventListener('click', (event: Event) => {
            if (event.target instanceof HTMLElement)
                if (event.target.dataset['direction'] === 'prev') this.#paginationController.previous();
                else if (event.target.dataset['direction'] === 'next') this.#paginationController.next();
                else if (event.target.dataset['page'] !== undefined)
                    this.#paginationController.goto(parseInt(event.target.dataset['page']));
        });
        const prevButton: HTMLButtonElement = assertDefined(
            paginationContainer.querySelector('[data-direction="prev"]')
        );
        const firstButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-first]'));
        const pageNumber: HTMLButtonElement = assertDefined(
            paginationContainer.querySelector('.records__pagination-number')
        );
        const lastButton: HTMLButtonElement = assertDefined(paginationContainer.querySelector('[data-last]'));
        const nextButton: HTMLButtonElement = assertDefined(
            paginationContainer.querySelector('[data-direction="next"]')
        );
        this.#paginationController.clearHandlers(EventTypes.pageChange);
        this.#paginationController.clearHandlers(EventTypes.totalChange);
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
        this.#paginationController.addHandler(EventTypes.pageChange, (currentPage?: number, totalPages?: number) => {
            this.fillData(assertDefined(currentPage));
            this.#storageController.getStorage('records').currentPage = assertDefined(currentPage);
            managePaginationButtons(assertDefined(currentPage), assertDefined(totalPages));
            pageNumber.innerText = pageNumber.dataset['page'] = assertDefined(currentPage).toString();
        });
        this.#paginationController.addHandler(EventTypes.totalChange, (currentPage?: number, totalPages?: number) => {
            if (assertDefined(totalPages) < assertDefined(currentPage))
                this.#paginationController.goto(assertDefined(totalPages));
            else managePaginationButtons(assertDefined(currentPage), assertDefined(totalPages));
            lastButton.dataset['page'] = assertDefined(totalPages).toString();
        });
    }

    setupSort(): void {
        assertDefined(this.#rootElement.querySelectorAll('th[data-sorter]')).forEach((th) => {
            th.addEventListener('click', (event: Event) => {
                const dataSort: string = (event.target as HTMLElement).dataset.sorter ?? 'id';
                let order: TypeOrder = TypeOrder.ASC;
                // TODO: Refactor
                if ((event.target as HTMLElement).classList.contains('table-winners__header--asc')) {
                    (event.target as HTMLElement).classList.remove('table-winners__header--asc');
                    (event.target as HTMLElement).classList.add('table-winners__header--desc');
                    order = TypeOrder.DESC;
                } else if ((event.target as HTMLElement).classList.contains('table-winners__header--desc')) {
                    (event.target as HTMLElement).classList.remove('table-winners__header--desc');
                    (event.target as HTMLElement).classList.add('table-winners__header--asc');
                    order = TypeOrder.ASC;
                } else {
                    assertDefined(this.#rootElement.querySelectorAll('th[data-sorter]')).forEach((th) => {
                        th.classList.remove('table-winners__header--asc');
                        th.classList.remove('table-winners__header--desc');
                    });
                    (event.target as HTMLElement).classList.add('table-winners__header--asc');
                    order = TypeOrder.ASC;
                }
                let sort: TypeSort = TypeSort.ID;
                if (dataSort == 'id') sort = TypeSort.ID;
                else if (dataSort == 'wins') sort = TypeSort.WINS;
                else sort = TypeSort.TIME;
                const store: RecordStorage = this.#storageController.getStorage('records') as RecordStorage;
                store.currentSortOrder = this.#order = order;
                store.currentSortField = this.#sort = sort;
                this.fillData(assertDefined(this.#paginationController.pageNumber));
            });
        });
    }
}
