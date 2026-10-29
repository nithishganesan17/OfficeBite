package com.officebite.dto;

import com.officebite.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String orderNumber;
    private String tokenNumber;
    private String customerName;
    private String customerEmail;
    private String employeeId;
    private String deliveryType;
    private String deliveryLocation;
    private String specialInstructions;
    private OrderStatus status;
    private String statusLabel;
    private double subtotal;
    private double totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}
