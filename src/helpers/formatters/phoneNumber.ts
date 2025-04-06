import memoizeLRU from "../../hooks/memoizeWithEviction/memoizeLRU";

const getNumerals = memoizeLRU((input: string | number): string => {
  return input.toString().replace(/[^\d]/g, "");
});

export const formatPhoneNumber = memoizeLRU(
  (phoneNumber: string | undefined, showUSCountryCode = false): string => {
    if (typeof phoneNumber === "undefined") {
      return "";
    }
    const currentValue = getNumerals(phoneNumber); //`${phoneNumber}`.replace(/[^\d]/g, "");
    const cvLength = currentValue.length;
    let phoneNumberFormatted = currentValue;
    if (cvLength > 10) {
      const countryCodeLength = cvLength - 10;
      const countryCode = currentValue.substring(0, countryCodeLength);
      const areaCode = currentValue.substring(
        countryCodeLength,
        countryCodeLength + 3
      );
      const middle = currentValue.substring(
        countryCodeLength + 3,
        countryCodeLength + 6
      );
      const last = currentValue.substring(
        countryCodeLength + 6,
        countryCodeLength + 10
      );
      phoneNumberFormatted =
        countryCode === "1" && !showUSCountryCode
          ? `(${areaCode}) ${middle}-${last}`
          : `+${countryCode} (${areaCode}) ${middle}-${last}`;
    } else if (cvLength > 6) {
      const areaCode = currentValue.substring(0, 3);
      const middle = currentValue.substring(3, 6);
      const last = currentValue.substring(6, 10);
      phoneNumberFormatted = `(${areaCode}) ${middle}-${last}`;
    } else if (cvLength > 3) {
      const areaCode = currentValue.substring(0, 3);
      const middle = currentValue.substring(3, 6);
      phoneNumberFormatted = `(${areaCode}) ${middle}`;
    } else if (cvLength > 0) {
      const areaCode = currentValue.substring(0, 3);
      phoneNumberFormatted = `${areaCode}`;
    }
    return phoneNumberFormatted;
  }
);

export const meetsNumberLengthCriteria = (
  input: string,
  min = 3,
  max = 12
): boolean => {
  const digits = input.replace(/\D/g, "");
  return digits.length >= min && digits.length <= max;
};

// const isCompleteNumber = (input: string): boolean => {
//   if (!validPhoneChars.test(input)) return false;
//   const completeNumberPattern = /^(\+?\d{1,2}?)?[-.\s]?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/;
//   return completeNumberPattern.test(input)
// }

export const isPotentialPhoneNumber = memoizeLRU(
  (input: string, checkCharLengthRequirements = false): boolean => {
    // Allowable characters in phone numbers
    const validPhoneChars = /^[+\d()\s.-]+$/;

    if (checkCharLengthRequirements && !meetsNumberLengthCriteria(input))
      return false;

    // Validate structure: allows partial numbers with separators
    // const validPatterns = [
    //   // Full phone number pattern (with optional country code)
    //   /^(\+?\d{1,2}?)?[-.\s]?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/,
    //   // Partial but structured: country code + 2+ digit start
    //   /^(\+?\d{1,2}?)?[-.\s]?\(?\d{0,3}?\)?[-.\s]?\d{0,3}[-.\s]?\d{0,4}$/,
    // ];

    const validPatterns = [
      // Full phone number pattern (with optional country code)
      /^(?:\d|[+]\d)(\d)?[-.\s]?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/,
      // Partial but structured: country code + 2+ digit start
      // /^(?:\d|[+]\d)(\d)?[-.\s]?\(?\d{0,3}?\)?[-.\s]?\d{0,3}[-.\s]?\d{0,4}$/,
      /^(?:\d|[+]\d)(\d)?[-.\s]?\(?\d{0,3}?\)?[-.\s]?\d{0,3}[-.\s]?\d{0,4}$/,
    ];

    // console.log(validPatterns[0].test('+22 (222) 222 2222'))
    // console.log(validPatterns[1].test('(222)2222222'))

    return (
      validPhoneChars.test(input) &&
      validPatterns.some((pattern) => pattern.test(input))
    );
  }
);

// console.log(isPotentialPhoneNumber("+100-")); // ISSUE HERE

const extractPhoneNumbers = memoizeLRU((input: string): string[] => {
  const results: string[] = [];
  let buffer = "";
  let potentialNumber = "";
  // let inNumber = false;

  const isLastChar = (i: number) => i === input.length - 1;
  const pushBuffer = () => {
    if (buffer) {
      results.push(buffer);
      buffer = "";
    }
  };

  // const addPhoneNumber = (phoneNumber: string) => {
  //   if (meetsNumberLengthCriteria(potentialNumber)) {
  //     let phoneNumberFound = potentialNumber.trim();
  //     const numDigits = getNumerals(phoneNumberFound).length;
  //     let nonNumericStartingCars = "";
  //     if (numDigits <= 10) {
  //       nonNumericStartingCars = phoneNumberFound
  //         .substring(0, 1)
  //         .replace(/\d/g, "");
  //       if (nonNumericStartingCars.length > 0) {
  //         buffer += nonNumericStartingCars;
  //         phoneNumberFound = phoneNumberFound.slice(1);
  //       }
  //     }
  //     pushBuffer();
  //     const formattedPhoneNumber = formatPhoneNumber(
  //       phoneNumberFound,
  //       true
  //     );
  //     results.push(formattedPhoneNumber);
  //     console.log(formattedPhoneNumber);
  //     buffer += char;
  //   }
  // };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // if not in a number & no potential number has started, start a potential number
    if (potentialNumber.length === 0 && /[+\d(]/.test(char) && !isLastChar(i)) {
      potentialNumber = char;
      continue;
    } else if (potentialNumber.length > 0) {
      // is next number valid?
      const isValid = isPotentialPhoneNumber(potentialNumber + char);
      if (isValid) {
        potentialNumber += char;
        // console.log(potentialNumber);
      }
      // we have a phone number, but the next char invalidates it, or we are at the end, add it.
      if (!isValid || isLastChar(i)) {
        let nextChar = char;
        if (isLastChar(i) && isValid) {
          console.log("last char", potentialNumber + " " + nextChar);
          nextChar = "";
        }
        // if it's long enough to add, then add it.
        if (meetsNumberLengthCriteria(potentialNumber)) {
          let phoneNumberFound = potentialNumber.trim();
          const numDigits = getNumerals(phoneNumberFound).length;
          let nonNumericStartingCars = "";
          if (numDigits <= 10) {
            nonNumericStartingCars = phoneNumberFound
              .substring(0, 1)
              .replace(/\d/g, "");
            if (nonNumericStartingCars.length > 0) {
              buffer += nonNumericStartingCars;
              phoneNumberFound = phoneNumberFound.slice(1);
            }
          }
          pushBuffer();
          const formattedPhoneNumber = formatPhoneNumber(
            phoneNumberFound,
            true
          );
          results.push(formattedPhoneNumber);
          console.log(formattedPhoneNumber);
          buffer += nextChar;
        } else {
          console.log(potentialNumber + nextChar);
          buffer += potentialNumber + nextChar;
          pushBuffer();
        }
        potentialNumber = "";
      }
    } else {
      console.log(char);
      buffer += char;
    }
    //   // A valid phone number start
    // if (!inNumber && /[+\d(]/.test(char)) {
    //   // A valid phone number start
    //   inNumber = true;
    //   console.log(buffer)
    //   pushBuffer(); // Push any preceding text
    //   potentialNumber = char;
    //   continue;
    // }

    // if (inNumber) {
    //   console.log(char)
    //   if (/[+\d()\s.-]/.test(char)) {
    //     potentialNumber += char;
    //     console.log(potentialNumber)
    //   } else {
    //     // If we hit an invalid character, finalize the phone number
    //     if (isPotentialPhoneNumber(potentialNumber)) {
    //       console.log(potentialNumber)
    //       results.push(potentialNumber.trim());
    //     } else {
    //       buffer += potentialNumber; // If invalid, keep as normal text
    //     }
    //     potentialNumber = "";
    //     inNumber = false;
    //     buffer += char; // Continue collecting normal text
    //   }
    //   continue;
    // }

    // buffer += char; // Collect normal text
  }
  // Finalize any number being built at the end of the string
  // console.log(potentialNumber)
  // if (inNumber && isPotentialPhoneNumber(potentialNumber)) {
  //   pushBuffer();
  //   results.push(potentialNumber.trim());
  // } else if (potentialNumber) {
  //   console.log(potentialNumber)
  //   buffer += potentialNumber;
  // }

  // console.log(buffer)
  pushBuffer(); // Push remaining buffer

  return results;
});

console.log(extractPhoneNumbers("hi 433"));

export default extractPhoneNumbers;

// **Test Cases**
// console.log(extractPhoneNumbers("+100-"));
// console.log(formatPhoneNumber("+-100-", true));
// console.log(extractPhoneNumbers("Call me at 415-555-1234 or 3."));
// ["Call me at ", "415-555-1234", " or ", "(213) 555-6789", "."]

// console.log(extractPhoneNumbers("My new number is +1-234-567-8901, and my old was 123-456-7890."));
// // ["My new number is ", "+1-234-567-8901", ", and my old was ", "123-456-7890", "."]

// console.log(extractPhoneNumbers("Hi 9999! 555-55-5555 isn't a real number, but 555-555-5555 is."));
// // ["Hi 9999! ", "555-555-5555", " isn't a real number, but ", "555-555-5555", " is."]

// console.log(extractPhoneNumbers("I got a new number: 123.456.7890 and a backup +44 20 7946 0958."));
// // ["I got a new number: ", "123.456.7890", " and a backup ", "+44 20 7946 0958", "."]

// console.log(extractPhoneNumbers("Random text with no phone numbers."));
// // ["Random text with no phone numbers."]
