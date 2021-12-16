export class Table {
  constructor(id) {
    this.id = id;
    this.name = "Table-" + id;
    this.amount = 0;
    this.totalItems = 0;
    this.orders = [];
  }
}

export class Order {
  constructor(name, quantity) {
    this.name = name;
    this.quantity = quantity;
  }
}

//class for storage and retrieval of data from session storage
export class Persist {
  constructor(sessionStorage, store) {
    this.sessionStorage = sessionStorage;
    this.store = store;
  }

  getData() {
    return JSON.parse(this.sessionStorage.getItem(this.store));
  }

  setData(object) {
    this.sessionStorage.setItem(this.store, JSON.stringify(object));
  }
}
