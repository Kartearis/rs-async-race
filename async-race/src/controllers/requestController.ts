

enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export type CarData = {
  name: string,
  color: string,
  id: number
};

export type CarListData = {
  totalCars: number,
  carList: CarData[]
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

  async getCar(id: number) {

  }

  async createCar() {

  }

  async deleteCar(id: number) {

  }

  async updateCar(id: number) {

  }

  async #makeRequest(path: string, method: HttpMethods, params: Record<string, string>): Promise<Response> {
    const url = this.#host + path + '?' + (new URLSearchParams(params)).toString();
    let response: Response | null = null;
    try {
      response = await fetch(url, {
        method: HttpMethods[method],
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    catch (e) {
      throw new Error(`While making request an error has occured: ${e}`);
    }
    return response;
  }
}