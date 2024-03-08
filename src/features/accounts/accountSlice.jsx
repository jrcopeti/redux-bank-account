import { createSlice } from "@reduxjs/toolkit";
import { formatCurrency } from "../../utils";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
  messages: [],
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance += action.payload;
      state.isLoading = false;
      state.messages = [...state.messages, `Deposit of ${formatCurrency(action.payload)}`];
    },
    withdraw(state, action) {
      state.balance -= action.payload;
      state.messages = [...state.messages, `Withdrawal of ${formatCurrency(action.payload)}`];
    },
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance += action.payload.amount;
        state.messages = [
          ...state.messages,
          `Loan of ${formatCurrency(action.payload.amount)} for ${action.payload.purpose}`,
        ];
      },
    },
    payLoan(state) {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
      state.messages = [...state.messages, "Loan paid off!"];
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
});

export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

export function deposit(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  return async function (dispatch) {
    dispatch({ type: "account/convertingCurrency" });
    // API call

    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    console.log(data);
    const converted = data.rates.USD;

    // dispatch
    dispatch({ type: "account/deposit", payload: converted });
  };
}

export default accountSlice.reducer;

// Classic Redux

// export default function accountReducer(state = initialStateAccount, action) {
//   switch (action.type) {
//     case "account/deposit":
//       return { ...state, balance: state.balance + action.payload, isLoading: false };
//     case "account/withdraw":
//       return { ...state, balance: state.balance - action.payload };
//     case "account/requestLoan":
//       if (state.loan > 0) return state;
//       return {
//         ...state,
//         loan: action.payload.amount,
//         loanPurpose: action.payload.purpose,
//         balance: state.balance + action.payload.amount,
//       };

//     case "account/payLoan":
//       return {
//         ...state,
//         loan: 0,
//         loanPurpose: "",
//         balance: state.balance - state.loan,
//       };

//       case "account/convertingCurrency":
//         return {...state, isLoading: true};

//     default:
//       return state;
//   }
// }

// export function deposit(amount, currency) {
//   if(currency === "USD") return { type: "account/deposit", payload: amount };

//   return async function(dispatch, getState) {
//     dispatch ({type: "account/convertingCurrency"})
//     // API call

//     const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`)
//     const data = await res.json();
//     console.log(data)
//     const converted = data.rates.USD

//     // dispatch
//     dispatch({ type: "account/deposit", payload: converted });
//   }

// }
// export function withdraw(amount) {
//   return { type: "account/witdraw", payload: amount };
// }
// export function requestLoan(amount, purpose) {
//   return { type: "account/requestLoan", payload: { amount, purpose } };
// }
// export function payLoan() {
//   return { type: "account/payLoan" };
// }
