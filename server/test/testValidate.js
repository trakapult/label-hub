const { getAnswer, getAcc } = require("../src/utils/validate");

const data = {
  "sample1": [
    [{"x0": 10, "y0": 10, "x1": 20, "y1": 20, "label": "cat"}],
    [{"x0": 11, "y0": 11, "x1": 19, "y1": 190, "label": "cat"}],
    [{"x0": 11, "y0": 11, "x1": 16, "y1": 18, "label": "cat"}, {"x0": 15, "y0": 15, "x1": 25, "y1": 25, "label": "dog"}]
  ],
  "sample2": [
    [{"x0": 30, "y0": 30, "x1": 40, "y1": 40, "label": "car"}, {"x0": 30, "y0": 30, "x1": 40, "y1": 40, "label": "car"}],
    [{"x0": 33, "y0": 33, "x1": 43, "y1": 43, "label": "car"}, {"x0": 320, "y0": 32, "x1": 42, "y1": 42, "label": "car"}],
    [{"x0": 30, "y0": 30, "x1": 40, "y1": 40, "label": "car"}]
  ]
};

const weights = [1, 1, 2];
const dataset = {
  segments: true,
  dataType: "image",
  labelInfo: JSON.stringify({width: 100, height: 100})
};
const threshold = 5;

const answer = getAnswer(data, weights, dataset);
console.log("Computed Answer:", answer);

for (let i = 1; i <= 2; i++) {
  for(let j = 0; j <= 2; j++) {
    const acc = getAcc(answer[`sample${i}`], data[`sample${i}`][j], threshold);
    console.log(`Sample ${i}, Accuracy for labeler ${j+1}:`, acc);
  }
}