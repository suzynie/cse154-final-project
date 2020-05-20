/**
 * NAME: Qing Nie
 * DATE: Aug 21, 2019
 * SECTION/TA: AB/Tal
 *
 * This is main.js that gives functionalities to main.html, which is
 * the guitar e-commerce store. The functionalities include fetching
 * and displaying product information from the web service, adding
 * items to the cart, and check out items etc.
 */

"use strict";
(function() {

  /* the base of the API of all requests */
  const API_BASE = "/guitar/";

  /* Number of items per row on the product view */
  const ITEMS_PER_ROW = 3;

  /* The amount of time in miliseconds between user submits the form and the form resets */
  const LOADING_TIME = 3000;

  window.addEventListener("load", init);

  /**
   * Initialize the page by adding event listeners to all tabs, the cart icon,
   * product tabs, initialize the DIY form and cart view.
   */
  function init() {
    let tabs = qsa("nav > ul > li");
    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      tab.addEventListener("click", switchTab);
      if (tab.classList.contains("product-tab")) {
        tab.addEventListener("click", fetchProductsData);
      } else {
        tab.addEventListener("click", () => switchToView(tab.id));
      }
    }
    qs("h1").addEventListener("click", () => {
      switchToView("featured");
      qs(".active").classList.remove("active");
      id("featured").classList.add("active");
    });
    initDIYForm();
    initCart();
    id("FAQ").addEventListener("click", fetchFAQ);
  }

  /**
   * Switch between the tabs by displaying the green line under the active tab
   */
  function switchTab() {
    qs(".active").classList.remove("active");
    this.classList.add("active");
  }

  /**
   * Switch to the current view and hide the previous view
   * @param {string} viewName - the name of the view, examples: "featured", "diy" etc.
   */
  function switchToView(viewName) {
    let currentView = qs(".active-view");
    currentView.classList.remove("active-view");
    addHidden(currentView);
    if (currentView.id === "product-view") {
      currentView.innerHTML = "";
    }
    let view = id(viewName + "-view");
    removeHidden(view);
    view.classList.add("active-view");
    addHidden(id("buy-view"));
  }

  /**
   * Fetch the given category's product data when user clicks on a product tab.
   * Does not fetch the existing info when the user is already on the product's page
   */
  function fetchProductsData() {
    let category = this.id;
    let allItems = qsa("#product-view .invent");
    let currentCategoryItems = qsa("#product-view ." + category);

    // to avoid unnecessary fetch
    if (allItems.length !== currentCategoryItems.length || allItems.length === 0) {
      fetch(API_BASE + category)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(handleProductView)
        .catch(handleError);
    }
  }

  /**
   * Populates the product view page with all products with the given category
   * on a certain number of rows.
   * @param {json} resp - the product's info in json format returned from the server
   */
  function handleProductView(resp) {
    id("product-view").innerHTML = "";
    switchToView("product");
    let currentRow;
    for (let i = 0; i < resp.length; i++) {
      if ((i % ITEMS_PER_ROW) === 0) {
        let row = gen("div");
        row.id = "row" + parseInt(1 + i / ITEMS_PER_ROW);
        row.classList.add("flex");
        row.classList.add("row");
        id("product-view").appendChild(row);
        currentRow = row;
      }
      let productInfo = resp[i];
      let productContainer = genProductContainer(productInfo);
      productContainer.id = productInfo["product_id"];
      productContainer.addEventListener("click", fetchOneProduct);
      productContainer.classList.add("invent");
      productContainer.classList.add("center");
      productContainer.classList.add(productInfo["category"]);
      currentRow.appendChild(productContainer);
    }
  }

  /**
   * Fetches the single product's data from the web service
   */
  function fetchOneProduct() {
    if (id("product #" + this.id)) { // to avoid unnecessary fetch
      addHidden(id("product-view"));
      removeHidden(id("buy-view"));
    } else {
      fetch(API_BASE + "product/" + this.id)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(oneProductView)
        .catch(handleError);
    }
  }

  /**
   * Populate the single product view by populating it with the current product's info
   * @param {json} resp - the single product info returned from the web service
   */
  function oneProductView(resp) {
    if (id("add-to-cart")) {
      id("add-to-cart").remove();
    }
    addHidden(id("product-view"));
    removeHidden(id("buy-view"));
    let productInfo = resp[0]; // a json object with only one entry

    /* Not factored out to genProductContainer because I'm just appending the info
       to the existing structure instead of generating a new container for a product */
    let name = productInfo["color"] + " " + productInfo["name"];
    id("buy-img").src = productInfo["img"];
    id("buy-img").alt = name;
    id("product-name").textContent = name;
    id("product-price").textContent = "$" + productInfo["price"];
    let description = productInfo["description"].split("\n");
    let btnSection = id("cart-button-section");
    let cartBtn = gen("button");
    cartBtn.textContent = "Add to Cart";
    cartBtn.id = "add-to-cart";
    btnSection.appendChild(cartBtn);
    cartBtn.addEventListener("click", () => addToCart(productInfo));
    let productChar = id("product-char");
    productChar.innerHTML = "";
    for (let i = 0; i < description.length; i++) {
      let list = gen("li");
      list.textContent = description[i];
      productChar.appendChild(list);
    }
    qs("#buy-view > section").id = "product #" + productInfo["product_id"];
  }

  /**
   * Initialize the cart view by defining behaviors of the shopping cart icon
   * and checkout button
   */
  function initCart() {
    id("shopping-cart").addEventListener("click", () => switchToView("cart"));
    id("submit-order").addEventListener("click", submitOrder);
  }

  /**
   * Submits the order by showing a success message and then set a timer to
   * set the cart view to the original state
   */
  function submitOrder() {
    addHidden(id("cart-sum"));
    removeHidden(id("order-placed-msg"));
    let cartItems = qsa(".cart-item");
    for (let i = 0; i < cartItems.length; i++) {
      cartItems[i].remove();
    }
    let timer = setTimeout(() => {
      removeHidden(id("cart-sum"));
      addHidden(id("order-placed-msg"));
      updatePrice();
      clearTimeout(timer);
    }, LOADING_TIME);
  }

  /**
   * Adds the current item to the cart by creating a container for the item
   * with its information in the cart view and showing the "Added to Cart!" message.
   * @param {json} productInfo - the single product's info in json format
   */
  function addToCart(productInfo) {
    let productName = productInfo["color"] + " " + productInfo["name"];
    let productId = productName.split(" ").join()
      .toLowerCase();
    if (id(productId)) {
      id(productId).querySelector("input").value++;
    } else {
      let cartView = id("cart-view");
      let productContainer = genProductContainer(productInfo);
      productContainer.querySelector(".price").classList.add("single-price");
      productContainer.querySelector("hr").remove();
      let quantity = genQuantity();
      let removeBtn = gen("button");
      removeBtn.textContent = "Remove Item";
      removeBtn.addEventListener("click", () => {
        productContainer.remove();
        updatePrice();
      });
      productContainer.appendChild(quantity);
      productContainer.appendChild(removeBtn);
      productContainer.classList.add("cart-item");
      productContainer.classList.add("flex");
      productContainer.id = productId;
      cartView.appendChild(productContainer);
      addHidden(id("cart-empty-msg"));
    }
    updatePrice();
    id("submit-order").disabled = false;
    toggleCartMsg();
  }

  /**
   * Show the "Added to Cart!" message after user adds an item to the cart
   * and let the message disappear later
   */
  function toggleCartMsg() {
    let cartMsg = id("cart-msg");
    removeHidden(cartMsg);
    let timer = setTimeout(() => {
      addHidden(cartMsg);
      clearTimeout(timer);
    }, LOADING_TIME);
  }

  /**
   * Generate and return a quantity element for each item on the cart view
   * @return {DOMelement} quantity - the DOM element that controls the quantity
   *                                 of an item in the cart
   */
  function genQuantity() {
    let quantity = gen("input");
    quantity.type = "number";
    quantity.min = 1;
    quantity.value = 1;
    quantity.addEventListener("change", () => {
      if (quantity.value <= 0) {
        quantity.value = 1; // so the quantity stays at least 1
      }
      updatePrice();
    });
    quantity.classList.add("single-quantity");
    return quantity;
  }

  /**
   * Generate and return a product container containing the product's name,
   * image, price
   * @param {json} productInfo - the product's info in json returned from the server
   * @return {DOMelement} productContainer - the product container containing the
   *                                         product's name, image, price
   */
  function genProductContainer(productInfo) {
    let productName = productInfo["color"] + " " + productInfo["name"];
    let productContainer = gen("div");
    let image = gen("img");
    image.src = productInfo["img"];
    image.alt = productName;
    let name = gen("p");
    name.textContent = productName;
    let price = gen("p");
    price.textContent = "$" + productInfo["price"];
    price.classList.add("price");
    productContainer.appendChild(image);
    productContainer.appendChild(gen("hr"));
    productContainer.appendChild(name);
    productContainer.appendChild(price);
    return productContainer;
  }

  /**
   * Update the price and reflect on the page when the user adds or removes an item
   */
  function updatePrice() {
    let prices = qsa(".single-price");
    let quantities = qsa(".single-quantity");
    let totalPrice = 0;
    for (let i = 0; i < prices.length; i++) {
      totalPrice += prices[i].textContent.substring(1) * quantities[i].value;
    }
    id("total-price").textContent = "$" + totalPrice;
    if (totalPrice === 0) {
      id("submit-order").disabled = true;
      removeHidden(id("cart-empty-msg"));
    } else {
      id("submit-order").disabled = false;
    }
  }

  /**
   * Initialize the DIY form by giving the behavior to require the engrave text field
   * depending on the response on the engraving radio button. Also prepare the DIY form
   * for submission behaviors.
   */
  function initDIYForm() {
    let engrave = document.getElementsByName("engrave");
    for (let i = 0; i < engrave.length; i++) {
      engrave[i].addEventListener("change", changeEngrave);
    }
    id("diy-form").addEventListener("submit", (element) => {
      element.preventDefault();
      postDIY();
    });
  }

  /**
   * Toggle the appearance of engraving text based on if the user picks yes
   * on engrave radio button
   */
  function changeEngrave() {
    let engravingReq = qs('input[name="engrave"]:checked').value;
    let engravingText = id("engraving-text");
    if (engravingReq === "1") { // when user chooses yes on engrave
      removeHidden(engravingText);
      engravingText.querySelector("input").required = true;
    } else {
      addHidden(engravingText);
      engravingText.querySelector("input").required = false;
    }
  }

  /**
   * Send the user's response in the DIY form to the server by a POST request
   */
  function postDIY() {
    let params = new FormData(id("diy-form"));
    fetch(API_BASE + "diy", {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.text())
      .then((resp) => submitSuccessful(resp, "diy"))
      .catch(handleError);
  }

  /**
   * When the user first enters the FAQ page, fetch the FAQ data from the web service
   */
  function fetchFAQ() {
    switchToView("faq");
    if (!id("faq-list").hasChildNodes()) {
      fetch(API_BASE + "faq")
        .then(checkStatus)
        .then(resp => resp.json())
        .then(handleFAQ)
        .catch(handleError);
    }
  }

  /**
   * Populate the FAQ page by with each q and a returned from the web service,
   * prepare the feedback form
   * @param {json} resp - the json object returned from the web service containing
   *                      questions and answers
   */
  function handleFAQ(resp) {
    for (let i = 0; i < resp.length; i++) {
      let question = gen("p");
      let answer = gen("p");
      let qnaContainer = gen("div");
      question.textContent = "Q: " + resp[i]["q"];
      answer.textContent = "A: " + resp[i]["a"];
      qnaContainer.appendChild(question);
      qnaContainer.appendChild(answer);
      qs("#faq-view > section").appendChild(qnaContainer);
    }
    id("faq-form").addEventListener("submit", (element) => {
      element.preventDefault();
      postFeedback();
    });
  }

  /**
   * Send the user's response in the feedback form to the server by a POST request
   */
  function postFeedback() {
    let params = new FormData(id("faq-form"));
    fetch(API_BASE + "feedback", {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.text())
      .then((resp) => submitSuccessful(resp, "faq"))
      .catch(handleError);
  }

  /**
   * When a user successfully submits a form, hide the form and display the
   * success message, and then set a timeout to show the reset form a few seconds later
   * @param {string} resp - the success message returned from the web service
   * @param {string} submitType - type of the form, can be "diy" or "faq"
   */
  function submitSuccessful(resp, submitType) {
    let form = id(submitType + "-form");
    addHidden(form);
    let message = qs("#" + submitType + "-view > h3");
    message.textContent = resp;
    removeHidden(message);
    let timer = setTimeout(() => resetForm(form, message, timer), LOADING_TIME);
  }

  /**
   * Resets the given form, hide the success message and clear the timeout
   * to show the reset form
   * @param {DOMelement} form - a form needing to be reset
   * @param {DOMelement} message - the element containing the success message
   * @param {object} timer - the timeout timer used to show the reset form
   */
  function resetForm(form, message, timer) {
    form.reset();
    removeHidden(form);
    addHidden(message);
    clearTimeout(timer);
  }

  /**
   * Helper function that creates a new DOM element.
   * @param {string} elType - the HTML tag of the DOM element
   * @return {DOMelement} the DOM element on the page with the given HTML tag.
   */
  function gen(elType) {
    return document.createElement(elType);
  }

  /**
   * Remove the element from the hidden class.
   * @param {object} element - the element's id
   */
  function removeHidden(element) {
    element.classList.remove("hidden");
  }

  /**
   * Add the element to the hidden class.
   * @param {object} element - the element's id
   */
  function addHidden(element) {
    element.classList.add("hidden");
  }

  /**
   * Check the status of a fetch call and determines what to return in the pipeline
   * Obtained from lecture slides: https://courses.cs.washington.edu/courses/cse154/19su/lectures/lec12-ajax-fetch/index.html#/ajax-fetch-skeleton
   * @param {object} response - a response object from server
   * @return {string} if the status is okay, it returns a string, otherwise
   *                  it throws a response error.
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Request error: " + response.statusText);
    }
    return response;
  }

  /**
   * Helper function that gets the DOM element with the given selector
   * @param {string} selector - the element's selector
   * @return {DOMelement} the DOM list on the page with the given selector
   *                      (NULL if no DOM element on the page has the given selector)
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Helper function that gets the DOM element with the given id.
   * @param {string} id - the element's id
   * @return {DOMelement} the DOM element on the page with the given id
   *                      (NULL if no DOM element on the page has the given id)
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Helper function that gets the DOM element with the given selector
   * @param {string} selector - the element's selector
   * @return {DOMList} the DOM  on the page with the given selector
   *                   (NULL if no DOM element on the page has the given selector)
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Helper function that handles the error by displaying the error message on the
   * page and hiding the main view.
   * @param {string} err - the err message returned from checkStatus if some error
   *                       occurs during fetch
   */
  function handleError(err) {
    addHidden(qs("main"));
    id("error").textContent = err + ". Please refresh the page!";
    removeHidden(id("error"));
  }
})();
