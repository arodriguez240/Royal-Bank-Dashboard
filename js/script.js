'use strict';

/********************
 *  Global Variables
 ********************/
let currentAccount;
let date = new Date().toLocaleDateString();

/********************
 * Elements selected
 ********************/
const labelWelcome = document.querySelector('.welcomeMessage');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balanceValue');
const labelSumIn = document.querySelector('.summaryValueIn');
const labelSumOut = document.querySelector('.summaryValueOut');
const labelSumInterest = document.querySelector('.summaryValueInterest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.loginBtn');
const btnTransfer = document.querySelector('.formBtnTransfer');
const btnLoan = document.querySelector('.formBtnLoan');
const btnClose = document.querySelector('.formBtnClose');
const btnSort = document.querySelector('.btnSort');

const inputLoginUsername = document.querySelector('.loginInputUser');
const inputLoginPin = document.querySelector('.loginInputPin');
const inputTransferTo = document.querySelector('.formInputTo');
const inputTransferAmount = document.querySelector('.formInputAmount');
const inputLoanAmount = document.querySelector('.formInputLoanAmount');
const inputCloseUsername = document.querySelector('.formInputUser');
const inputClosePin = document.querySelector('.formInputPin');


labelDate.textContent = date;
/********************
 * Movements Section*
 ********************/


// Function that inserts & displays money movement as html elements
const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a,b) => {
    return a - b
  }) : movements

  movs.forEach((movement, index) => {
    const type = movement > 0 ? 'Deposit' : 'Withdrawal';

    const html = `
      <div class="movementsRow">
        <div class="movementsType movementsType${type}">${index + 1} ${type}</div>
        <div class="movementsValue">$ ${movement}</div>
      </div>
    `
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}



/***********************
 * Create User Name    *
 ***********************/
// creating the username for each account first letters on name & surname

const createUsernames = (account) => {
  account.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map((name) => {
        return name[0]
      })
      .join('');
  })
}

/********************************
 * Calculates & displays Balance
 ********************************/


const calcDisplayBalance= (acc) => {
  acc.balance = acc.movements.reduce((acc,mov)=> {
    return acc + mov;
  },0)
  
  labelBalance.textContent = `$ ${acc.balance} USD`
}
createUsernames(accounts)

/********************************
 * Calculates & displays Summary
 ********************************/

const calcDisplaySummary = (movements) => {
  /* incomes start */
  const incomes = movements.filter((mov) => {
    return mov > 0
  }).reduce((acc, mov) => {
    return acc + mov
  },0)
  labelSumIn.textContent = `$${incomes}`
  /* End of incomes */
  /* Start of out movements */
  const out = movements.filter((movements) => {
    return movements < 0
  }).reduce((acc,mov) => {
    return acc + mov
  })
  labelSumOut.textContent = `$${Math.abs(out)}`
  /* End of out movements */
  /* Start of Interest */
  const interest = movements.filter((mov) => {
    return mov > 0
  }).map((deposit) => {
    return Math.floor((deposit * currentAccount.interestRate) / 100)
  })
  .filter((int, i ,arr) => {
    return int >= 1
  })
  .reduce((acc,int) => {
    return acc + int
  },0)
  labelSumInterest.textContent = `$${interest}`
  /* End of Interest */
}

const updateUI = (acc) => {
  displayMovements(acc.movements);
  calcDisplaySummary(acc.movements);
  calcDisplayBalance(acc);
}


/******************
 * Event Handlers
 ******************/


// Login to account section 
btnLogin.addEventListener('click', (e) => {
  e.preventDefault()

  currentAccount = accounts.find((acc) => {
    return acc.username === inputLoginUsername.value
  })
  if(currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI w/ welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur()
    //Display balance Summary &  movements
    updateUI(currentAccount)
  }
})
// Transfer money from one account to another
btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find((acc) => {
    return acc.username === inputTransferTo.value;
  })
  inputTransferAmount.value = inputTransferTo.value = '';
  // transfer Logic
  if( 
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
    ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  
})

// Close Account 
btnClose.addEventListener('click', (e) => {
  e.preventDefault();
  if(currentAccount.pin === Number(inputClosePin.value) && currentAccount.username === inputCloseUsername.value) {
    const index = accounts.findIndex((acc) => {
      return acc.username === currentAccount.username;
    })
    console.log(index);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
})

// Request a loan
btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  
  const amount = Number(inputLoanAmount.value);
  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * .1)){
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
})

// Sort Movements
let sorted = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted)
  sorted = !sorted
})