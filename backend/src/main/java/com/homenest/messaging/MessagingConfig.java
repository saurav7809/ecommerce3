package com.homenest.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

/**
 * RabbitMQ wiring (local broker or a hosted one such as CloudAMQP). Active only with MESSAGING_ENABLED=true.
 */
@Configuration
@ConditionalOnProperty(prefix = "app.messaging", name = "enabled", havingValue = "true")
public class MessagingConfig {
    public static final String EXCHANGE = "homenest.events";
    public static final String ORDER_QUEUE = "homenest.orders.placed";
    public static final String ORDER_PLACED_KEY = "orders.placed";

    @Bean TopicExchange homenestEvents() { return new TopicExchange(EXCHANGE, true, false); }

    @Bean Queue orderPlacedQueue() { return QueueBuilder.durable(ORDER_QUEUE).build(); }

    @Bean Binding orderPlacedBinding(Queue orderPlacedQueue, TopicExchange homenestEvents) {
        return BindingBuilder.bind(orderPlacedQueue).to(homenestEvents).with(ORDER_PLACED_KEY);
    }

    @Bean MessageConverter rabbitMessageConverter() { return new Jackson2JsonMessageConverter(); }

    @Component
    @ConditionalOnProperty(prefix = "app.messaging", name = "enabled", havingValue = "true")
    static class RabbitOrderEventPublisher implements OrderEventPublisher {
        private final RabbitTemplate rabbit;

        RabbitOrderEventPublisher(RabbitTemplate rabbit) { this.rabbit = rabbit; }

        @Override
        public void publish(OrderPlacedEvent event) {
            rabbit.convertAndSend(EXCHANGE, ORDER_PLACED_KEY, event);
        }
    }

    /** Background worker: in production this would send the confirmation e-mail and notify the warehouse. */
    @Component
    @ConditionalOnProperty(prefix = "app.messaging", name = "enabled", havingValue = "true")
    static class OrderPlacedListener {
        private static final Logger log = LoggerFactory.getLogger(OrderPlacedListener.class);

        @RabbitListener(queues = ORDER_QUEUE)
        void onOrderPlaced(OrderPlacedEvent event) {
            log.info("Worker received order {} for {} ({} items, {} via {})",
                    event.reference(), event.email(), event.itemCount(), event.total(), event.paymentMethod());
        }
    }
}
