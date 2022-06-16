function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const randomNumbers = (numQty = 100000000) => {
  const randomNumbersCount = {};
  for (let i = 0; i < numQty; i++) {
    const randomNumber = getRandomInt(1, 1000);
    if (randomNumbersCount[randomNumber]) {
      randomNumbersCount[randomNumber]++;
    } else {
      randomNumbersCount[randomNumber] = 1;
    }
  }
  return randomNumbersCount;
};

process.on('message', (msg) => {
  if (msg.message == 'start') {
    const counts = randomNumbers(msg.qty);
    process.send(counts);
  }
});
