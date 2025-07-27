import { Transfer } from "../generated/DSC/DSC"
import { Mint, Burn } from "../generated/schema"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { getOrCreateUser, updateProtocolStats, updateMonthlyStats } from "./utils"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export function handleTransfer(event: Transfer): void {
    let amount = event.params.value
    let from = event.params.from.toHex()
    let to = event.params.to.toHex()
    let timestamp = event.block.timestamp

    // Handle mint (from zero address)
    if (from == ZERO_ADDRESS) {
        let mintId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
        let mint = new Mint(mintId)
        let user = getOrCreateUser(to, timestamp)

        mint.user = user.id
        mint.amount = amount
        mint.timestamp = timestamp
        mint.blockNumber = event.block.number
        mint.transactionHash = event.transaction.hash
        mint.save()

        // Update user stats
        user.totalMinted = user.totalMinted.plus(amount)
        user.lastInteractionTimestamp = timestamp
        user.save()

        // Update protocol stats
        updateProtocolStats(timestamp, amount, BigInt.zero(), BigInt.zero(), BigInt.zero())

        // Update monthly stats
        updateMonthlyStats(timestamp, user.id, amount, BigInt.zero(), BigInt.zero(), BigInt.zero())
    }

    // Handle burn (to zero address)
    if (to == ZERO_ADDRESS) {
        let burnId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
        let burn = new Burn(burnId)
        let user = getOrCreateUser(from, timestamp)

        burn.user = user.id
        burn.amount = amount
        burn.timestamp = timestamp
        burn.blockNumber = event.block.number
        burn.transactionHash = event.transaction.hash
        burn.save()

        // Update user stats
        user.totalBurned = user.totalBurned.plus(amount)
        user.lastInteractionTimestamp = timestamp
        user.save()

        // Update protocol stats
        updateProtocolStats(timestamp, BigInt.zero(), amount, BigInt.zero(), BigInt.zero())

        // Update monthly stats
        updateMonthlyStats(timestamp, user.id, BigInt.zero(), amount, BigInt.zero(), BigInt.zero())
    }
}