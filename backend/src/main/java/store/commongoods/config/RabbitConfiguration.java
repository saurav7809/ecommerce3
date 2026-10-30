package store.commongoods.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

@Configuration
public class RabbitConfiguration {
    @Bean public Binding orderEventsBinding(Queue orderQueue, TopicExchange storeEvents) { return BindingBuilder.bind(orderQueue).to(storeEvents).with("orders.*"); }
    @Bean public Jackson2JsonMessageConverter rabbitMessageConverter() { return new Jackson2JsonMessageConverter(); }
}
