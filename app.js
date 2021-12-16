import { Order, Persist, Table } from "./tableOrderClasses.js";

let dishList = document.getElementById("dishList");
let dishes = []; // array to hold dishes from json file
//function to load dishes from an external json file'
let doSome = async () => {
  let promise = await fetch("./foodDishes.json");
  let data = await promise.json();
  localStorage.setItem("dishStore", JSON.stringify(data));
  console.log("data stored");
};

doSome();

const loadDishes = async () => {
  try {
    const res = await fetch("foodDishes.json");
    dishes = await res.json();
    displayDishes(dishes);
    let promiseOther = new Promise(appWork);
    let data1 = await promiseOther;
    console.log(data1);
  } catch (err) {
    console.error(err);
  }
};

//function to displayDishes
const displayDishes = (dishesList) => {
  let htmlString = dishesList
    .map((dish) => {
      return `
      <div class="draggable" id="draggable" draggable="true">
        <li dishID="${dish.id}" class="dish">
          <p>${dish.name}</p>
          <p class='price'>Rs.${dish.price}</p>
        </li>
      </div>`;
    })
    .join(" ");
  dishList.innerHTML = htmlString;
};

//function to load the dishes details on the landing page
loadDishes();

//event listener for the search bar
searchBar.addEventListener("keyup", (e) => {
  const searchString = e.target.value.toLowerCase();
  const filteredDishes = dishes.filter((dish) => {
    return dish.name.toLowerCase().includes(searchString);
  });
  displayDishes(filteredDishes);
});

sessionStorage.clear();
let tables = [new Table(1), new Table(2), new Table(3)];
let persist = new Persist(sessionStorage, "tableStore");
persist.setData(tables);
displayTables(persist.getData());

let tableNoCLick = null;
//modal code
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tableNoCLick = button.getAttribute("tableNo");
    const modal = document.querySelector(button.dataset.modalTarget);
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

//drag and drop
function appWork(res, rej) {
  let dataSet = JSON.parse(localStorage.getItem("dishStore"));
  let draggables = document.querySelectorAll(".draggable");
  console.log(draggables);
  let containers = document.querySelectorAll(".table-card");

  function extractDistData(id) {
    let dishData = dataSet.find((data) => data.id == id);
    return dishData;
  }

  let orderData = new Order(null, null);
  let tableNo = null;

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      let dishID = draggable.children[0].getAttribute("dishID");
      Object.assign(orderData, extractDistData(dishID));
      console.log(JSON.stringify(orderData));
    });
  });

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragend", () => {
      let dishID = draggable.children[0].getAttribute("dishID");
      console.log(tableNo);
      if (tableNo !== null) {
        let tables = persist.getData();
        let order = new Order(orderData.name, orderData.price);
        let table = tables[tableNo - 1];
        table.orders.push(order);
        table.amount += orderData.price;
        table.totalItems += 1;
        tables[tableNo - 1] = table;
        persist.setData(tables);
        orderData = new Order(null, null);
        //tableNo = null;
        let liTable = document.getElementsByClassName(`table-card`);
        let index = Number(tableNo) - 1;
        liTable[index].innerHTML = `
      <h2>${table.name}</h2>
      <p>Rs.${table.amount} | Total Items: ${table.totalItems}</p>`;
        tableNo = null;
      }
    });
  });

  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      tableNo = container.getAttribute("tableNo");
    });
  });
  res("done!");
}

//funcrion to display the tableList in the landing page
function displayTables(tables) {
  let tableList = document.getElementById("tableList");
  let htmlString = tables
    .map((table) => {
      return `<li tableNo=${table.id} data-modal-target="#modal" class="table-card">
            <h2>${table.name}</h2>
            <p>Rs.${table.amount} | Total Items: ${table.totalItems}</p>
          </li>`;
    })
    .join(" ");
  tableList.innerHTML = htmlString;
  return;
}

function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
  updateModal(modal);
}

function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

function updateModal(modal) {
  let modalHeader = modal.querySelector(".title");
  let orderTable = modal.querySelector(".order-table");
  let tables = persist.getData();
  let table = tables[tableNoCLick - 1];
  modalHeader.innerHTML = `${table.name}|Order Details`;
  let orders = table.orders;
  let htmlString = `<tr>
  <td>S.no</td>
  <td>Item</td>
  <td>price</td>
  <td></td>
</tr>`;
  for (let i = 0; i < orders.length; i++) {
    let price = orders[i].price * orders[i].quantity;
    let subString = `
<tr>
<td>${i}</td>
<td>${orders[i].name}</td>
<td>${price}</td>
<td>
  <label for="order-quantity" class="order-quantity-label">Number of servings:</label>
  <input type="number" class="order-quantity" name="order-quantity" id="order-quantity" value="1" min="1"\>
</td>
</tr>
    `;
    htmlString = htmlString + subString;
  }
  orderTable.innerHTML = htmlString;
  let ordersQuantity = document.querySelectorAll(".order-quantity");
  ordersQuantity.forEach((orderQuantity) => {
    orderQuantity.addEventListener("click", (e) => {
      orders[tableNoCLick - 1].quantity += e.target.value > 0 ? 1 : -1;
      table.orders = orders;
      tables[tableNoCLick - 1] = table;
      persist.setData(tables);
      let liTable = document.getElementsByClassName(`table-card`);
      let index = Number(tableNoCLick) - 1;
      let amount = 0;
      for (let order of orders) {
        amount += order.quantity * order.price;
      }
      liTable[index].innerHTML = `
      <h2>${table.name}</h2>
      <p>Rs.${amount} | Total Items: ${table.totalItems}</p>`;
      orderQuantity.setAttribute("value", e.target.value);
    });
  });
}
