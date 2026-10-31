package com.homenest.messaging;

import java.math.BigDecimal;

/** Published after an order commits. Consumers: confirmation e-mail, warehouse, analytics. */
public record OrderPlacedEvent(String reference, String email, String customerName, BigDecimal total,
                               int itemCount, String paymentMethod) { }
