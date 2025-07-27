import { BigInt } from "@graphprotocol/graph-ts"
import {
    CollateralDeposited as CollateralDepositedEvent,
    CollateralRedeemed as CollateralRedeemedEvent,
} from "../generated/DSCEngine/DSCEngine"
import { CollateralDeposit, CollateralRedemption } from "../generated/schema"
import { getOrCreateUser, updateProtocolStats, updateMonthlyStats } from "./utils"

export function handleCollateralDeposited(event: CollateralDepositedEvent): void {
    let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let deposit = new CollateralDeposit(id)
    let user = getOrCreateUser(event.params.user.toHex(), event.block.timestamp)

    deposit.user = user.id
    deposit.token = event.params.tokenCollateralAddress
    deposit.amount = event.params.amount
    deposit.timestamp = event.block.timestamp
    deposit.blockNumber = event.block.number
    deposit.transactionHash = event.transaction.hash
    deposit.save()

    // Update user stats
    user.totalDeposited = user.totalDeposited.plus(event.params.amount)
    user.lastInteractionTimestamp = event.block.timestamp
    user.save()

    // Update protocol stats
    updateProtocolStats(event.block.timestamp, BigInt.zero(), BigInt.zero(), event.params.amount, BigInt.zero())

    // Update monthly stats
    updateMonthlyStats(
        event.block.timestamp,
        user.id,
        BigInt.zero(),
        BigInt.zero(),
        event.params.amount,
        BigInt.zero()
    )
}

export function handleCollateralRedeemed(event: CollateralRedeemedEvent): void {
    let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let redemption = new CollateralRedemption(id)
    let user = getOrCreateUser(event.params.redeemedFrom.toHex(), event.block.timestamp)

    redemption.user = user.id
    redemption.token = event.params.token
    redemption.amount = event.params.amount
    redemption.timestamp = event.block.timestamp
    redemption.blockNumber = event.block.number
    redemption.transactionHash = event.transaction.hash
    redemption.save()

    // Update user stats (subtract from total deposited)
    user.totalDeposited = user.totalDeposited.minus(event.params.amount)
    user.lastInteractionTimestamp = event.block.timestamp
    user.save()

    // Update protocol stats
    updateProtocolStats(event.block.timestamp, BigInt.zero(), BigInt.zero(), BigInt.zero(), event.params.amount)

    // Update monthly stats
    updateMonthlyStats(
        event.block.timestamp,
        user.id,
        BigInt.zero(),
        BigInt.zero(),
        BigInt.zero(),
        event.params.amount
    )
}