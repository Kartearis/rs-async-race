import GarageView from "../views/garageView";
import RecordsView from "../views/recordsView";
import StorageController from "./storageController";


export default class AppController {
  garageView: GarageView
  recordsView: RecordsView
  storageController: StorageController

  constructor() {
    this.garageView = new GarageView();
    this.recordsView = new RecordsView();
    this.storageController = new StorageController();
  }

  init(): void {

  }
}