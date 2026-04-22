const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("word");
const resultContainer = document.getElementById("result");
const messageDisplay = document.getElementById("message");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchWord = wordInput.value.trim().toLowerCase();

  resultContainer.classList.add("hidden");
  messageDisplay.textContent = "Searching...";

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`
    );

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const responseData = await response.json();
    displayWordData(responseData[0]);

    messageDisplay.textContent = "";
  } catch (error) {
    messageDisplay.textContent = error.message;
  }
});

function displayWordData(wordData) {
  const audioUrl = wordData.phonetics.find((phonetic) => phonetic.audio)?.audio;

  const synonymList = wordData.meanings.flatMap((meaning) => meaning.synonyms || []).slice(0, 5);

  resultContainer.innerHTML = `
    <h2>${wordData.word}</h2>
    <p>${wordData.phonetic || ""}</p>

    ${
      audioUrl
        ? `<button onclick="new Audio('${audioUrl}').play()">🔊 Pronunciation</button>`
        : ""
    }

    <p><strong>${wordData.meanings[0].partOfSpeech}</strong></p>
    <p>${wordData.meanings[0].definitions[0].definition}</p>
    <p><em>${wordData.meanings[0].definitions[0].example || ""}</em></p>

    <p><strong>Synonyms:</strong> ${
      synonymList.length ? synonymList.join(", ") : "None"
    }</p>
  `;

  resultContainer.classList.remove("hidden");
}