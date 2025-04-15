import io.netty.handler.ssl.SslContextBuilder;
import reactor.netty.http.client.HttpClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import javax.net.ssl.SSLException;

public class SecureWebClient {

    public static WebClient createSecureWebClient() throws SSLException {
        HttpClient httpClient = HttpClient.create()
            .secure(sslContextSpec -> {
                try {
                    sslContextSpec.sslContext(SslContextBuilder.forClient()
                        .protocols("TLSv1.2", "TLSv1.3")
                        .build());
                } catch (SSLException e) {
                    throw new RuntimeException(e);
                }
            });

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .baseUrl("https://<your-service>.search.windows.net")
            .defaultHeader("api-key", "<your-api-key>")
            .build();
    }
}
