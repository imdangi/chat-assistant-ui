<script>
        function sendMessage() {
            const inputField = document.getElementById("user-input");
            const message = inputField.value.trim();
            if (message) {
                const chatBox = document.getElementById("chat-box");
                const userMessage = document.createElement("div");
                userMessage.classList.add("message-container", "user-message", "d-flex");
                userMessage.innerHTML = `<span class="message-text">${message}</span>
                                         <i class="bi bi-person-circle user-icon"></i>`;
                chatBox.appendChild(userMessage);
                inputField.value = "";
                chatBox.scrollTop = chatBox.scrollHeight;

                // Make API call with 'q' parameter using POST method
                fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
                    body: JSON.stringify({ q: message })
                }).then(response => {
                    const reader = response.body.getReader();
                    let responseMessage = document.createElement("div");
                    responseMessage.classList.add("message-container", "assistant-message", "d-flex");
                    responseMessage.innerHTML = `<i class="bi bi-robot assistant-icon"></i>
                                                <span class="message-text">Assistant: </span>`;
                    let responseText = responseMessage.querySelector(".message-text");
                    chatBox.appendChild(responseMessage);
                    
                    function readStream() {
                        reader.read().then(({ done, value }) => {
                            if (done) return;
                            responseText.textContent += new TextDecoder().decode(value);
                            chatBox.scrollTop = chatBox.scrollHeight;
                            readStream();
                        });
                    }
                    readStream();
                }).catch(error => console.error('Error:', error));
            }
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
    </script>
