<script>
    const chatWindow = document.getElementById('chatWindow');
    const input = document.getElementById('userInput');
    const typingIndicator = document.getElementById('typingIndicator');

    // To keep track of the latest bot message element
    let botMessageElement = null;

    function formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function appendMessage(text, isUser) {
      const wrapper = document.createElement('div');
      wrapper.className = isUser ? 'flex justify-end' : 'flex justify-start';

      const avatar = document.createElement('div');
      avatar.className = 'w-8 h-8 bg-blue-500 dark:bg-blue-300 rounded-full flex items-center justify-center text-white text-sm font-bold';
      avatar.innerText = isUser ? 'U' : 'B';

      const bubble = document.createElement('div');
      bubble.className = `ml-2 p-3 rounded-lg max-w-xs ${
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 dark:text-white text-black'
      }`;
      bubble.innerHTML = `${text}<div class="text-xs mt-1 opacity-70 text-right">${formatTime()}</div>`;

      const container = document.createElement('div');
      container.className = 'flex items-start space-x-2';
      if (isUser) {
        container.appendChild(bubble);
        container.appendChild(avatar);
      } else {
        container.appendChild(avatar);
        container.appendChild(bubble);
      }

      wrapper.appendChild(container);
      chatWindow.appendChild(wrapper);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Append bot message while retaining all previous bot messages
    function appendBotMessage(text) {
      if (!botMessageElement) {
        // Create a new bot message container if it's the first response
        botMessageElement = document.createElement('div');
        botMessageElement.className = 'flex justify-start';

        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 bg-green-500 dark:bg-green-300 rounded-full flex items-center justify-center text-white text-sm font-bold';
        avatar.innerText = 'B';

        const bubble = document.createElement('div');
        bubble.className = `ml-2 p-3 rounded-lg max-w-xs bg-gray-200 dark:bg-gray-700 dark:text-white text-black`;
        bubble.innerHTML = `${text}<div class="text-xs mt-1 opacity-70 text-right">${formatTime()}</div>`;

        const container = document.createElement('div');
        container.className = 'flex items-start space-x-2';
        container.appendChild(avatar);
        container.appendChild(bubble);

        botMessageElement.appendChild(container);
        chatWindow.appendChild(botMessageElement);
      } else {
        // Update the existing bot message bubble
        const bubble = botMessageElement.querySelector('div.max-w-xs');
        bubble.innerHTML += `<div class="mt-2">${text}<div class="text-xs mt-1 opacity-70 text-right">${formatTime()}</div></div>`;
      }

      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function handleKey(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    }

    function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      // Append user message
      appendMessage(message, true);
      input.value = '';
      input.focus();

      typingIndicator.classList.remove('hidden');

      // Send user message to backend via POST request
      fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          console.log('Message sent to backend');

          // Handle the event stream data from the backend
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;

          // Function to process the SSE stream
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
                    // If bot message doesn't exist, create it
                    appendBotMessage(data);  // Append the bot's message as a new update
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

          // Start reading from the stream
          readStream();
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
    }

    function clearChat() {
      chatWindow.innerHTML = '';
      fetch('/api/chat/clear', { method: 'POST' });
    }

    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
    }
  </script>
