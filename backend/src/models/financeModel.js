export class FinanceModel {
  constructor({ id, description, category, dueDate, amount, status }) {
    this.id = id;
    this.description = description;
    this.category = category;
    this.dueDate = dueDate;
    this.amount = amount;
    this.status = status;
  }
}
