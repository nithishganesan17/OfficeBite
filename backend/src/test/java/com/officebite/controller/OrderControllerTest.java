package com.officebite.controller;

import com.officebite.dto.CreateOrderRequest;
import com.officebite.dto.OrderItemRequest;
import com.officebite.dto.OrderItemResponse;
import com.officebite.dto.OrderResponse;
import com.officebite.dto.UpdateOrderStatusRequest;
import com.officebite.exception.GlobalExceptionHandler;
import com.officebite.exception.InvalidOrderException;
import com.officebite.exception.InvalidStatusTransitionException;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.OrderStatus;
import com.officebite.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(orderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Direct unit test: createOrder should return 201 Created with OrderResponse")
    void testCreateOrder_directUnitCall() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(List.of(new OrderItemRequest("dish-1", 2)))
                .build();

        OrderResponse expectedResponse = OrderResponse.builder()
                .id(1L)
                .orderNumber("OB-8492")
                .tokenNumber("A-42")
                .customerName("Rahul Sharma")
                .status(OrderStatus.PLACED)
                .totalAmount(360.0)
                .build();

        when(orderService.createOrder(any())).thenReturn(expectedResponse);

        ResponseEntity<OrderResponse> responseEntity = orderController.createOrder(request);

        assertNotNull(responseEntity);
        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertEquals("OB-8492", responseEntity.getBody().getOrderNumber());
        assertEquals(360.0, responseEntity.getBody().getTotalAmount());
    }

    @Test
    @DisplayName("Direct unit test: getOrder should return 200 OK")
    void testGetOrder_directUnitCall() {
        OrderResponse expectedResponse = OrderResponse.builder()
                .id(1L)
                .orderNumber("OB-8492")
                .status(OrderStatus.PREPARING)
                .build();

        when(orderService.getOrderByIdOrNumber("OB-8492")).thenReturn(expectedResponse);

        ResponseEntity<OrderResponse> responseEntity = orderController.getOrder("OB-8492");

        assertNotNull(responseEntity);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(OrderStatus.PREPARING, responseEntity.getBody().getStatus());
    }

    @Test
    @DisplayName("Direct unit test: updateOrderStatus should return 200 OK")
    void testUpdateOrderStatus_directUnitCall() {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(OrderStatus.PREPARING);

        OrderResponse expectedResponse = OrderResponse.builder()
                .id(1L)
                .orderNumber("OB-8492")
                .status(OrderStatus.PREPARING)
                .build();

        when(orderService.updateOrderStatus("OB-8492", OrderStatus.PREPARING)).thenReturn(expectedResponse);

        ResponseEntity<OrderResponse> responseEntity = orderController.patchOrderStatus("OB-8492", request);

        assertNotNull(responseEntity);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(OrderStatus.PREPARING, responseEntity.getBody().getStatus());
    }

    @Test
    @DisplayName("MockMvc: POST /api/orders should return 201 Created with JSON")
    void testMockMvc_createOrder_success() throws Exception {
        OrderResponse response = OrderResponse.builder()
                .id(1L)
                .orderNumber("OB-8492")
                .tokenNumber("A-42")
                .customerName("Rahul Sharma")
                .status(OrderStatus.PLACED)
                .totalAmount(360.0)
                .items(List.of(
                        OrderItemResponse.builder()
                                .id(101L)
                                .menuItemId("dish-1")
                                .itemName("Deluxe North Indian Thali")
                                .unitPrice(180.0)
                                .quantity(2)
                                .subtotal(360.0)
                                .build()
                ))
                .build();

        when(orderService.createOrder(any())).thenReturn(response);

        String jsonPayload = """
                {
                  "customerName": "Rahul Sharma",
                  "employeeId": "OB-7821",
                  "deliveryType": "CANTEEN_PICKUP",
                  "items": [
                    { "menuItemId": "dish-1", "quantity": 2 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value("OB-8492"))
                .andExpect(jsonPath("$.tokenNumber").value("A-42"))
                .andExpect(jsonPath("$.status").value("PLACED"))
                .andExpect(jsonPath("$.totalAmount").value(360.0));
    }

    @Test
    @DisplayName("MockMvc: POST /api/orders should return 400 when customer name is blank")
    void testMockMvc_createOrder_missingCustomerName_returns400() throws Exception {
        String invalidJson = """
                {
                  "customerName": "",
                  "items": [
                    { "menuItemId": "dish-1", "quantity": 1 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors.customerName").exists());
    }

    @Test
    @DisplayName("MockMvc: POST /api/orders should return 400 when quantity is 0")
    void testMockMvc_createOrder_zeroQuantity_returns400() throws Exception {
        String invalidJson = """
                {
                  "customerName": "Rahul Sharma",
                  "items": [
                    { "menuItemId": "dish-1", "quantity": 0 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("MockMvc: POST /api/orders should return 404 when item does not exist")
    void testMockMvc_createOrder_itemNotFound_returns404() throws Exception {
        when(orderService.createOrder(any())).thenThrow(
                new ResourceNotFoundException("Menu item not found with ID: dish-nonexistent"));

        String jsonPayload = """
                {
                  "customerName": "Rahul Sharma",
                  "items": [
                    { "menuItemId": "dish-nonexistent", "quantity": 1 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(jsonPayload))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Menu item not found with ID: dish-nonexistent"));
    }

    @Test
    @DisplayName("MockMvc: PATCH /api/orders/{id}/status should return 400 on invalid transition")
    void testMockMvc_patchOrderStatus_invalidTransition_returns400() throws Exception {
        when(orderService.updateOrderStatus(eq("OB-8492"), eq(OrderStatus.PLACED))).thenThrow(
                new InvalidStatusTransitionException("Invalid status transition from COMPLETED to PLACED"));

        String jsonPayload = """
                { "status": "PLACED" }
                """;

        mockMvc.perform(patch("/api/orders/OB-8492/status")
                        .contentType("application/json")
                        .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_STATUS_TRANSITION"));
    }
}
