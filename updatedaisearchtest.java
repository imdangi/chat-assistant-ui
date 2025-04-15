import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;

public class AzureSearchWebClient {

    public static void main(String[] args) {
        WebClient client = WebClient.builder()
            .baseUrl("https://<your-service>.search.windows.net")
            .defaultHeader("api-key", "<your-api-key>")
            .build();

        try {
            String response = client.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/indexes")
                    .queryParam("api-version", "2023-10-01-Preview")
                    .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();  // Block the current thread and get the response

            System.out.println("Response:\n" + response);
        } catch (Exception e) {
            System.err.println("Error occurred: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
