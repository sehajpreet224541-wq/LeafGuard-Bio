const MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/J4FudREdI/";

let model = null;
let selectedImage = false;

const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const button = document.getElementById("analyzeButton");
const result = document.getElementById("result");

const diseaseInfo = {
  "Early Blight": {
    description: "A fungal disease that commonly affects tomato leaves.",
    symptoms: "Dark spots with concentric ring patterns and yellowing around affected areas.",
    prevention: "Remove affected leaves, avoid overhead watering, improve airflow and use appropriate disease-management practices."
  },

  "Late Blight": {
    description: "A serious tomato disease caused by Phytophthora infestans.",
    symptoms: "Irregular dark lesions that can spread rapidly, especially in cool and humid conditions.",
    prevention: "Avoid prolonged leaf wetness, improve air circulation, monitor plants regularly and follow local agricultural guidance."
  },

  "Healthy": {
    description: "The model identifies this image as belonging to the healthy tomato class.",
    symptoms: "No disease pattern was identified by the model.",
    prevention: "Continue regular monitoring, proper watering and balanced plant care."
  }
};

async function loadModel() {
  try {
    model = await tmImage.load(
      MODEL_URL + "model.json",
      MODEL_URL + "metadata.json"
    );

    button.disabled = false;
    button.textContent = "Analyze Leaf";

    result.textContent = "LeafGuard AI is ready!";
  } catch (error) {
    result.textContent = "Unable to load the AI model. Check your internet connection.";
    console.error(error);
  }
}

input.addEventListener("change", function () {
  const file = input.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    result.textContent = "Please select a valid image.";
    return;
  }

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";

  selectedImage = true;
  result.textContent = "Image selected. Ready for analysis!";
});

button.addEventListener("click", async function () {
  if (!model || !selectedImage) {
    result.textContent = "Please select an image first.";
    return;
  }

  button.disabled = true;
  result.textContent = "Analyzing leaf...";

  try {
    const predictions = await model.predict(preview);

    predictions.sort(
      (a, b) => b.probability - a.probability
    );

    const best = predictions[0];
    const info = diseaseInfo[best.className];

    let output = `
      <div class="prediction">
        <h2>${best.className}</h2>
        <h3>Confidence: ${(best.probability * 100).toFixed(2)}%</h3>
      </div>
    `;

    if (info) {
      output += `
        <div class="prediction">
          <h3>Disease Information</h3>
          <p>${info.description}</p>
          <br>
          <h3>Symptoms</h3>
          <p>${info.symptoms}</p>
          <br>
          <h3>Prevention and Care</h3>
          <p>${info.prevention}</p>
        </div>
      `;
    }

    output += "<h3>Class Predictions</h3>";

    predictions.forEach(p => {
      output += `
        <p>
          ${p.className}:
          ${(p.probability * 100).toFixed(2)}%
        </p>
      `;
    });

    output += `
      <p class="warning">
        Experimental AI prediction only. This result is not
        a confirmed plant disease diagnosis.
      </p>
    `;

    result.innerHTML = output;

  } catch (error) {
    result.textContent = "Analysis failed. Please try again.";
    console.error(error);
  }

  button.disabled = false;
});

loadModel();