import { UniqueEntityID } from './unique-entity-id'

describe('Unique Entity ID Value Object', () => {
  it('should be able to create a unique entity id instance', () => {
    const uniqueEntityId = new UniqueEntityID()

    expect(uniqueEntityId).toBeDefined()
    expect(uniqueEntityId.toString()).toBeDefined()
    expect(uniqueEntityId.toValue()).toBeDefined()
  })

  it('should be able to create a unique entity id instance with a specific id', () => {
    const uniqueEntityId = new UniqueEntityID('123')

    expect(uniqueEntityId).toBeDefined()
    expect(uniqueEntityId.toString()).toBe('123')
    expect(uniqueEntityId.toValue()).toBe('123')
  })
})
