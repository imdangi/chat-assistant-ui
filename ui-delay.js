let messageBuffer = ''; // Buffer to accumulate chunks of text
const wordThreshold = 8; // Set threshold for 8-10 words
let wordCount = 0; // Track the number of words
let typingTimeout = null; // Timeout reference for the delay

// Function to append message to the bot message bubble
function appendToBotMessage(newText) {
  // Split the new text into words
  const words = newText.split(' ');
  wordCount += words.length;

  // Add the new words to the message buffer
  messageBuffer += newText;

  // If we have reached the word threshold, trigger the update with a delay
  if (wordCount >= wordThreshold) {
    // If there's a previous timeout, clear it
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a timeout to delay the update to the UI
    typingTimeout = setTimeout(() => {
      currentBotMessage += messageBuffer; // Complete the bot message
      currentBotMessageElement.querySelector('div.w-full').innerHTML = `${currentBotMessage}<div class="text-xs mt-1 opacity-70 text-right">${formatTime()}</div>`;
      chatWindow.scrollTop = chatWindow.scrollHeight;

      // Reset the buffer and word count for the next part of the message
      messageBuffer = '';
      wordCount = 0;
    }, 200); // Delay of 200ms (can be adjusted)
  }
}

// Function to handle streaming and append data incrementally
function readStream() {
  reader.read().then(({ done, value }) => {
    if (done) {
      console.log("Stream finished");
      typingIndicator.classList.add('hidden');
      return;
    }

    // Convert the stream chunk into a string and process it
    const chunk = decoder.decode(value, { stream: true });

    // Assuming each SSE message is separated by newlines (based on typical SSE format)
    const messages = chunk.split('\n');

    messages.forEach(msg => {
      if (msg.trim().startsWith("data:")) {
        const data = msg.substring(5).trim();  // Extract the actual message data
        if (data) {
          appendToBotMessage(data);  // Append the data to the buffer
        }
      }
    });

    // Continue reading the stream
    readStream();
  }).catch(error => {
    console.error("Stream read error:", error);
    typingIndicator.classList.add('hidden');
    appendMessage("⚠️ Error receiving data", false);
  });
}
