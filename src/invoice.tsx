import { nanoid } from 'nanoid'
class invoice {
    template: string = `{
        "order": { "orderNumber": "rpEQkv1CTlqgCn5kB5XbKA", "items": [ { "dish": { "displayNumber": "A12", "description": "", "hide_instructions": false, "thumbImage": "https://firebasestorage.googleapis.com/v0/b/orderbuddy-668.appspot.com/o/juicybao%2fmenu%2fa7cc534f-933c-4fb0-9298-5a050f4e2ea7.jpg?alt=media", "sizes": [], "unqiueId": "a7cc534f-933c-4fb0-9298-5a050f4e2ea7", "price": 11.3, "menuId": "GCbaDLEZPHGmVBq1y5l3", "active_begin": null, "altName": "麻辣牛肉", "id": "9b58d382-262c-430a-96b2-371fe606446b", "tax_category_id": 117445, "hidden_until": null, "image": "https://firebasestorage.googleapis.com/v0/b/orderbuddy-668.appspot.com/o/juicybao%2fmenu%2fa7cc534f-933c-4fb0-9298-5a050f4e2ea7.jpg?alt=media", "groups": [], "active": true, "sort": 11, "oldId": "287d4386-e463-44a2-a7b5-4a8dceca2506", "menu_category_id": 943460, "cookingCategory": "DRINK&COLD DISH", "tags": [ "HOT" ], "recommendationIds": [ "38fa2f62-c9b7-40b1-a6db-0553991ca88b", "14c85faa-415b-4de6-8cf4-ed6bdc502f6f", "e6fb4c8b-dde7-430b-abf2-67f08137784c" ], "name": " Hot & Spicy Beef with Coriander", "active_end": null, "categoryId": "330c9d9a-cba5-4e74-a985-999a1641f53b", "active_days": 127 }, "size": null, "options": [], "subTotal": 11.3, "isReqiredSelected": true, "quantity": 1, "specialInstructions": "", "isTakeaway": false, "id": "1270e27b-8a0f-489c-bd8e-e2d0d8d2f22f" } ], "pickupTimeType": "now", "pickupTime": "", "selectedDate": "14/05/2023", "total": 11.3, "paymentType": "card", "isPaymentRequired": true, "type": "dinein", "realTableId": "2;required", "chooseType": "pickup", "notes": "", "orderTime": "14/05/2023 14:11:36", "surcharges": [ { "name": "holiday/weekend surcharge", "tyep": "holiday", "amount": "1.13" } ], "id": "rpEQkv1CTlqgCn5kB5XbKA"},
        "orderRefference": "NF",
        "address": "123 Melbourne st",
        "phone": "123456789",
        "restaraunt": "Melbourne best dumplings",
        "merchantId": 1,
        "type": "pickup"
    }`;
    invoiceJSON: any = {};
    constructor() {
        // convert template to json
        this.invoiceJSON = JSON.parse(this.template);
        this.invoiceJSON.order.orderNumber = nanoid(7);
    }

}

export default invoice;