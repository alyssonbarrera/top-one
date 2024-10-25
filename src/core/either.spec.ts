import { Either, left, right } from './either'

function doSomething(shouldSuccess: boolean): Either<string, number> {
  if (shouldSuccess) {
    return right(10)
  } else {
    return left('error')
  }
}

describe('Either', () => {
  it('success result', () => {
    const result = doSomething(true)

    expect(result.isRight()).toBeTruthy()
    expect(result.isLeft()).toBeFalsy()
  })
  it('error result', () => {
    const result = doSomething(false)

    expect(result.isLeft()).toBeTruthy()
    expect(result.isRight()).toBeFalsy()
  })
})
