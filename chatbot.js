const chatbotBtn = document.getElementById("chatbot-btn");
const chatbot = document.getElementById("chatbot");
const chatBody = document.getElementById("chat-body");

chatbotBtn.onclick = toggleChat;

function toggleChat() {
  chatbot.classList.toggle("hidden");
}

function addMessage(text, className) {
  const msg = document.createElement("div");
  msg.className = className;
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("chat-text");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user-msg");
  input.value = "";

  setTimeout(() => handleBotResponse(text), 500);
}
const OPENAI_API_KEY = "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";

async function askAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful news assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

function handleBotResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes("finance")) {
    fetchNews("finance");
    addMessage("Here are the latest finance news 📈", "bot-msg");
  }
  else if (msg.includes("politics")) {
    fetchNews("politics");
    addMessage("Showing political news 🏛️", "bot-msg");
  }
  else if (msg.includes("sports") || msg.includes("ipl")) {
    fetchNews("ipl");
    addMessage("Here’s the latest sports news 🏏", "bot-msg");
  }
  else if (msg.includes("positive")) {
    fetchNews("good news");
    addMessage("Fetching some positive news 🌟", "bot-msg");
  }
  else if (msg.includes("india")) {
    fetchNews("India");
    addMessage("Latest news from India 🇮🇳", "bot-msg");
  }
  else if (msg.includes("help")) {
    addMessage(
      "You can ask:\n• Finance news\n• Political updates\n• Positive news\n• India news",
      "bot-msg"
    );
  }
else {
  addMessage("🤖 Thinking...", "bot-msg");

  askAI(message)
    .then(reply => {
      addMessage(reply, "bot-msg");
    })
    .catch(() => {
      addMessage("⚠️ AI service is unavailable right now.", "bot-msg");
    });
}

}

function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input not supported in this browser");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const voiceText = event.results[0][0].transcript;
    document.getElementById("chat-text").value = voiceText;
    sendMessage();
  };

  recognition.start();
}

