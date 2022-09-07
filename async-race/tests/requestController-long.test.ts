import fetch from 'node-fetch';
jest.setTimeout(20000);
import RequestController, { EngineStates } from '../src/controllers/requestController';
// @ts-expect-error Browser fetch signature differs with node-fetch. Possibly fixable by using separate ts setup for tests
global.fetch = fetch;
// All api tests depend on local hosted server calls (and will fail when server is not running).
// Some tests require that there is a car with id = 1
// TODO: Add mock or mock fallback
const controller = new RequestController('https://async-race-api.kartearis.xyz');

// These tests violate a rule saying tests must be fast. Can be fixed by ditching external server and
// using stabs
describe('evaluateDriving tests', () => {
    const retries = 10;
    it('Should evaluate to success', async () => {
        let result = false;
        for (let i = 0; i < retries; i++) {
            await controller.toggleEngine(1, EngineStates.START);
            result = await controller.evaluateDriving(1);
            if (result) break;
        }
        expect(result).toBeTruthy();
    });
    it('Should evaluate to failure', async () => {
        let result = true;
        for (let i = 0; i < retries; i++) {
            await controller.toggleEngine(1, EngineStates.START);
            result = await controller.evaluateDriving(1);
            if (!result) break;
        }
        expect(result).toBeFalsy();
    });
    it('Should throw on second drive', async () => {
        await controller.toggleEngine(1, EngineStates.START);
        await expect(async () =>
            Promise.race([controller.evaluateDriving(1), controller.evaluateDriving(1)])
        ).rejects.toThrow('Cannot evaluate the same car several times');
    });
    it('Should handle "not found"', async () => {
        await expect(async () => {
            await controller.evaluateDriving(100500);
        }).rejects.toThrow('Requested has not started before');
    });
});
