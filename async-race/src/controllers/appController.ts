import GarageView from "../views/garageView";
import RecordsView from "../views/recordsView";
import StorageController from "./storageController";
import MainView from "../views/mainView";


export default class AppController {
  mainView: MainView
  storageController: StorageController

  constructor() {
    this.mainView = new MainView(document.body);
    this.storageController = new StorageController();
  }

  init(): void {

  }
}