import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StrintService {

  constructor() { }

  test() {

  }

  subPositive(x, y) {
    this.forcePositiveString(x);
    this.forcePositiveString(y);
    if (!this.ge(x, y)) {
      throw new Error("x must be greater or equal to y");
    }

    var maxLength = Math.max(x.length, y.length);
    var result = "";
    var borrow = 0;
    var leadingZeros = 0;
    for (var i = 0; i < maxLength; i++) {
      var lhs = Number(this.getDigit(x, i)) - borrow;
      borrow = 0;
      var rhs = Number(this.getDigit(y, i));
      while (lhs < rhs) {
        lhs += 10;
        borrow++;
      }
      var digit = String(lhs - rhs);
      if (digit !== "0") {
        result = digit + this.prefixZeros(result, leadingZeros);
        leadingZeros = 0;
      } else {
        leadingZeros++;
      }
    }
    return result.length === 0 ? "0" : result;
  }

  addPositive(x, y) {
    this.forcePositiveString(x);
    this.forcePositiveString(y);

    var maxLength = Math.max(x.length, y.length);
    var result = "";
    var borrow = 0;
    var leadingZeros = 0;
    for (var i = 0; i < maxLength; i++) {
      var lhs = Number(this.getDigit(x, i));
      var rhs = Number(this.getDigit(y, i));
      var digit = lhs + rhs + borrow;
      borrow = 0;
      while (digit >= 10) {
        digit -= 10;
        borrow++;
      }
      if (digit === 0) {
        leadingZeros++;
      } else {
        result = String(digit) + this.prefixZeros(result, leadingZeros);
        leadingZeros = 0;
      }
    }
    if (borrow > 0) {
      result = String(borrow) + result;
    }
    return result;
  }

  add(x, y) {
    this.forceString(x);
    this.forceString(y);

    if (this.isPositive(x) && this.isPositive(y)) {
      return this.addPositive(x, y);
    } else if (this.isNegative(x) && this.isNegative(y)) {
      return this.negate(this.addPositive(this.abs(x), this.abs(y)));
    } else {
      if (this.lt(this.abs(x), this.abs(y))) {
        var tmp = x;
        x = y;
        y = tmp;
      }
      // |a| >= |b|
      var absResult = this.subPositive(this.abs(x), this.abs(y));
      if (this.isPositive(x)) {
        // Example: 5 + -3
        return absResult;
      } else {
        // Example: -5 + 3
        return this.negate(absResult);
      }
    }
  }

  sub(x, y) {
    this.forceString(x);
    this.forceString(y);
    return this.add(x, this.negate(y));
  }

  //------------------- Multiplication

  mulDigit(strint, digit) {
    this.forcePositiveString(strint);
    this.forceNumber(digit);
    var result = "";
    var digitCount = this.getDigitCount(strint);
    var carry = 0;
    var leadingZeros = 0;
    for (var i = 0; i < digitCount; i++) {
      var digitResult = (Number(this.getDigit(strint, i)) * digit) + carry;
      carry = 0;
      while (digitResult >= 10) {
        digitResult -= 10;
        carry++;
      }
      if (digitResult === 0) {
        leadingZeros++;
      } else {
        result = String(digitResult) + this.prefixZeros(result, leadingZeros);
        leadingZeros = 0;
      }
    }
    if (carry > 0) {
      result = String(carry) + result;
    }
    return result.length === 0 ? "0" : result;
  }


  mulPositive(lhs, rhs) {
    /* Example via http://en.wikipedia.org/wiki/Multiplication_algorithm
            23958233
                5830 ×
        ------------
            00000000 ( =      23,958,233 ×     0)
           71874699  ( =      23,958,233 ×    30)
         191665864   ( =      23,958,233 ×   800)
        119791165    ( =      23,958,233 × 5,000)
        ------------
        139676498390 ( = 139,676,498,390        )
     */

    this.forcePositiveString(lhs);
    this.forcePositiveString(rhs);
    var result = "0";
    var digitCount = this.getDigitCount(rhs);
    for (var i = 0; i < digitCount; i++) {
      var singleRow = this.mulDigit(lhs, Number(this.getDigit(rhs, i)));
      singleRow = this.shiftLeft(singleRow, i);
      result = this.addPositive(result, singleRow);
    }
    return result;
  }

  mul(lhs, rhs) {
    this.forceString(lhs);
    this.forceString(rhs);

    var absResult = this.mulPositive(this.abs(lhs), this.abs(rhs));
    return (this.sameSign(lhs, rhs) ? absResult : this.negate(absResult));
  }

  //------------------- Division

  quotientRemainderPositive(dividend, divisor) {
    /*
    Example division: 290 / 15

    29|0 = 0  // digits larger, can subtract
    15

    14|0 = 1  // digits smaller, must shift
    15

    140| = 10  // digits are 140, can subtract 9 times
     15

    (9 subtractions omitted)

      5| = 19  // divisor is now larger than the dividend, we are done: [19, 5]
     15
     */

    this.forcePositiveString(dividend);
    this.forcePositiveString(divisor);

    if (this.eq(dividend, divisor)) {
      return ["1", "0"];
    }
    if (this.gt(divisor, dividend)) {
      return ["0", this.normalize(dividend)];
    }
    var quotient = "0";
    var remainingDigits = dividend.length - divisor.length;

    while (true) {
      var digits = dividend.slice(0, dividend.length - remainingDigits);

      // Subtract as long as possible and count the times
      while (this.ge(digits, divisor)) {
        digits = this.sub(digits, divisor);
        quotient = this.add(quotient, "1");
      }
      dividend = digits + dividend.slice(dividend.length - remainingDigits);

      // Done already?
      if (this.gt(divisor, dividend)) { // holds (at the lastest) at remainingDigits === 0
        quotient = this.shiftLeft(quotient, remainingDigits);
        return [quotient, this.normalize(dividend)];
      }

      // Not done, shift
      remainingDigits--;
      quotient = this.shiftLeft(quotient, 1);
      if (remainingDigits < 0) {
        throw new Error("Illegal state");
      }
    }
  };

  div(dividend, divisor) {
    this.forceString(dividend);
    this.forceString(divisor);

    var absResult = this.quotientRemainderPositive(this.abs(dividend), this.abs(divisor))[0];
    return (this.sameSign(dividend, divisor) ? absResult : this.negate(absResult));
  }

  //------------------- Comparisons

  eq(lhs, rhs) {
    return this.normalize(lhs) === this.normalize(rhs);
  }

  ltPositive(x, y) {
    if (this.isNegative(x) || this.isNegative(y)) {
      throw new Error("Both operands must be positive: " + x + " " + y);
    }
    var maxLength = Math.max(x.length, y.length);
    var lhs = this.leftPadZeros(x, maxLength);
    var rhs = this.leftPadZeros(y, maxLength);
    return lhs < rhs; // lexicographical comparison
  }

  lt(lhs, rhs) {
    if (this.isNegative(lhs) && this.isPositive(rhs)) {
      return true;
    } else if (this.isPositive(lhs) && this.isNegative(rhs)) {
      return false;
    } else if (this.isNegative(lhs) && this.isNegative(rhs)) {
      // Example: -3 < -5
      return !this.ltPositive(this.abs(lhs), this.abs(rhs));
    } else {
      return this.ltPositive(lhs, rhs);
    }
  }

  // x >= y <=> !(x < y)
  ge(lhs, rhs) {
    return !this.lt(lhs, rhs);
  }

  gt(lhs, rhs) {
    if (this.eq(lhs, rhs)) return false;
    return this.ge(lhs, rhs);
  }

  //------------------- Signs

  isNegative(strint) {
    this.forceString(strint);
    return (strint.indexOf("-") === 0);
  }

  // Actually: isNonNegative
  isPositive(strint) {
    return !this.isNegative(strint);
  }

  abs(strint) {
    if (this.isNegative(strint)) {
      return this.negate(strint);
    } else {
      return strint;
    }
  }

  sameSign(lhs, rhs) {
    return this.isPositive(lhs) === this.isPositive(rhs);
  }

  negate(strint) {
    if (strint === "0") {
      return "0";
    }
    if (this.isNegative(strint)) {
      return strint.slice(1);
    } else {
      return "-" + strint;
    }
  }

  //------------------- Helpers

  RE_NON_ZERO = /^(-?)0*([1-9][0-9]*)$/;
  RE_ZERO = /^0+$/; 

  normalize(strint) {
    if (this.RE_ZERO.test(strint)) {
      return "0";
    }
    var match = this.RE_NON_ZERO.exec(strint);
    if (!match) {
      throw new Error("Illegal strint format: " + strint);
    }
    return match[1] + match[2];
  }

  /**
   * Prefix zeros until the length of the number is `digitCount`.
   */
  leftPadZeros(strint, digitCount) {
    this.forcePositiveString(strint);
    this.forceNonNegativeNumber(digitCount);

    return this.prefixZeros(strint, digitCount - strint.length);
  }

  prefixZeros(strint, zeroCount) {
    this.forcePositiveString(strint);
    this.forceNonNegativeNumber(zeroCount);

    var result = strint;
    for (var i = 0; i < zeroCount; i++) {
      result = "0" + result;
    }
    return result;
  }

  shiftLeft(strint, digitCount) {
    while (digitCount > 0) {
      strint = strint + "0";
      digitCount--;
    }
    return strint;
  }

  /**
   * Works for negative numbers, too.
   * Index of rightmost digit is 0. Going too far left results in "0".
   */
  getDigit(x, digitIndex) {
    this.forceString(x);
    this.forceNumber(digitIndex);
    if (digitIndex >= this.getDigitCount(x)) {
      return "0";
    } else {
      return x.charAt(x.length - digitIndex - 1);
    }
  }

  getDigitCount(strint) {
    if (this.isNegative(strint)) {
      return strint.length - 1;
    } else {
      return strint.length;
    }
  }

  //------------------- Type checks

  forceString(value) {
    this.forceType(value, "string");
  }
  forcePositiveString(value) {
    this.forceString(value);
    this.forceCondition(value, this.isPositive, "isPositive");
  }
  forceNumber(value) {
    this.forceType(value, "number");
  }
  forceNonNegativeNumber(value) {
    this.forceType(value, "number");
    if (value < 0) {
      throw new Error("Expected a positive number: " + value);
    }
  }
  forceCondition(value, condition, conditionName) {
    // if (!condition.call(null, value)) {
    if (conditionName === 'isPositive' && !this.isPositive(value)) {
      throw new Error("Condition " + conditionName + " failed for value " + value);
    }
  }
  forceType(value, type) {
    if (typeof value !== type) {
      throw new Error("Not a " + type + ": " + value);
    }
  }
}
