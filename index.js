const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("wordInput");
const message = document.getElementById("message");
const resultSection = document.getElementById("result");
const resultWord = document.getElementById("resultWord");
const resultPhonetic = document.getElementById("resultPhonetic");
const meaningsContainer = document.getElementById("meaningsContainer");
const synonymsContainer = document.getElementById("synonymsContainer");
const sourceContainer = document.getElementById("sourceContainer");
const audioPlayer = document.getElementById("audioPlayer");

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

function extractAudio(phonetics) {
  if (!phonetics || !Array.isArray(phonetics)) return "";
  const audioItem = phonetics.find(item => item.audio && item.audio.trim() !== "");
  return audioItem ? audioItem.audio : "";
}

function extractSynonyms(meanings) {
  const synonymSet = new Set();
  meanings.forEach((meaning) => {
    if (meaning.synonyms && meaning.synonyms.length) {
      meaning.synonyms.forEach((syn) => synonymSet.add(syn));
    }
    if (meaning.definitions && meaning.definitions.length) {
      meaning.definitions.forEach((def) => {
        if (def.synonyms && def.synonyms.length) {
          def.synonyms.forEach((syn) => synonymSet.add(syn));
        }
      });
    }
  });
  return [...synonymSet];
}

function displayWord(data) {
  const entry = data[0];
  resultWord.textContent = entry.word;
  resultPhonetic.textContent = entry.phonetic || "";

  meaningsContainer.innerHTML = "";
  synonymsContainer.innerHTML = "";
  sourceContainer.innerHTML = "";

  const audioUrl = extractAudio(entry.phonetics);
  if (audioUrl) {
    audioPlayer.src = audioUrl;
    audioPlayer.classList.remove("hidden");
  } else {
    audioPlayer.classList.add("hidden");
  }

  entry.meanings.forEach((meaning) => {
    const block = document.createElement("div");
    block.classList.add("meaning-block");

    const partOfSpeech = document.createElement("h3");
    partOfSpeech.textContent = meaning.partOfSpeech;
    block.appendChild(partOfSpeech);

    meaning.definitions.slice(0, 2).forEach((defObj, index) => {
      const def = document.createElement("p");
      def.classList.add("definition");
      def.textContent = `${index + 1}. ${defObj.definition}`;
      block.appendChild(def);

      if (defObj.example) {
        const example = document.createElement("p");
        example.style.fontStyle = "italic";
        example.textContent = `Example: ${defObj.example}`;
        block.appendChild(example);
      }
    });

    meaningsContainer.appendChild(block);
  });

  const synonyms = extractSynonyms(entry.meanings);
  if (synonyms.length > 0) {
    synonyms.forEach((syn) => {
      const span = document.createElement("span");
      span.textContent = syn;
      synonymsContainer.appendChild(span);
    });
  }

  if (entry.sourceUrls && entry.sourceUrls.length > 0) {
    sourceContainer.innerHTML = `Source: <a href="${entry.sourceUrls[0]}" target="_blank" rel="noopener noreferrer">${entry.sourceUrls[0]}</a>`;
  }

  resultSection.classList.remove("hidden");
}

async function fetchWordData(word) {
  const cleanWord = word.trim().toLowerCase();

  if (!cleanWord) {
    showMessage("Please enter a word", "error");
    resultSection.classList.add("hidden");
    return;
  }

  showMessage("Searching...", "success");

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    displayWord(data);
    showMessage("", "");
  } catch (error) {
    resultSection.classList.add("hidden");
    showMessage(error.message, "error");
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchWordData(wordInput.value);
});
