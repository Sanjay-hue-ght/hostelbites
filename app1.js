// =========================
// FIREBASE SETUP
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCxH-CpLuqXyuJkBtVo5atnguXiHOv38",
  authDomain: "hostelbites-c98ad.firebaseapp.com",
  projectId: "hostelbites-c98ad",
  storageBucket: "hostelbites-c98ad.firebasestorage.app",
  messagingSenderId: "774397700078",
  appId: "1:774397700078:web:02acf87df8b631bb9cd0ff"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =========================
// DEFAULT PRODUCTS
// =========================
const defaultProducts = [

  {
    id: 1,
    name: 'Green Masala Chips',
    category: 'Chips',
    price: 20,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=85',
    note: 'Classic crunchy masala'
  },

  {
    id: 2,
    name: 'Orange Crunch Chips',
    category: 'Chips',
    price: 20,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=700&q=85',
    note: 'Tangy tomato flavour'
  },

  {
    id: 3,
    name: 'Chocolate Cookie Pack',
    category: 'Biscuits',
    price: 30,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=85',
    note: 'Choco-filled cookies'
  },

  {
    id: 4,
    name: 'Milk Chocolate Bar',
    category: 'Chocolate',
    price: 40,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1548907040-4d42f2d2b2dc?auto=format&fit=crop&w=700&q=85',
    note: 'Smooth & creamy'
  },

  {
    id: 5,
    name: 'Salted Potato Chips',
    category: 'Chips',
    price: 20,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=85',
    note: 'Simple salted crunch'
  },

  {
    id: 6,
    name: 'Cream Biscuit Pack',
    category: 'Biscuits',
    price: 25,
    stock: 17,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=85',
    note: 'Vanilla cream biscuit'
  },

  {
    id: 8,
    name: 'Dark Chocolate Bites',
    category: 'Chocolate',
    price: 35,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=700&q=85',
    note: 'Rich dark chocolate'
  }

];


// =========================
// HELPER FUNCTIONS
// =========================
const $ = s => document.querySelector(s);

const money = n =>
  '₹' + Number(n || 0).toLocaleString('en-IN');


// =========================
// VARIABLES
// =========================
let products = [];

let cart =
  JSON.parse(localStorage.getItem('hb_cart')) || [];

let orders = [];

let shopOpen = true;

let filter = 'All';


// =========================
// FIREBASE PRODUCT FUNCTIONS
// =========================

async function saveProductToFirebase(product) {

  await setDoc(
    doc(
      db,
      'products',
      String(product.id)
    ),
    product
  );

}


async function deleteProductFromFirebase(id) {

  await deleteDoc(
    doc(
      db,
      'products',
      String(id)
    )
  );

}


// =========================
// FIREBASE ORDER FUNCTIONS
// =========================

async function saveOrderToFirebase(order) {

  const firebaseId =
    order.firebaseId ||
    String(order.id);

  const data = {
    ...order
  };

  delete data.firebaseId;

  await setDoc(
    doc(
      db,
      'orders',
      firebaseId
    ),
    data
  );

  return firebaseId;

}


async function deleteOrderFromFirebase(firebaseId) {

  await deleteDoc(
    doc(
      db,
      'orders',
      firebaseId
    )
  );

}


// =========================
// FIREBASE SHOP STATUS
// =========================

async function saveShopStatusToFirebase(open) {

  await setDoc(
    doc(
      db,
      'settings',
      'shop'
    ),
    {
      open
    }
  );

}


// =========================
// LOAD FIREBASE DATA
// =========================

async function loadFirebaseData() {

  try {

    // =========================
    // LOAD PRODUCTS
    // =========================

    const productSnapshot =
      await getDocs(
        collection(
          db,
          'products'
        )
      );


    // If no products exist,
    // create default products

    if (productSnapshot.empty) {

      for (
        const p of defaultProducts
      ) {

        await saveProductToFirebase(p);

      }

      products = [
        ...defaultProducts
      ];

    }

    else {

      products =
        productSnapshot.docs.map(
          d => ({

            ...d.data(),

            id: Number(d.id),

            price:
              Number(
                d.data().price || 0
              ),

            stock:
              Number(
                d.data().stock || 0
              )

          })
        );

    }


    // Remove drinks

    products =
      products

        .filter(
          p =>
            p.category !== 'Drinks'
        )

        .map(
          p => ({

            ...p,

            image:
              p.image ||

              defaultProducts.find(
                d =>
                  d.id === p.id
              )?.image ||

              ''

          })
        );


    // =========================
    // LOAD ORDERS
    // =========================

    const orderSnapshot =
      await getDocs(
        collection(
          db,
          'orders'
        )
      );


    orders =
      orderSnapshot.docs

        .map(
          d => ({

            ...d.data(),

            firebaseId: d.id,

            id:
              Number(
                d.data().id ||
                d.id
              ),

            total:
              Number(
                d.data().total || 0
              )

          })
        )

        .sort(
          (a, b) =>
            b.id - a.id
        );


    // =========================
    // LOAD SHOP STATUS
    // =========================

    const shopSnapshot =
      await getDoc(
        doc(
          db,
          'settings',
          'shop'
        )
      );


    if (
      shopSnapshot.exists()
    ) {

      shopOpen =
        shopSnapshot
          .data()
          .open !== false;

    }

    else {

      shopOpen = true;

      await saveShopStatusToFirebase(
        true
      );

    }


    // =========================
    // DISPLAY
    // =========================

    renderProducts();

    renderCart();


    // Open admin login
    // if ?admin is present

    if (
      new URLSearchParams(
        location.search
      ).has('admin')
    ) {

      $('#adminDialog')
        .showModal();

    }

  }

  catch (error) {

    console.error(
      'Firebase loading error:',
      error
    );

    toast(
      'Could not load data from Firebase.'
    );

  }

}


// =========================
// LOCAL CART
// =========================

function saveCart() {

  localStorage.setItem(
    'hb_cart',
    JSON.stringify(cart)
  );

}


// =========================
// RENDER PRODUCTS
// =========================

function renderProducts() {

  products =
    products.filter(
      p =>
        p.category !== 'Drinks'
    );


  let q =
    $('#searchInput')
      .value
      .toLowerCase();


  let list =
    products.filter(
      p =>

        (
          filter === 'All' ||
          p.category === filter
        )

        &&

        p.name
          .toLowerCase()
          .includes(q)

    );


  $('#productCount')
    .textContent =

      list.length +

      ' snack' +

      (
        list.length !== 1
          ? 's'
          : ''
      ) +

      ' available';


  $('#products').innerHTML =

    list.map(
      p => `

      <article class="product">

        <div
          class="product-image"
          data-label="${p.name.replaceAll(
            ' ',
            '&#10;'
          )}"
        >

          <img
            src="${p.image}"
            alt="${p.name}"
            loading="lazy"
            onerror="this.remove()"
          >

        </div>


        <span class="tag">
          ${p.category.toUpperCase()}
        </span>


        <h3>
          ${p.name}
        </h3>


        <p>
          ${p.note || 'Hostel favourite'}
        </p>


        <div class="product-bottom">

          <b>
            ${money(p.price)}
          </b>


          ${
            p.stock > 0 && shopOpen

            ?

            `
              <button
                class="add"
                onclick="addToCart(${p.id})"
              >
                +
              </button>
            `

            :

            `
              <span class="sold">
                OUT OF STOCK
              </span>
            `
          }

        </div>

      </article>

      `
    ).join('');


  $('#shopStatus')
    .textContent =

      shopOpen

        ? 'Shop is open'

        : 'Shop is currently closed';

}


// =========================
// RENDER CART
// =========================

function renderCart() {

  let total =
    cart.reduce(
      (a, c) =>
        a + c.price * c.qty,
      0
    );


  $('#cartCount')
    .textContent =

      cart.reduce(
        (a, c) =>
          a + c.qty,
        0
      );


  $('#cartTotal')
    .textContent =
      money(total);


  $('#cartItems').innerHTML =

    cart.length

      ?

      cart.map(
        c => `

        <div class="cart-row">

          <img
            src="${c.image}"
            alt=""
          >

          <div>

            <h4>
              ${c.name}
            </h4>

            <p>
              ${money(c.price)} each
            </p>

          </div>

          <div class="quantity">

            <button
              onclick="changeQty(${c.id},-1)"
            >
              −
            </button>

            ${c.qty}

            <button
              onclick="changeQty(${c.id},1)"
            >
              +
            </button>

          </div>

        </div>

        `
      ).join('')

      :

      '<p>Your bag is empty. Add a few favourites!</p>';

}


// =========================
// ADD TO CART
// =========================

function addToCart(id) {

  let p =
    products.find(
      p => p.id === id
    );


  let item =
    cart.find(
      c => c.id === id
    );


  if (!p)
    return;


  if (!shopOpen)

    return toast(
      'The shop is currently closed.'
    );


  if (item) {

    if (
      item.qty >= p.stock
    )

      return toast(
        'Only ' +
        p.stock +
        ' left in stock.'
      );


    item.qty++;

  }

  else {

    cart.push({

      ...p,

      qty: 1

    });

  }


  saveCart();

  renderCart();


  toast(
    p.name +
    ' added to your bag'
  );

}


// =========================
// CHANGE QUANTITY
// =========================

function changeQty(id, d) {

  let item =
    cart.find(
      c => c.id === id
    );


  let p =
    products.find(
      p => p.id === id
    );


  if (
    !item ||
    !p
  )
    return;


  if (
    d > 0 &&
    item.qty >= p.stock
  )

    return toast(
      'Maximum available stock reached.'
    );


  item.qty += d;


  if (
    item.qty < 1
  ) {

    cart =
      cart.filter(
        c => c.id !== id
      );

  }


  saveCart();

  renderCart();

}


window.addToCart =
  addToCart;

window.changeQty =
  changeQty;


// =========================
// TOAST
// =========================

function toast(text) {

  let t =
    $('#toast');


  t.textContent =
    text;


  t.classList.add(
    'show'
  );


  setTimeout(
    () =>
      t.classList.remove(
        'show'
      ),
    2800
  );

}


// =========================
// CATEGORY BUTTONS
// =========================

$('.categories').onclick =
  e => {

    if (
      e.target.tagName !==
      'BUTTON'
    )
      return;


    filter =
      e.target.dataset.cat;


    document
      .querySelectorAll(
        '.categories button'
      )
      .forEach(
        b =>
          b.classList.toggle(
            'active',
            b === e.target
          )
      );


    renderProducts();

  };


// =========================
// SEARCH
// =========================

$('#searchInput').oninput =
  renderProducts;


// =========================
// OPEN CART
// =========================

$('#cartOpen').onclick =
  () => {

    $('#cartDrawer')
      .classList
      .add('open');

    $('#overlay')
      .classList
      .add('show');

  };


// =========================
// CLOSE CART
// =========================

$('.close').onclick =
  () => {

    $('#cartDrawer')
      .classList
      .remove('open');

    $('#overlay')
      .classList
      .remove('show');

  };


$('#overlay').onclick =
  $('.close').onclick;


// =========================
// CHECKOUT
// =========================

$('#checkout').onclick =
  () => {

    if (!cart.length)

      return toast(
        'Your bag is empty.'
      );


    $('#orderDialog')
      .showModal();

  };


// =========================
// CLOSE DIALOGS
// =========================

document
  .querySelectorAll(
    '.dialog-close'
  )
  .forEach(
    b =>
      b.onclick =
        () =>
          b.closest(
            'dialog'
          ).close()
  );


// =========================
// CUSTOMER ORDER
// =========================

$('#orderForm').onsubmit =
  async e => {

    e.preventDefault();


    if (!cart.length)

      return toast(
        'Your bag is empty.'
      );


    let d =
      Object.fromEntries(
        new FormData(
          e.target
        )
      );


    let total =
      cart.reduce(
        (a, c) =>
          a + c.price * c.qty,
        0
      );


    // CHECK STOCK AGAIN

    for (
      const c of cart
    ) {

      const p =
        products.find(
          p =>
            p.id === c.id
        );


      if (
        !p ||
        p.stock < c.qty
      ) {

        return toast(
          'Not enough stock for ' +
          c.name
        );

      }

    }


    // CREATE ORDER

    const newOrder = {

      id: Date.now(),

      ...d,

      items:

        cart.map(
          c => ({

            name: c.name,

            qty: c.qty,

            price: c.price

          })
        ),

      total: total,

      date:
        new Date()
          .toLocaleString(
            'en-IN'
          ),

      status: 'NEW'

    };


    try {

      // SAVE ORDER

      const firebaseId =
        await saveOrderToFirebase(
          newOrder
        );


      newOrder.firebaseId =
        firebaseId;


      orders.unshift(
        newOrder
      );


      // REDUCE STOCK

      for (
        const c of cart
      ) {

        const p =
          products.find(
            p =>
              p.id === c.id
          );


        if (p) {

          p.stock -= c.qty;


          await saveProductToFirebase(
            p
          );

        }

      }


      // CLEAR CART

      cart = [];

      saveCart();


      renderProducts();

      renderCart();


      $('#orderDialog')
        .close();


      e.target.reset();


      toast(
        'Order placed! We’ll deliver to ' +
        d.room +
        '.'
      );


      // WHATSAPP

      let text =
        encodeURIComponent(

          `New HostelBites order
Name: ${d.name}
Phone: ${d.phone}
Room: ${d.room}
Items: ${newOrder.items
  .map(
    i =>
      i.name +
      ' x' +
      i.qty
  )
  .join(', ')}
Total: ${money(total)}`

        );


      setTimeout(
        () => {

          window.open(
            'https://wa.me/918939009198?text=' +
            text,
            '_blank'
          );

        },
        700
      );

    }


    catch (error) {

      console.error(
        'Order save error:',
        error
      );


      toast(
        'Order could not be saved. Please try again.'
      );

    }

  };


// =========================
// ADMIN LOGIN
// =========================

if (
  new URLSearchParams(
    location.search
  ).has('admin')
)

  $('#adminDialog')
    .showModal();


$('#adminOpen').onclick =
  () =>
    $('#adminDialog')
      .showModal();


// =========================
// ADMIN LOGIN FORM
// =========================

$('#loginForm').onsubmit =
  e => {

    e.preventDefault();


    let d =
      Object.fromEntries(
        new FormData(
          e.target
        )
      );


    if (

      [
        '8939009198',
        '8122881704'
      ].includes(
        d.adminPhone
      )

      &&

      d.password ===
        '575468'

    ) {

      $('#adminDialog')
        .close();


      $('#dashboard')
        .classList
        .remove('hidden');


      renderDashboard();


      toast(
        'Welcome to the admin dashboard'
      );

    }

    else {

      toast(
        'Access denied. Check the authorised number and passcode.'
      );

    }

  };


// =========================
// LOGOUT
// =========================

$('#logout').onclick =
  () => {

    $('#dashboard')
      .classList
      .add('hidden');


    history.replaceState(
      {},
      '',
      location.pathname
    );

  };


// =====================================================
// ADMIN DASHBOARD
// INVENTORY + WEEKLY SALES + RECENT ORDERS
// =====================================================

function renderDashboard() {

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  let sales =
    orders.reduce(
      (a, o) =>
        a +
        Number(
          o.total || 0
        ),
      0
    );


  let profit =
    orders.reduce(
      (a, o) =>
        a +
        Number(
          o.total || 0
        ) * 0.28,
      0
    );


  let units =
    orders.reduce(
      (a, o) =>
        a +

        (o.items || [])
          .reduce(
            (x, i) =>
              x +
              Number(
                i.qty || 0
              ),
            0
          ),

      0
    );


  $('#stats').innerHTML = [

    [
      'Total sales',
      money(sales),
      'All recorded orders'
    ],

    [
      'Estimated profit',
      money(
        Math.round(
          profit
        )
      ),
      'Based on 28% margin'
    ],

    [
      'Orders',
      orders.length,
      'Since store launch'
    ],

    [
      'Items sold',
      units,
      'Across all products'
    ]

  ]

    .map(
      s => `

      <div class="stat">

        <p>
          ${s[0]}
        </p>

        <b>
          ${s[1]}
        </b>

        <small>
          ${s[2]}
        </small>

      </div>

      `
    )

    .join('');


  // =========================
  // SHOP STATUS
  // =========================

  $('#shopToggle')
    .checked =
      shopOpen;


  // =================================================
  // WEEKLY SALES
  // =================================================

  const now =
    new Date();


  const day =
    now.getDay();


  const monday =
    new Date(now);


  monday.setHours(
    0,
    0,
    0,
    0
  );


  monday.setDate(
    now.getDate() -
    (
      day === 0
        ? 6
        : day - 1
    )
  );


  let days = [

    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'

  ];


  let vals =
    days.map(
      (_, i) => {

        const start =
          new Date(
            monday
          );


        start.setDate(
          monday.getDate() +
          i
        );


        start.setHours(
          0,
          0,
          0,
          0
        );


        const end =
          new Date(
            start
          );


        end.setDate(
          start.getDate() +
          1
        );


        return orders

          .filter(
            o => {

              const orderDate =
                new Date(
                  Number(o.id)
                );


              return (

                orderDate >=
                  start

                &&

                orderDate <
                  end

                &&

                o.status !==
                  'CANCELLED'

              );

            }
          )

          .reduce(
            (a, o) =>
              a +
              Number(
                o.total || 0
              ),
            0
          );

      }
    );


  let max =
    Math.max(
      ...vals,
      100
    );


  $('#weeklySales')
    .innerHTML =

      vals

        .map(
          (v, i) => `

          <div
            class="bar"
            style="height:${Math.max(
              12,
              v / max * 120
            )}px"
            title="${money(v)}"
          >

            <span>
              ${days[i]}
            </span>

          </div>

          `
        )

        .join('');


  // =================================================
  // INVENTORY
  // =================================================

  $('#inventory')
    .innerHTML =

      products

        .map(
          p => `

          <div
            class="inventory-row"
          >

            <div>

              <b>
                ${p.name}
              </b>

              <small>
                ${p.category}
              </small>

            </div>


            <div>
              ${money(p.price)}
            </div>


            <div
              class="stock ${
                p.stock < 6
                  ? 'low'
                  : ''
              }"
            >

              ${p.stock}

              ${
                p.stock === 0

                  ? 'out of stock'

                  : 'in stock'
              }

            </div>


            <div>

              <button
                class="edit-btn"
                onclick="editProduct(${p.id})"
              >
                Edit
              </button>


              <button
                class="delete-btn"
                onclick="deleteProduct(${p.id})"
              >
                Delete
              </button>

            </div>

          </div>

          `
        )

        .join('');


  // =================================================
  // RECENT ORDERS
  // =================================================

  $('#orderLabel')
    .textContent =
      orders.length +
      ' recorded';


  $('#orders')
    .innerHTML =

      orders.length

        ?

        orders

          .slice()

          .sort(
            (a, b) =>
              b.id - a.id
          )

          .slice(
            0,
            8
          )

          .map(
            o => `

            <div
              class="order-row"
            >

              <div>

                <b>
                  ${o.name ||
                    'Customer'}
                </b>

                <small>
                  ${o.date || ''}
                </small>

              </div>


              <div>

                ${o.room || ''}

                <small>
                  ${o.phone || ''}
                </small>

              </div>


              <div>

                ${(o.items || [])

                  .map(
                    i =>
                      i.name +
                      ' ×' +
                      i.qty
                  )

                  .join(', ')}

              </div>


              <div>

                <b>
                  ${money(
                    o.total
                  )}
                </b>


                <small
                  class="status"
                >
                  ${o.status ||
                    'NEW'}
                </small>


                <span
                  class="order-actions"
                >

                  <button
                    class="edit-btn"
                    onclick="editOrder(${o.id})"
                  >
                    Edit
                  </button>


                  <button
                    class="delete-btn"
                    onclick="deleteOrder(${o.id})"
                  >
                    Delete
                  </button>

                </span>

              </div>

            </div>

            `
          )

          .join('')

        :

        `
        <p style="color:#748279">
          No orders yet.
          Your order history will appear here.
        </p>
        `;

}


// =========================
// SHOP OPEN / CLOSE
// =========================

$('#shopToggle').onchange =
  async e => {

    const old =
      shopOpen;


    shopOpen =
      e.target.checked;


    try {

      await saveShopStatusToFirebase(
        shopOpen
      );


      renderProducts();


      toast(
        'Shop marked ' +
        (
          shopOpen
            ? 'open'
            : 'closed'
        )
      );

    }

    catch (error) {

      shopOpen =
        old;


      e.target.checked =
        old;


      console.error(
        'Shop status error:',
        error
      );


      toast(
        'Could not update shop status.'
      );

    }

  };


// =====================================================
// EDIT PRODUCT
// PRICE + STOCK
// =====================================================

window.editProduct =
  id => {

    let p =
      products.find(
        p =>
          p.id === id
      );


    let f =
      $('#productForm');


    if (!p)
      return;


    Object.entries(p)
      .forEach(
        ([k, v]) => {

          if (
            f.elements[k]
          )

            f.elements[k]
              .value = v;

        }
      );


    $('#productDialogTitle')
      .textContent =
        'Edit ' +
        p.name;


    $('#productDialog')
      .showModal();

  };


// =====================================================
// DELETE PRODUCT
// =====================================================

window.deleteProduct =
  async id => {

    if (
      !confirm(
        'Remove this product from the store?'
      )
    )

      return;


    try {

      await deleteProductFromFirebase(
        id
      );


      products =
        products.filter(
          p =>
            p.id !== id
        );


      cart =
        cart.filter(
          c =>
            c.id !== id
        );


      saveCart();


      renderDashboard();

      renderProducts();

      renderCart();


      toast(
        'Product deleted'
      );

    }

    catch (error) {

      console.error(
        'Product delete error:',
        error
      );


      toast(
        'Could not delete product.'
      );

    }

  };


// =====================================================
// ADD PRODUCT
// =====================================================

$('#addProduct').onclick =
  () => {

    let f =
      $('#productForm');


    f.reset();


    f.elements.id.value =
      '';


    $('#productDialogTitle')
      .textContent =
        'Add product';


    $('#productDialog')
      .showModal();

  };


// =====================================================
// PRODUCT FORM
// SAVE PRICE + STOCK TO FIREBASE
// =====================================================

$('#productForm').onsubmit =
  async e => {

    e.preventDefault();


    let d =
      Object.fromEntries(
        new FormData(
          e.target
        )
      );


    d.price =
      Number(
        d.price
      );


    d.stock =
      Number(
        d.stock
      );


    if (
      d.price < 0 ||
      d.stock < 0
    )

      return toast(
        'Price and stock cannot be negative.'
      );


    try {

      // =========================
      // EDIT PRODUCT
      // =========================

      if (d.id) {

        let i =
          products.findIndex(
            p =>
              p.id == d.id
          );


        if (i < 0)

          return toast(
            'Product not found.'
          );


        products[i] = {

          ...products[i],

          ...d,

          id:
            Number(
              d.id
            )

        };


        await saveProductToFirebase(
          products[i]
        );

      }


      // =========================
      // ADD PRODUCT
      // =========================

      else {

        d.id =
          Date.now();


        const newProduct = {

          ...d,

          id: d.id,

          note:
            'New HostelBites pick',

          image:
            d.image || ''

        };


        products.push(
          newProduct
        );


        await saveProductToFirebase(
          newProduct
        );

      }


      $('#productDialog')
        .close();


      renderDashboard();

      renderProducts();


      toast(
        'Price and stock saved to Firebase'
      );

    }

    catch (error) {

      console.error(
        'Product save error:',
        error
      );


      toast(
        'Could not save product to Firebase.'
      );

    }

  };


// =====================================================
// EDIT ORDER
// =====================================================

window.editOrder =
  id => {

    let o =
      orders.find(
        o =>
          o.id === id
      );


    let f =
      $('#orderEditForm');


    if (!o)
      return;


    [
      'id',
      'name',
      'phone',
      'room',
      'status'
    ]

      .forEach(
        k => {

          f.elements[k]
            .value =
              o[k] ||
              'NEW';

        }
      );


    $('#orderEditDialog')
      .showModal();

  };


// =====================================================
// DELETE ORDER
// =====================================================

window.deleteOrder =
  async id => {

    if (
      !confirm(
        'Delete this order permanently?'
      )
    )

      return;


    const o =
      orders.find(
        o =>
          o.id === id
      );


    if (!o)
      return;


    try {

      await deleteOrderFromFirebase(

        o.firebaseId ||
        String(o.id)

      );


      orders =
        orders.filter(
          o =>
            o.id !== id
        );


      renderDashboard();


      toast(
        'Order deleted'
      );

    }

    catch (error) {

      console.error(
        'Order delete error:',
        error
      );


      toast(
        'Could not delete order.'
      );

    }

  };


// =====================================================
// EDIT ORDER FORM
// =====================================================

$('#orderEditForm').onsubmit =
  async e => {

    e.preventDefault();


    let d =
      Object.fromEntries(
        new FormData(
          e.target
        )
      );


    let o =
      orders.find(
        o =>
          o.id == d.id
      );


    if (!o)
      return;


    try {

      // =========================
      // CANCEL ORDER
      // RETURN STOCK
      // =========================

      if (

        o.status !==
          'CANCELLED'

        &&

        d.status ===
          'CANCELLED'

      ) {

        for (
          const i of
            o.items || []
        ) {

          let p =
            products.find(
              p =>
                p.name ===
                i.name
            );


          if (p) {

            p.stock +=
              Number(
                i.qty
              );


            await saveProductToFirebase(
              p
            );

          }

        }

      }


      // =========================
      // UPDATE ORDER
      // =========================

      Object.assign(
        o,
        {

          name:
            d.name,

          phone:
            d.phone,

          room:
            d.room,

          status:
            d.status

        }
      );


      // SAVE TO FIREBASE

      await saveOrderToFirebase(
        o
      );


      $('#orderEditDialog')
        .close();


      renderDashboard();

      renderProducts();


      toast(
        'Order updated'
      );

    }

    catch (error) {

      console.error(
        'Order update error:',
        error
      );


      toast(
        'Could not update order.'
      );

    }

  };


// =====================================================
// EXPORT SALES
// =====================================================

$('#exportSales').onclick =
  () => {

    let rows = [

      [
        'Order ID',
        'Date',
        'Name',
        'Phone',
        'Room',
        'Items',
        'Total'
      ],

      ...orders.map(
        o => [

          o.id,

          o.date,

          o.name,

          o.phone,

          o.room,

          (o.items || [])

            .map(
              i =>
                i.name +
                ' x' +
                i.qty
            )

            .join('; '),

          o.total

        ]
      )

    ];


    let a =
      document.createElement(
        'a'
      );


    a.href =
      URL.createObjectURL(

        new Blob(

          [

            rows

              .map(
                r =>

                  r

                    .map(
                      v =>

                        '"' +
                        String(v)
                          .replaceAll(
                            '"',
                            '""'
                          ) +
                        '"'
                    )

                    .join(',')

              )

              .join('\n')

          ],

          {
            type:
              'text/csv'
          }

        )

      );


    a.download =
      'hostelbites-sales.csv';


    a.click();


    URL.revokeObjectURL(
      a.href
    );

  };


// =========================
// START APPLICATION
// =========================

loadFirebaseData();
