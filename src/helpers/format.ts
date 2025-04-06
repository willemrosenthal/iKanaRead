import {
  isPotentialPhoneNumber,
  meetsNumberLengthCriteria,
} from "./formatters/phoneNumber";

export const formatPhoneNumber = (phoneNumber: string | undefined): string => {
  if (typeof phoneNumber === "undefined") {
    return "";
  }
  const currentValue = `${phoneNumber}`.replace(/[^\d]/g, "");
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
      countryCode === "1"
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
};

interface CheckForCharsInput {
  text: string;
  options: {
    hasNumeric?: boolean;
    hasAlphabetic?: boolean;
    hasSpaces?: boolean;
    hasParentheses?: boolean;
    hasHyphen?: boolean;
    allowCustom?: string[] | string;
    invalidCustom?: string[] | string;
  };
  limits?: {
    [key: string | number | "numerals" | "alphabetical" | "spaces"]: {
      min?: number;
      max?: number;
    };
  };
  passCriteria?: "onlyAllowed" | "containsAny";
}

export const checkForChars = ({
  text,
  options,
  passCriteria = "onlyAllowed",
  limits,
}: CheckForCharsInput): boolean => {
  let validPattern = "";
  let invalidPattern = "";

  const regexChecks = {
    hasNumeric: "\\d",
    hasAlphabetic: "a-zA-Z",
    hasSpaces: "\\s",
    hasParentheses: "()",
    hasHyphen: "\\-",
  };

  if (limits) {
    for (const [key, value] of Object.entries(limits)) {
      let toCheck = key;

      // unique checks
      if (key === "numerals") toCheck = "\\d";
      else if (key === "alphabetical") toCheck = "a-zA-Z";
      else if (key === "spaces") toCheck = "\\s";

      // Count occurrences of the pattern
      const matches = text.match(new RegExp(`[${toCheck}]`, "g")) || [];
      const count = matches.length;

      // Check against min/max limits
      if (value.min && count < value.min) return false;
      if (value.max && count > value.max) return false;
    }
  }

  for (const [key, value] of Object.entries(regexChecks)) {
    const checkFor = options[key as keyof typeof options];
    if (checkFor) validPattern += value;
    else invalidPattern += value;
  }

  if (options.allowCustom) {
    const customList = [options.allowCustom].flat();
    const customCharsToCheck = customList.join("");
    validPattern += customCharsToCheck;
  }
  if (options.invalidCustom) {
    const invalidList = [options.invalidCustom].flat();
    const invalidCharsToCheck = invalidList.join("");
    invalidPattern += invalidCharsToCheck;
  }

  validPattern = `[${validPattern}]`;
  invalidPattern = `[${invalidPattern}]`;

  let validResult = true;
  let invalidResult = true;

  if (validPattern.length > 0) {
    validResult = new RegExp(validPattern).test(text);
  }
  if (invalidPattern.length > 0) {
    invalidResult = new RegExp(invalidPattern).test(text);
  }

  return passCriteria === "onlyAllowed"
    ? validResult && !invalidResult
    : validResult;
};

export const detectPhoneNumber = (text: string): boolean => {
  // get all non-numeric, non () or - or space characters
  const stringCheck = checkForChars({
    text,
    options: {
      hasNumeric: true,
      hasParentheses: true,
      hasHyphen: true,
      hasSpaces: true,
    },
    // limits: {
    //   "(": { max: 1 },
    //   ")": { max: 1 },
    //   "-": { max: 1 },
    // },
  });

  if (!stringCheck) {
    return false;
  }
  const nonNumericCharacters = text.replace(/[^\d()\- ]/g, "");
  if (nonNumericCharacters.length > 0) {
    return false;
  }
  // Remove all non-numeric characters
  const numbersOnly = text.replace(/[^\d]/g, "");

  // Check if the cleaned string is all numbers and has 12 or fewer digits
  if (numbersOnly.length > 0 && numbersOnly.length <= 12) {
    return true;
  }

  // Check for formatted phone number patterns
  const formattedPatterns = [
    // (123) 456-7890
    /^\(\d{1,3}\)\s\d{1,3}(-\d{1,4})?$/,
    // +1 (123) 456-7890
    /^\+\d{1,2}\s\(\d{1,3}\)\s\d{1,3}(-\d{1,4})?$/,
  ];

  return formattedPatterns.some((pattern) => pattern.test(text));
};

console.log(
  checkForChars({
    text: ")123( 456 7890",
    options: {
      hasNumeric: true,
      hasParentheses: true,
      hasHyphen: true,
      hasSpaces: true,
    },
    // limits: {
    //   "(": { max: 1 },
    //   ")": { max: 1 },
    //   "-": { max: 1 },
    // },
  })
);

console.log(detectPhoneNumber("(123) 456 7890"));

// export const handlePhoneNumberInText = (text: string): string => {
//   // Pattern to match both raw numbers and formatted numbers
//   const phonePattern =
//     /(?:\+?\d{1,2}\s?)?\(?\d{3}\)?[-.\s]?\d{0,3}[-.\s]?\d{0,4}|\d{3,12}/g;

//   let match;
//   let lastIndex = 0;
//   let formattedText = "";

//   // Find all potential phone numbers in the text
//   while ((match = phonePattern.exec(text)) !== null) {
//     // Add text before the phone number
//     formattedText += text.slice(lastIndex, match.index);

//     // Extract and clean the phone number
//     const potentialNumber = match[0].replace(/[^\d]/g, "");

//     // Only format if it's a valid phone number (3-12 digits)
//     if (potentialNumber.length >= 3 && potentialNumber.length <= 12) {
//       formattedText += formatPhoneNumber(potentialNumber);
//     } else {
//       formattedText += match[0];
//     }

//     lastIndex = match.index + match[0].length;
//   }

//   // Add any remaining text after the last phone number
//   formattedText += text.slice(lastIndex);

//   return formattedText;
// };
// export const detectPhoneNumberWithinText = (text: string): boolean => {
//   const phoneNumberRegex = /(\d{3})(\d{3})(\d{4})/;
//   const match = text.match(phoneNumberRegex);
//   return match ? true : false;
// };

// should evaluate the value, searching it for any instance that meets the criteria of any items in the formatList
// it should make sure not to determine something meets a format criteria if it's part of a larger string that will meet the same criteria
// maybe use the sliding window technique to evaluate the value
// if it finds a match, replace that match with the formatted value and continue.
// return the formatted result, (even if no changes were made)
// export const handleFormatting = (
//   value: string,
//   cursorPosition: number,
//   input: HTMLInputElement
// ): string => {
//   let result = value;
//   let lastIndex = 0;

//   // For each format type in formatList
//   for (const format of formatList) {
//     // Reset search for each format type
//     let searchText = result;
//     result = "";
//     lastIndex = 0;

//     // Use sliding window to find potential matches
//     for (let i = 0; i < searchText.length; i++) {
//       for (let j = i + 1; j <= Math.min(i + 15, searchText.length); j++) {
//         const window = searchText.slice(i, j);

//         // Check if this window is a valid phone number
//         if (format.title === "phone" && detectPhoneNumber(window)) {
//           // Check if this is part of a larger valid number
//           const nextChar = searchText[j];
//           const prevChar = i > 0 ? searchText[i - 1] : null;

//           // Only format if it's not part of a larger number
//           if (
//             (!nextChar || !/[\d() -]/.test(nextChar)) &&
//             (!prevChar || !/[\d() -]/.test(prevChar))
//           ) {
//             // Add text before the match
//             result += searchText.slice(lastIndex, i);
//             // Add formatted text
//             result += format.function(window);

//             // Update indices
//             lastIndex = j;
//             i = j - 1; // -1 because loop will increment i
//             break;
//           }
//         }
//       }
//     }

//     // Add remaining text
//     result += searchText.slice(lastIndex);
//   }

//   return result;
// };

export const handleFormatting = (
  value: string,
  cursorPosition: number,
  input: HTMLInputElement
) => {
  // const formattedValue = extractPhoneNumbers(value);
  // return formattedValue.join(" ");
  if (
    isPotentialPhoneNumber(value) &&
    meetsNumberLengthCriteria(value, 4, 12)
  ) {
    return formatPhoneNumber(value);
  }
  return value;
};

// export const handleFormatting = (
//   value: string,
//   cursorPosition: number,
//   input: HTMLInputElement
// ) => {
//   // split by spaces
//   // const splitValue = value.split(" ");
//   // for (const format of formatList) {
//   //   let chunksToTest = [];
//   //   for (let i = format.minSpaces; i <= format.maxSpaces; i++) {
//   //     chunksToTest.push(splitValue.slice(0, i));
//   //   }
//   // }
//   // for (const part of splitValue) {
//   //   if (detectPhoneNumber(part)) {
//   //     return formatPhoneNumber(part);
//   //   }
//   // }

//   // if (detectPhoneNumber(value)) {
//   //   return formatPhoneNumber(value);
//   // }
//   return value;
// };
