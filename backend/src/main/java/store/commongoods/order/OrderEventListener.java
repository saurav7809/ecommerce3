package store.commongoods.order;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderEventListener {
    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    @RabbitListener(queues = "store.orders")
    public void onOrderPlaced(OrderEvents.OrderPlaced event) {
        log.info("Async background worker: Received OrderPlaced event for reference: [{}], customer: [{}]",
                event.reference(), event.email());
        // Simulates async processing: invoice generation, warehouse notification, email dispatch
    }
}

