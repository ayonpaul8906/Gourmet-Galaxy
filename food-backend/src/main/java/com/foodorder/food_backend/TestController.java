// package com.foodorder.food_backend;

// import com.google.cloud.firestore.Firestore;
// import com.google.cloud.firestore.DocumentReference;
// import com.google.api.core.ApiFuture;
// import com.google.cloud.firestore.WriteResult;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;
// import java.util.HashMap;
// import java.util.Map;

// @RestController
// public class TestController {

//     private final Firestore firestore;

//     public TestController(Firestore firestore) {
//         this.firestore = firestore;
//     }

//     @GetMapping("/api/test")
//     public String testFirestore() {
//         try {
//             Map<String, Object> data = new HashMap<>();
//             data.put("name", "Test Burger");
//             data.put("price", 120);

//             DocumentReference docRef = firestore.collection("foods").document("burger1");
//             ApiFuture<WriteResult> result = docRef.set(data);

//             return "✅ Firestore connected! Data written at: " + result.get().getUpdateTime();
//         } catch (Exception e) {
//             e.printStackTrace();
//             return "❌ Error: " + e.getMessage();
//         }
//     }
// }
