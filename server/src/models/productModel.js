export class ProductModel {
  constructor({ id, name, category, stock, price, status }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.stock = stock;
    this.price = price;
    this.status = status;
  }
}
