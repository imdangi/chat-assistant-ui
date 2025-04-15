import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import reactor.core.publisher.Mono;

public class AzureSearchWebClient {

    public static void main(String[] args) {
        WebClient client = WebClient.builder()
            .baseUrl("https://<your-service>.search.windows.net")
            .defaultHeader("api-key", "<your-api-key>")
            .build();

        Mono<String> response = client.get()
            .uri(uriBuilder -> uriBuilder
                .path("/indexes")
                .queryParam("api-version", "2023-10-01-Preview")
                .build())
            .retrieve()
            .bodyToMono(String.class);

        response.subscribe(System.out::println, error -> {
            System.err.println("Error: " + error.getMessage());
        });
    }
}
