<script>
  const chatWindow = document.getElementById('chatWindow');
  const input = document.getElementById('userInput');
  const typingIndicator = document.getElementById('typingIndicator');

  function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage(text, isUser) {
    const wrapper = document.createElement('div');
    wrapper.className = isUser ? 'flex justify-end' : 'flex justify-start';

    // Avatar/Icon
    const avatar = document.createElement('div');
    avatar.className = 'w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white text-sm font-bold';
    avatar.innerText = isUser ? 'U' : 'B';

    // Message Bubble
    const bubble = document.createElement('div');
    bubble.className = `ml-2 p-3 rounded-lg max-w-xs ${
      isUser
        ? 'bg-indigo-600 text-white shadow-md'
        : 'bg-gray-200 text-black shadow-sm'
    }`;

    bubble.innerHTML = `${text}<div class="text-xs mt-1 opacity-70 text-right">${formatTime()}</div>`;

    // Message container
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

  function handleKey(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, true); // User's message
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
                  typingIndicator.classList.add('hidden');
                  appendMessage(data, false);  // Append bot's response
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

  // Function to clear the chat window
  function clearChat() {
    chatWindow.innerHTML = '';
  }

</script>
