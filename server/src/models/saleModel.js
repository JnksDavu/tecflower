export class SaleModel {
  constructor({ id, customer, date, total, channel }) {
    this.id = id;
    this.customer = customer;
    this.date = date;
    this.total = total;
    this.channel = channel;
  }
}
