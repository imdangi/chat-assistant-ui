function readStream() {
                        reader.read().then(({ done, value }) => {
                            if (done) return;
                            let chunk = new TextDecoder().decode(value);
                            let matches = chunk.match(/data: (.*)/g);
                            if (matches) {
                                matches.forEach(match => {
                                    responseText.textContent += match.replace("data: ", " ");
                                });
                            }
                            chatBox.scrollTop = chatBox.scrollHeight;
                            readStream();
                        });
                    }
