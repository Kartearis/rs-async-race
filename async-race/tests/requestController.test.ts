import fetch from 'node-fetch';
// @ts-ignore
global.fetch = fetch;
import RequestController, { CarData, CarListData } from "../src/controllers/requestController";
// All api tests depend on local hosted server calls (and will fail when server is not running).
// Some tests require that there is a car with id = 1
// TODO: Add mock or mock fallback
const controller = new RequestController('http://127.0.0.1:3000');

function testCarData(car: CarData) {
  expect(typeof car.id).toBe('number');
  expect(typeof car.name).toBe('string');
  expect(typeof car.color).toBe('string');
  expect(car.color).toMatch(/#[\dabcdef]{6}/);
}

function testCarList(carList: CarListData) {
  expect(carList.totalCars).toBeDefined();
  expect(carList.carList).toBeDefined();
  carList.carList.forEach((car) => {
    testCarData(car);
  });
}

describe('getCars test', () => {
  it('Should return list of cars when called with no arguments', async () => {
    const result = await controller.getCars();
    testCarList(result);
    expect(result.carList.length).toEqual(result.totalCars);
  });
  it('Should return the same list of cars when called with only page limiter', async () => {
    const resultDefault = await controller.getCars();
    const result = await controller.getCars(3);
    testCarList(result);
    expect(resultDefault.carList).toEqual(result.carList);
  });
  it('Should return limited list of cars if both parameters passed', async () => {
    const resultDefault = await controller.getCars();
    const result = await controller.getCars(1, 1);
    testCarList(result);
    expect(result.carList.length).not.toEqual(resultDefault.carList.length);
    expect(result.totalCars).toEqual(resultDefault.totalCars);
    expect(result.carList).not.toEqual(resultDefault.carList);
  });
});
// update car tests here (as setup for getCar)
describe('getCar tests', () => {
  it('Should return info on specific car', async () => {
    const result = await controller.getCar(1);
    testCarData(result);
    expect(result.id).toEqual(1);
  });
  it('Should throw if no id provided or negative', async () => {
    await expect(async () => {
      // hack to test it in runtime
      const result = await controller.getCar(undefined as unknown as number);
    }).rejects.toThrow(Error);
    await expect(async () => {
      const result = await controller.getCar(-2);
    }).rejects.toThrow(Error);
  });
  it('Should handle "not found" correctly', async () => {
    // Get car with big id (which is correct, but has low probability of existing)
    await expect(async () => {
      const result = await controller.getCar(100500);
    }).rejects.toThrow("Requested car not found");
  });
});

describe('updateCar tests', () => {
  it('Should return new data', async () => {
    const data = {
      name: 'Some new name',
      color: '#aabbcc'
    };
    const result = await controller.updateCar(1, data);
    expect(result).toEqual({id: 1, ...data});
  });
  it('Should correctly update info', async () => {
    const data = {
      name: 'Some new name',
      color: '#aabbcc'
    };
    await controller.updateCar(1, data);
    const data2 = {
      name: 'Another name',
      color: '#eeeeee'
    };
    await controller.updateCar(1, data2);
    const result = await controller.getCar(1);
    console.log(result);
    expect(result).not.toEqual({id: 1, ...data});
    expect(result).toEqual({id: 1, ...data2});
  });
  it('Should throw on incorrect id', async () => {
    await expect(async () => {
      await controller.updateCar(-1, {name: '1', color: '#123123'});
    }).rejects.toThrow(Error);
    await expect(async () => {
      await controller.updateCar(undefined as unknown as number, {name: '1', color: '#123123'});
    }).rejects.toThrow(Error);
  });
  it('Should handle "not found" correctly', async () => {
    await expect(async () => {
      await controller.updateCar(100500, {name: '1', color: '#123123'});
    }).rejects.toThrow('Requested car not found');
  });
});