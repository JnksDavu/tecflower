export class OrderModel {
  constructor({ id, customer, occasion, deliveryDate, total, status }) {
    this.id = id;
    this.customer = customer;
    this.occasion = occasion;
    this.deliveryDate = deliveryDate;
    this.total = total;
    this.status = status;
  }
}
