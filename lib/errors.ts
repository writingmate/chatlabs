export class SubscriptionRequiredError extends Error {
  status: number

  constructor(message: string) {
    super(message)
    this.name = "SubscriptionRequiredError"
    this.status = 402
  }
}
