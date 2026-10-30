package store.commongoods.order;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class OrderEvents {
    public record OrderPlaced(String reference,String email) { }
    private final RabbitTemplate rabbit;
    public OrderEvents(RabbitTemplate rabbit) { this.rabbit=rabbit; }
    @TransactionalEventListener(phase=TransactionPhase.AFTER_COMMIT)
    public void send(OrderPlaced event) { rabbit.convertAndSend("store.events","orders.placed",event); }
}
