import { CarData, TypeOrder, TypeSort } from "./requestController";

export type GarageStorage = {
  currentPage: number,
  currentlySelectedCar: CarData | null,
  currentNameInput: string,
  currentColorInput: string
};

export type RecordStorage = {
  currentPage: number,
  currentSortField: TypeSort,
  currentSortOrder: TypeOrder
};

type Storage = {
  garage: GarageStorage,
  records: RecordStorage
};
/*
  Provides centralized storage to other app parts
  Also may handle persistent storage?
 */
export default class StorageController {
  #storage: Storage

  constructor() {
    this.#storage = {
      garage: {
        currentPage: 1,
        currentlySelectedCar: null,
        currentNameInput: "",
        currentColorInput: ""
      },
      records: {
        currentPage: 1,
        currentSortField: TypeSort.ID,
        currentSortOrder: TypeOrder.ASC
      }
    }
  }

  getStorage(key: keyof Storage): GarageStorage | RecordStorage {
    return this.#storage[key];
  }
}