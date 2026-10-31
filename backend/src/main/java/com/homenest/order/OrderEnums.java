package com.homenest.order;

import java.util.EnumSet;
import java.util.Set;

public final class OrderEnums {
    private OrderEnums() { }

    public enum OrderStatus {
        PENDING_PAYMENT, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED;

        /** Status changes an administrator may make from this status. */
        public Set<OrderStatus> next() {
            return switch (this) {
                case PENDING_PAYMENT -> EnumSet.of(CONFIRMED, CANCELLED);
                case CONFIRMED -> EnumSet.of(PROCESSING, SHIPPED, CANCELLED);
                case PROCESSING -> EnumSet.of(SHIPPED, CANCELLED);
                case SHIPPED -> EnumSet.of(DELIVERED);
                case DELIVERED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
            };
        }

        public boolean customerCancellable() {
            return this == PENDING_PAYMENT || this == CONFIRMED || this == PROCESSING;
        }
    }

    public enum PaymentStatus { PENDING, PAID, FAILED, REFUND_PENDING }

    public enum PaymentMethod { RAZORPAY, COD }
}
