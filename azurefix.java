@Configuration
@EnableConfigurationProperties(AzureOpenaiClientProperties.class)
public class AzureOpenAiConfig {

    @Bean
    public HttpClient httpClient(AzureOpenaiClientProperties properties) {
        return new NettyAsyncHttpClientBuilder()
                .connectTimeout(properties.getConnectTimeout())
                .responseTimeout(properties.getCallTimeout())
                .build();
    }

    @Bean
    public OpenAIClient openAiClient(HttpClient httpClient, AzureOpenaiClientProperties properties) {
        return new OpenAIClientBuilder()
                .endpoint(properties.getEmbeddingsEndpoint())
                .httpLogOptions(new HttpLogOptions().setLogLevel(HttpLogDetailLevel.BODY_AND_HEADERS))
                .retryPolicy(new RetryPolicy(new ExponentialBackoff(
                        properties.getMaxRetries(),
                        properties.getDelay(),
                        properties.getMaxDelay()
                )))
                .httpClient(httpClient)
                .buildClient();
    }
}
