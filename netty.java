package com.sample;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.core.credential.AzureKeyCredential;
import com.azure.core.http.HttpClient;
import com.azure.core.http.netty.NettyAsyncHttpClientBuilder;
import com.azure.core.http.okhttp.OkHttpAsyncHttpClientBuilder;
import com.azure.core.http.policy.ExponentialBackoff;
import com.azure.core.http.policy.HttpLogDetailLevel;
import com.azure.core.http.policy.HttpLogOptions;
import com.azure.core.http.policy.RetryPolicy;
import okhttp3.OkHttpClient;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(AzureOpenaiClientProperties.class)
public class AzureOpenAiConfig {

    @Bean
    @Profile("netty")
    public HttpClient nettyHttpClient(AzureOpenaiClientProperties properties) {
        return new NettyAsyncHttpClientBuilder()
                .connectTimeout(properties.getConnectTimeout())
                .responseTimeout(properties.getCallTimeout())
                .build();
    }

    @Bean
    @Profile("okhttp")
    public HttpClient okOpenAiClient(AzureOpenaiClientProperties properties) {
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(properties.getConnectTimeout())
                .callTimeout(properties.getCallTimeout())
                .build();

        return new OkHttpAsyncHttpClientBuilder(okHttpClient).build();
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
