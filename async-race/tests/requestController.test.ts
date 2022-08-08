import fetch from 'node-fetch';
// @ts-ignore
global.fetch = fetch;
import RequestController from "../src/controllers/requestController";
// All api tests depend on local hosted server calls (and will fail when server is not running)
// TODO: Add mock or mock fallback
const controller = new RequestController('http://127.0.0.1:3000');

describe('getCars test', () => {
  it('Should return list of cars when called with no arguments', async () => {
    const result = await controller.getCars();
    expect(result.totalCars).toBeDefined();
    expect(result.carList).toBeDefined();
    expect(result.carList.length).toEqual(result.totalCars);
    result.carList.forEach((car) => {
      expect(typeof car.id).toBe('number');
      expect(typeof car.name).toBe('string');
      expect(typeof car.color).toBe('string');
      expect(car.color).toMatch(/#[\dabcdef]{6}/);
    });
  });
});