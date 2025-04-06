// enum CharGroups {
//   integer = "integer",
//   alphabetical = "alphabetical",
//   punctuation = "punctuation",
//   float = "float",
//   space = "space",
// }

// interface FormatRule {
//   type: CharGroups | string;
//   min?: number;
//   max?: number;
//   positionMin?: number;
//   positionMax?: number;
// }

// //413-446-7833
// // (413)
// export const formatRules = {
//   phoneNumber: {
//     allowed: [
//       { type: CharGroups.integer, min: 3, max: 12 },
//       { type: CharGroups.space },
//       { type: "(", max: 1, positionMin: 0, positionMax: 0 },
//       { type: ")", max: 1, positionMin: 0, positionMax: 0 },
//       { type: "-", max: 3, positionMin: 0, positionMax: 0 },
//       { type: "+", max: 1, positionMin: 0, positionMax: 0 },
//     ],
//     // pattern: /^\d{3}-\d{3}-\d{4}$/,
//     // formatter: (value: string) => value.replace(/-/g, ""),
//   },
// };

export const isPotentialPhoneNumber = (input: string): boolean => {
  // Allowable characters in phone numbers
  const validChars = /^[+\d()\s.-]+$/;
  // Extract digits from input
  const digits = input.replace(/\D/g, "");
  const digitCount = digits.length;

  if (digitCount < 3 || digitCount > 12) return false;

  // Validate structure: allows partial numbers with separators
  const validPatterns = [
    // Full phone number pattern (with optional country code)
    /^\+?\d{1,2}?[-.\s]?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/,
    // Partial but structured: country code + 2+ digit start
    /^\+?\d{1,2}?[-.\s]?\d{2,3}[-.\s]?\d{0,4}$/,
  ];

  return (
    validChars.test(input) &&
    validPatterns.some((pattern) => pattern.test(input))
  );
};
