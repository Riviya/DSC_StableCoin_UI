import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CollateralDeposited,
  CollateralRedeemed
} from "../generated/DSCEngine/DSCEngine"

export function createCollateralDepositedEvent(
  user: Address,
  tokenCollateralAddress: Address,
  amount: BigInt
): CollateralDeposited {
  let collateralDepositedEvent = changetype<CollateralDeposited>(newMockEvent())

  collateralDepositedEvent.parameters = new Array()

  collateralDepositedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  collateralDepositedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenCollateralAddress",
      ethereum.Value.fromAddress(tokenCollateralAddress)
    )
  )
  collateralDepositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return collateralDepositedEvent
}

export function createCollateralRedeemedEvent(
  redeemedFrom: Address,
  reddemedTo: Address,
  amount: BigInt,
  token: Address
): CollateralRedeemed {
  let collateralRedeemedEvent = changetype<CollateralRedeemed>(newMockEvent())

  collateralRedeemedEvent.parameters = new Array()

  collateralRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "redeemedFrom",
      ethereum.Value.fromAddress(redeemedFrom)
    )
  )
  collateralRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "reddemedTo",
      ethereum.Value.fromAddress(reddemedTo)
    )
  )
  collateralRedeemedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  collateralRedeemedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return collateralRedeemedEvent
}
