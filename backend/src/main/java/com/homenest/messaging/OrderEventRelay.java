package com.homenest.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Forwards order events only after the database transaction has committed. */
@Component
public class OrderEventRelay {
    private static final Logger log = LoggerFactory.getLogger(OrderEventRelay.class);
    private final OrderEventPublisher publisher;

    public OrderEventRelay(OrderEventPublisher publisher) {
        this.publisher = publisher;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        try {
            publisher.publish(event);
        } catch (RuntimeException e) {
            // The order is already saved; a broker outage must not turn a successful checkout into an error.
            log.error("Could not publish event for order {}: {}", event.reference(), e.getMessage());
        }
    }
}
