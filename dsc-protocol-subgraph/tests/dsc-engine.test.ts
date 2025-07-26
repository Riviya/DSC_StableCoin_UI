import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { CollateralDeposited } from "../generated/schema"
import { CollateralDeposited as CollateralDepositedEvent } from "../generated/DSCEngine/DSCEngine"
import { handleCollateralDeposited } from "../src/dsc-engine"
import { createCollateralDepositedEvent } from "./dsc-engine-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let tokenCollateralAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let amount = BigInt.fromI32(234)
    let newCollateralDepositedEvent = createCollateralDepositedEvent(
      user,
      tokenCollateralAddress,
      amount
    )
    handleCollateralDeposited(newCollateralDepositedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("CollateralDeposited created and stored", () => {
    assert.entityCount("CollateralDeposited", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CollateralDeposited",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CollateralDeposited",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenCollateralAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CollateralDeposited",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
