function randInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick(arr, random = Math.random) {
  return arr[Math.floor(random() * arr.length)];
}

function generateArithmeticProblem(options = {}) {
  const random = options.random || Math.random;
  const {
  operation = "addition",
  format = "equation",

  minA = 0,
  maxA = 10,
  minB = 0,
  maxB = 10,

  allowNegative = true,
  integerOnly = true,

  missingPosition = null,

  onlyNumbers = "",
  excludeNumbers = ""
} = options;

  let a = randInt(minA, maxA, random);
let b = randInt(minB, maxB, random);

if (onlyNumbers) {
  const allowed = onlyNumbers
    .split(",")
    .map(n => Number(n.trim()))
    .filter(n => !isNaN(n));

  if (allowed.length > 0) {
    a = allowed[Math.floor(random() * allowed.length)];
    b = allowed[Math.floor(random() * allowed.length)];
  }
}

if (excludeNumbers) {
  const banned = excludeNumbers
    .split(",")
    .map(n => Number(n.trim()))
    .filter(n => !isNaN(n));

  while (banned.includes(a)) {
    a = randInt(minA, maxA, random);
  }

  while (banned.includes(b)) {
    b = randInt(minB, maxB, random);
  }
}

  if (operation === "subtraction" && !allowNegative && b > a) {
    [a, b] = [b, a];
  }

  let answer;

  switch (operation) {
    case "addition":
      answer = a + b;
      break;
    case "subtraction":
      answer = a - b;
      break;
    case "multiplication":
      answer = a * b;
      break;
    case "division":
      answer = integerOnly ? a : a * b;
      if (integerOnly) {
        answer = randInt(minB || 1, maxB || 10, random);
        b = randInt(Math.max(1, minB), Math.max(1, maxB), random);
        a = answer * b;
      } else {
        answer = a / b;
      }
      break;
    default:
      answer = a + b;
  }

  if (missingPosition === "a") {
    return {
      prompt: `__ ${symbolFor(operation)} ${b} = ${answer}`,
      answer: a
    };
  }

  if (missingPosition === "b") {
    return {
      prompt: `${a} ${symbolFor(operation)} __ = ${answer}`,
      answer: b
    };
  }

  if (missingPosition === "result") {
    return {
      prompt: `${a} ${symbolFor(operation)} ${b} = __`,
      answer
    };
  }

  if (format === "array" && operation === "multiplication") {
    return {
      prompt: `There are ${a} rows with ${b} objects in each row. How many objects are there altogether?`,
      answer
    };
  }

  if (format === "equal_groups" && operation === "multiplication") {
    return {
      prompt: `${a} groups have ${b} items in each group. How many items are there in all?`,
      answer
    };
  }

  if (format === "skip_counting" && operation === "multiplication") {
    const n = randInt(3, 10, random);
    return {
      prompt: `Skip count by ${a}: ${buildSkipSequence(a, n - 1)}, ... What is the ${n}th number?`,
      answer: a * n
    };
  }

  return {
    prompt: `${a} ${symbolFor(operation)} ${b} = __`,
    answer
  };
}

function symbolFor(operation) {
  switch (operation) {
    case "addition":
      return "+";
    case "subtraction":
      return "-";
    case "multiplication":
      return "×";
    case "division":
      return "÷";
    default:
      return "+";
  }
}

function buildSkipSequence(step, count) {
  const nums = [];
  for (let i = 1; i <= count; i++) {
    nums.push(step * i);
  }
  return nums.join(", ");
}

module.exports = generateArithmeticProblem;
