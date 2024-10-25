import Decimal from 'decimal.js'

type CalculateItemPriceProps = {
  price: Decimal
  discount: Decimal
}

/**
 * Calculates the final price of an item after applying a discount.
 *
 * @param {CalculateItemPriceProps} props - The properties required to calculate the item price.
 * @param {Decimal} props.price - The original price of the item.
 * @param {Decimal} props.discount - The discount percentage to be applied.
 * @param {number} props.quantity - The quantity of items.
 * @returns {Decimal} The final price after applying the discount.
 */
export function calculateItemPrice({
  price,
  discount,
}: CalculateItemPriceProps): Decimal {
  const total = price.toNumber()
  const discountAmount = total * (discount.toNumber() / 100)

  const finalPrice = total - discountAmount
  return new Decimal(finalPrice)
}
