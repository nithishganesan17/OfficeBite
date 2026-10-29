package com.officebite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private String menuItemId;
    private String itemName;
    private double unitPrice;
    private int quantity;
    private double subtotal;
    private String imageUrl;
}
