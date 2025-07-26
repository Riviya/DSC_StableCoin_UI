import {
  CollateralDeposited as CollateralDepositedEvent,
  CollateralRedeemed as CollateralRedeemedEvent
} from "../generated/DSCEngine/DSCEngine"
import { CollateralDeposited, CollateralRedeemed } from "../generated/schema"

export function handleCollateralDeposited(
  event: CollateralDepositedEvent
): void {
  let entity = new CollateralDeposited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.tokenCollateralAddress = event.params.tokenCollateralAddress
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollateralRedeemed(event: CollateralRedeemedEvent): void {
  let entity = new CollateralRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.redeemedFrom = event.params.redeemedFrom
  entity.reddemedTo = event.params.reddemedTo
  entity.amount = event.params.amount
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
