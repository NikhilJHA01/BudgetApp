// import "../styles/style.css";

var BudgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateValue = function(key) {
    var sum = 0;
    data.allItems[key].forEach(item => (sum += item.value));
    data.totals[key] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: 0
  };

  return {
    addItem: function(type, desc, val) {
      var newItem,
        ID = 0;
      //Asign unique ID to each element
      if (data.allItems[type].length > 0)
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      else ID = 0;
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }
      //Push into data object depending on the type
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem(type, id) {
      var ids, index;
      ids = data.allItems[type].map(item => item.id);
      index = ids.indexOf(id);
      if (index !== -1) data.allItems[type].splice(index, 1);
    },
    calculateBudget() {
      calculateValue("exp");
      calculateValue("inc");

      //Calculate Budget
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0)
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    },
    calculatePercentages: function() {
      /*
      a=20
      b=10
      c=40
      income = 100
      a=20/100=20%
      b=10/100=10%
      c=40/100=40%
      */

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        expense: data.totals.exp,
        income: data.totals.inc
      };
    },
    setBudgetLocalStorage() {
      localStorage.setItem("data", JSON.stringify(data));
    },
    setData(localStorageData) {
      data = Object.assign(data, localStorageData);
    },
    testing() {
      console.log(data);
    }
  };
})();

var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    getDomStrings() {
      return {
        DOMstrings
      };
    },
    addListItem(obj, type) {
      var html;
      let newHtml;
      var element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html = ` <div class="item clearfix" id="inc-%ID%">
      <div class="item__description">%Description%</div>
      <div class="right clearfix">
          <div class="item__value">%Value%</div>
          <div class="item__delete">
              <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
          </div>
      </div>
  </div>`;
      } else {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%ID%">
 <div class="item__description">%Description%</div>
 <div class="right clearfix">
     <div class="item__value">%Value%</div>
     <div class="item__delete">
         <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
     </div>
 </div>
</div>`;
      }
      newHtml = html.replace("%ID%", obj.id);
      newHtml = newHtml.replace("%Description%", obj.description);
      newHtml = newHtml.replace("%Value%", obj.value);
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    clearFields() {
      // using  querySelectorAll instead of querySelector to fetch in one go , below is the syntax
      var fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      //querySelectorAll return an list so to use array methods we need to convert it into Array
      var fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current) {
        current.value = "";
      });
    },
    displayBudget(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.income;
      document.querySelector(DOMstrings.expensesLabel).textContent =
        obj.expense;
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    deleteListItem(selectorId) {
      var ele = document.getElementById(selectorId);
      ele.parentNode.removeChild(ele);
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    }
  };
})();

var Controller = (function(BudgetCtrl, UICtrl) {
  //Initialisation of events
  var setUpEventListeners = function() {
    var DOM = UICtrl.getDomStrings();
    document
      .querySelector(DOM.DOMstrings.inputBtn)
      .addEventListener("click", clickAdd);
    document.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        clickAdd();
      }
    });
    document
      .querySelector(DOM.DOMstrings.container)
      .addEventListener("click", deleteItem);
    if (localStorage.getItem("data")) {
      data = JSON.parse(localStorage.getItem("data"));
      BudgetCtrl.setData(data);

      // data = JSON.parse(data);
      UICtrl.displayBudget({
        budget: data.budget || 0,
        percentage: data.percentage || 0,
        expense: data.totals.exp || 0,
        income: data.totals.inc || 0
      });
      data.allItems["exp"].forEach(item => UICtrl.addListItem(item, "exp"));
      data.allItems["inc"].forEach(item => UICtrl.addListItem(item, "inc"));
    } else {
      UICtrl.displayBudget({
        budget: 0,
        percentage: 0,
        expense: 0,
        income: 0
      });
    }
  };
  var updatePercentages = function() {
    // 1. Calculate percentages
    BudgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = BudgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var updateBudget = function() {
    //Get budget
    BudgetCtrl.calculateBudget();
    var budget = BudgetCtrl.getBudget();
    //return budget
    console.log(budget);
    UICtrl.displayBudget(budget);
    BudgetCtrl.setBudgetLocalStorage();
    //Update UI
  };
  var clickAdd = function() {
    var input;
    var newItem;

    //Get the input items
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add into data object
      newItem = BudgetCtrl.addItem(input.type, input.description, input.value);
      console.log(input);

      //Display item to UI
      UICtrl.addListItem(newItem, input.type);

      //Clear Input fields
      UICtrl.clearFields();

      updateBudget();
      // updatePercentages();
    }
  };

  var deleteItem = function(event) {
    var itemId, splitArray;
    //Get the item to be deleted
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemId);
    if (itemId) {
      splitArray = itemId.split("-");
      type = splitArray[0];
      id = parseInt(splitArray[1]);

      BudgetCtrl.deleteItem(type, id);

      UICtrl.deleteListItem(itemId);

      updateBudget();
      updatePercentages();
    }

    //Update the data object

    //Update the UI

    //Update the BUdget
  };

  return {
    init: function() {
      setUpEventListeners();
    }
  };
})(BudgetController, UIController);

Controller.init();
