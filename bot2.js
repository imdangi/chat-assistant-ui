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
              if (msg.trim()) {
                typingIndicator.classList.add('hidden');
                appendMessage(msg, false);  // Append bot's response
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
