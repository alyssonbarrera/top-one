import Decimal from 'decimal.js'

import { calculateItemPrice } from './calculate-item-price'

describe('calculateItemPrice', () => {
  it('should be able to calculate the correct price without discount', () => {
    const result = calculateItemPrice({
      price: new Decimal(50),
      discount: new Decimal(0),
    })

    expect(result.toNumber()).toBe(50)
  })

  it('should be able to calculate the correct price with discount', () => {
    const result = calculateItemPrice({
      price: new Decimal(30),
      discount: new Decimal(10),
    })

    expect(result.toNumber()).toBe(27)
  })

  it('should be able to handle zero quantity', () => {
    const result = calculateItemPrice({
      price: new Decimal(100),
      discount: new Decimal(50),
    })

    expect(result.toNumber()).toBe(50)
  })

  it('should be able to handle zero price', () => {
    const result = calculateItemPrice({
      price: new Decimal(0),
      discount: new Decimal(20),
    })

    expect(result.toNumber()).toBe(0)
  })

  it('should be able to handle zero discount', () => {
    const result = calculateItemPrice({
      price: new Decimal(25),
      discount: new Decimal(0),
    })

    expect(result.toNumber()).toBe(25)
  })

  it('should be able to handle 100% discount', () => {
    const result = calculateItemPrice({
      price: new Decimal(100),
      discount: new Decimal(100),
    })

    expect(result.toNumber()).toBe(0)
  })
})
