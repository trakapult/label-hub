const { getAnswer_, getAcc } = require('./validate');

const data = {
  "sample1": [
    [{"x0": 10, "y0": 10, "x1": 20, "y1": 20, "label": "cat"}],
    [{"x0": 11, "y0": 11, "x1": 19, "y1": 190, "label": "cat"}],
    [{"x0": 10, "y0": 10, "x1": 20, "y1": 20, "label": "cat"}, {"x0": 15, "y0": 15, "x1": 25, "y1": 25, "label": "dog"}]
  ],
  "sample2": [
    [{"x0": 30, "y0": 30, "x1": 40, "y1": 40, "label": "car"}],
    [{"x0": 32, "y0": 32, "x1": 42, "y1": 42, "label": "car"}, {"x0": 320, "y0": 32, "x1": 42, "y1": 42, "label": "car"}],
    [{"x0": 30, "y0": 30, "x1": 40, "y1": 40, "label": "car"}]
  ]
};

const weights = [1, 1, 1];
const threshold = 5;

const answer = getAnswer_(data, weights, threshold);
console.log("Computed Answer:", answer);

const acc1 = getAcc(answer["sample1"], data["sample1"][0], threshold);
const acc2 = getAcc(answer["sample1"], data["sample1"][1], threshold);
const acc3 = getAcc(answer["sample1"], data["sample1"][2], threshold);
console.log("Accuracy for sample1:", acc1, acc2, acc3);

const acc4 = getAcc(answer["sample2"], data["sample2"][0], threshold);
const acc5 = getAcc(answer["sample2"], data["sample2"][1], threshold);
const acc6 = getAcc(answer["sample2"], data["sample2"][2], threshold);
console.log("Accuracy for sample2:", acc4, acc5, acc6);