import React from "react";

String.prototype.currencyFormat = function () {
  const digits = this.split(".");
  return (
    digits[0].replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (digits.length > 1 ? `.${digits[1]}` : "")
  );
};

Number.prototype.currencyFormat = function () {
  return this.toString().currencyFormat();
};

// 올림
// String.prototype.currencyFormat = function () {
//   const digits = this.split('.');
//   const integerPart = digits[0].replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
//   let decimalPart = '';

//   if (digits.length > 1) {
//     const decimalDigit = digits[1][0]; // 소수점 첫째 자리 숫자
//     const roundedDecimalDigit = parseInt(decimalDigit) >= 5 ? '1' : '0'; // 첫째 자리에서 올림 여부 결정

//     decimalPart = `.${roundedDecimalDigit}`; // 소수점 첫째 자리에서 올림한 값
//   }

//   return integerPart + decimalPart;
// };

// Number.prototype.currencyFormat = function () {
//   return this.toString().currencyFormat();
// };

// for reactjs
String.prototype.nl2br = function () {
  return this.split("\n").map((line, i) => (
    <p key={i} className="mb-0">
      {line}
    </p>
  ));
};

// for jQuery
String.prototype.$nl2br = function () {
  return this.replace(/\n/g, "<br/>");
};
