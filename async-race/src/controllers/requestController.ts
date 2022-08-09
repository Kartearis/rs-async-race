// TODO: Reduce code rebundancy
enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum EngineStates {
  START = 'started',
  STOP = 'stopped',
  DRIVE = 'drive'
}

export type CarData = {
  name: string,
  color: string,
  id: number
};

export enum TypeSort {
  ID = 'id',
  WINS = 'wins',
  TIME = 'time'
}

export enum TypeOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export type CarListData = {
  totalCars: number,
  carList: CarData[]
};

export type EngineData = {
  velocity: number,
  distance: number
}

export type WinnerData = {
  id: number,
  wins: number,
  time: number,
};

export type WinnerListData = {
  totalWinners: number,
  winnerList: WinnerData[]
};

export default class RequestController {
  readonly #host: string

  constructor(host: string) {
    this.#host = host;
  }


  async getCars(perPage: number | null = null, page: number | null = null): Promise<CarListData> {
    const params : {} | {_page: string, _limit: string} = perPage !== null && page !== null
      ? {
        _page: page.toString(),
        _limit: perPage.toString()
      }
      : {};
    const response: Response = await this.#makeRequest('/garage', HttpMethods.GET, params);
    if (response.status === 200) {
      const data: CarData[] = await response.json();
      const totalCountHeader: string | null = response.headers.get('X-Total-Count');
      return {
        totalCars: totalCountHeader ? parseInt(totalCountHeader) : data.length,
        carList: data
      };
    }
    else throw new Error('There was an error while requesting list of cars');
  }

  async getCar(id: number): Promise<CarData> {
    if (id === undefined || id <= 0)
      throw new Error("Incorrect id");
    const response: Response = await this.#makeRequest(`/garage/${id}`, HttpMethods.GET, {});
    if (response.status === 200)
      return response.json();
    if (response.status === 404)
      throw new Error("Requested car not found");
    throw new Error(`There was an error while requesting car with id ${id}`);
  }

  async createCar(data: Omit<CarData, 'id'>) {
    const response: Response = await this.#makeRequest(`/garage`, HttpMethods.POST, {}, data);
    if (response.status === 201)
      return response.json();
    throw new Error(`There was an error while creating new car`);
  }

  async deleteCar(id: number): Promise<boolean> {
    if (id === undefined || id <= 0)
      throw new Error("Incorrect id");
    const response: Response = await this.#makeRequest(`/garage/${id}`, HttpMethods.DELETE, {});
    if (response.status === 200)
      return true;
    if (response.status === 404)
      throw new Error("Requested car not found");
    throw new Error(`There was an error while deleting car with id ${id}`);
  }

  async updateCar(id: number, data: Omit<CarData, 'id'>): Promise<CarData> {
    if (id === undefined || id <= 0)
      throw new Error("Incorrect id");
    const response: Response = await this.#makeRequest(`/garage/${id}`, HttpMethods.PUT, {}, data);
    if (response.status === 200)
      return response.json();
    if (response.status === 404)
      throw new Error("Requested car not found");
    throw new Error(`There was an error while updating car with id ${id}`);
  }

  async toggleEngine(id: number, status: EngineStates): Promise<EngineData> {
    if (id === undefined || id <= 0)
      throw new Error("Incorrect id");
    const response: Response = await this.#makeRequest('/engine',
      HttpMethods.PATCH,
      {
        id: id.toString(),
        status: status
      });
    if (response.status === 200)
      return response.json();
    if (response.status === 400)
      throw new Error(`Bad request with id ${id} and status ${status}`);
    if (response.status === 404)
      throw new Error("Requested car not found");
    throw new Error("An error occured while toggling engine");
  }

  async evaluateDriving(id: number): Promise<boolean> {
    if (id === undefined || id <= 0)
      throw new Error("Incorrect id");
    const response: Response = await this.#makeRequest('/engine',
      HttpMethods.PATCH,
      {
        id: id.toString(),
        status: EngineStates.DRIVE
      });
    switch (response.status) {
      case 200: return true;
      case 500: return false;
      case 400: throw new Error(`Bad evaluation request with id ${id}`);
      case 404: throw new Error("Requested has not started before");
      case 429: throw new Error('Cannot evaluate the same car several times');
      default: throw new Error('While evaluating car run some error occured');
    }
  }

  async getWinners(perPage: number, page: number, sort: TypeSort, order: TypeOrder): Promise<WinnerListData> {
    const params : {_page: string, _limit: string, _sort: TypeSort, _order: TypeOrder} = {
        _page: page.toString(),
        _limit: perPage.toString(),
        _sort: sort,
        _order: order
      };
    const response: Response = await this.#makeRequest('/winners', HttpMethods.GET, params);
    if (response.status === 200) {
      const data: WinnerData[] = await response.json();
      const totalCountHeader: string | null = response.headers.get('X-Total-Count');
      return {
        totalWinners: totalCountHeader ? parseInt(totalCountHeader) : data.length,
        winnerList: data
      };
    }
    else throw new Error('There was an error while requesting list of winners');
  }

  async getWinner(id: number): Promise<WinnerData> {
    const response: Response = await this.#makeRequest(`/winners/${id}`, HttpMethods.GET, {});
    if (response.status === 200)
      return response.json();
    if (response.status === 404)
      throw new Error("Requested winner not found");
    throw new Error(`There was an error while requesting winner with id ${id}`);
  }

  async createWinner(data: WinnerData): Promise<WinnerData> {
    const response: Response = await this.#makeRequest(`/winners`, HttpMethods.POST, {}, data);
    if (response.status === 201)
      return response.json();
    if (response.status === 500)
      throw new Error("Could not create a record in winner table: Duplicate id");
    throw new Error(`There was an error while creating winner`);
  }

  async updateWinner(id: number, data: Omit<WinnerData, 'id'>): Promise<WinnerData> {
    const response: Response = await this.#makeRequest(`/winners/${id}`, HttpMethods.PUT, {}, data);
    if (response.status === 200)
      return response.json();
    if (response.status === 404)
      throw new Error("Requested winner not found");
    throw new Error(`There was an error while updating winner with id ${id}`);
  }

  async deleteWinner(id: number): Promise<void> {
    const response: Response = await this.#makeRequest(`/winners/${id}`, HttpMethods.DELETE, {});
    if (response.status === 200)
      return;
    if (response.status === 404)
      throw new Error("Requested winner not found");
    throw new Error(`There was an error while deleting winner with id ${id}`);
  }

  async #makeRequest(path: string, method: HttpMethods, params: Record<string, string>, body: Object = {}): Promise<Response> {
    const url = this.#host + path + '?' + (new URLSearchParams(params)).toString();
    let response: Response | null = null;
    try {
      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: [HttpMethods.PUT, HttpMethods.POST, HttpMethods.PATCH].includes(method) ? JSON.stringify(body) : undefined
      });
    }
    catch (e) {
      throw new Error(`While making request an error has occured: ${e}`);
    }
    return response;
  }
}