import StorageController from './storageController';
import MainView from '../views/mainView';

export default class AppController {
    mainView: MainView;
    storageController: StorageController;

    constructor() {
        this.storageController = new StorageController();
        this.mainView = new MainView(document.body, this.storageController);
    }
}
