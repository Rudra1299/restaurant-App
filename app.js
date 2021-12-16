import { Order, Persist, Table } from "./tableOrderClasses.js";

const dishList = document.getElementById("dishList");
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
    console.log(dishes);
    console.log(typeof dishes);
    displayDishes(dishes);
  } catch (err) {
    console.error(err);
  }
};

//function to displayDishes
const displayDishes = (dishesList) => {
  const htmlString = dishesList
    .map((dish) => {
      return `
      <div class="dragabble" draggable="true">
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

let tableNoCLick = null;
//modal code
const openModalButtons = document.querySelectorAll("[data-modal-target");
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

//drag and drop

var dataSet = JSON.parse(localStorage.getItem("dishStore"));

const draggables = document.querySelectorAll(".draggable");
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

function updateModal(modal) {
  let modalHeader = modal.querySelector(".title");
  let orderTable = modal.querySelector(".order-table");
  let tables = persist.getData();
  let table = tables[tableNoCLick - 1];
  modalHeader.innerHTML = `${table.name}|Order Details`;
  let orders = table.orders;
  console.log(orders);
  let htmlString = `<tr>
  <td>S.no</td>
  <td>Item</td>
  <td>price</td>
  <td></td>
</tr>`;
  for (let i = 0; i < orders.length; i++) {
    let subString = `
<tr>
<td>${i}</td>
<td>${orders[i].name}</td>
<td>${orders[i].price}</td>
<td>
  <label for="order-quantity" class="order-quantity-label">Number of servings:</label>
  <input type="number" name="order-quantity" id="order-quantity"\>
</td>
</tr>
    `;
    htmlString = htmlString + subString;
  }
  console.log("something");
  orderTable.innerHTML = htmlString;
  console.log(orderTable.innerHTML);
}
