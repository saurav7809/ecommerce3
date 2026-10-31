package com.homenest.messaging;

public interface OrderEventPublisher {
    void publish(OrderPlacedEvent event);
}
