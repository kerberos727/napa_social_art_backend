export const generateRandomUniqueIntegers = (length: number) => {
  const integers = [];
  while (integers.length < length) {
    const randomInt = Math.floor(Math.random() * 100); // Change 100 to whatever range you want
    if (!integers.includes(randomInt)) {
      integers.push(randomInt);
    }
  }
  return Number(integers.join(""));
};
