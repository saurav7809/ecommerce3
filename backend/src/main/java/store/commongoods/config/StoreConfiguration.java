package store.commongoods.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration @EnableCaching @EnableRabbit
public class StoreConfiguration {
    @Bean public Queue orderQueue() { return new Queue("store.orders", true); }
    @Bean public TopicExchange storeEvents() { return new TopicExchange("store.events", true, false); }
}
