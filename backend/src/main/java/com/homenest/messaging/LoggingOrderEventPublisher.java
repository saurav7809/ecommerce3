package com.homenest.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Default when RabbitMQ is not configured: the event is only logged. */
@Component
@ConditionalOnProperty(prefix = "app.messaging", name = "enabled", havingValue = "false", matchIfMissing = true)
public class LoggingOrderEventPublisher implements OrderEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(LoggingOrderEventPublisher.class);

    @Override
    public void publish(OrderPlacedEvent event) {
        log.info("Order placed {} for {} (total {}). Set MESSAGING_ENABLED=true to publish to RabbitMQ.",
                event.reference(), event.email(), event.total());
    }
}
