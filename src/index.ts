import * as tf from "@tensorflow/tfjs";

const printf = require("printf");

const size = 28;
const zoom = 10;
const safe = 30;

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
canvas.width = canvas.height = size * zoom + safe * 2;

const canvasInput = document.querySelector(
  "#canvas-input"
) as HTMLCanvasElement;
canvasInput.width = canvasInput.height = size;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.lineJoin = "round";

const ctxInput = canvasInput.getContext("2d") as CanvasRenderingContext2D;
(ctxInput as any).imageSmoothingQuality = "high";

document.querySelector("#clear-canvas")!.addEventListener("click", () => {
  ctx.clearRect(0, 0, size * zoom + safe * 2, size * zoom + safe * 2);
  ctx.beginPath();
  ctxInput.clearRect(0, 0, size, size);
});

let drawing = false;
let timer: number;

canvas.addEventListener("mousemove", ev => {
  if (drawing) {
    ctx.lineTo(ev.offsetX, ev.offsetY);
    ctx.stroke();

    clearTimeout(timer);
    timer = setTimeout(() => {
      predict();
    });
  }
});

canvas.addEventListener("mousedown", ev => {
  ctx.moveTo(ev.offsetX, ev.offsetY);
  drawing = true;
});

canvas.addEventListener("mouseup", ev => {
  drawing = false;
});

canvas.addEventListener("touchmove", ev => {
  if (drawing) {
    ctx.lineTo(ev.touches[0].clientX, ev.touches[0].clientY);
    ctx.stroke();

    clearTimeout(timer);
    timer = setTimeout(() => {
      predict();
    });
  }
});

canvas.addEventListener("touchstart", ev => {
  ctx.moveTo(ev.touches[0].clientX, ev.touches[0].clientY);
  drawing = true;
});

canvas.addEventListener("touchend", ev => {
  drawing = false;
});

function predict() {
  ctxInput.drawImage(
    canvas,
    safe,
    safe,
    size * zoom,
    size * zoom,
    0,
    0,
    size,
    size
  );

  const image = ctxInput.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = image.data[i + 1] = image.data[i + 2] = image.data[i + 3];
  }
  const input = tf.tidy(() =>
    tf
      .fromPixels(image, 1)
      .cast("float32")
      .div(tf.scalar(255, "float32"))
      .expandDims(0)
  );

  const result = (model.predict(input) as tf.Tensor<tf.Rank>).dataSync();

  const scoreEls = document.querySelectorAll("#predict tr");
  for (let i = 0; i < scoreEls.length; i++) {
    const score = result[i] * 100;
    scoreEls[i].querySelector(".score")!.textContent = printf("%5.1f", score);
    (scoreEls[i].querySelector(
      ".bar"
    )! as HTMLElement).style.width = `${score}%`;
  }
}

let model: tf.Model;

(async () => {
  model = await tf.loadModel("model/model.json");
  document.body.className = "";
})();
