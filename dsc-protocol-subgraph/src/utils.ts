import { BigInt } from "@graphprotocol/graph-ts"
import { User, ProtocolStats, MonthlyStats, MonthlyActiveUser } from "../generated/schema"

export function getOrCreateUser(addressHex: string, timestamp: BigInt): User {
    let user = User.load(addressHex)
    if (user == null) {
        user = new User(addressHex)
        user.totalDeposited = BigInt.zero()
        user.totalMinted = BigInt.zero()
        user.totalBurned = BigInt.zero()
        user.firstInteractionTimestamp = timestamp
        user.lastInteractionTimestamp = timestamp
        // Note: We don't save the user here. It will be saved in the event handler after modification.

        // Update total users count in ProtocolStats
        let protocolStats = getOrCreateProtocolStats(timestamp)
        protocolStats.totalUsers = protocolStats.totalUsers + 1
        protocolStats.save()
    }
    return user
}

export function getOrCreateProtocolStats(timestamp: BigInt): ProtocolStats {
    let stats = ProtocolStats.load("1")
    if (stats == null) {
        stats = new ProtocolStats("1")
        stats.totalCollateral = BigInt.zero()
        stats.totalUsers = 0
        stats.totalMintVolume = BigInt.zero()
        stats.totalBurnVolume = BigInt.zero()
        stats.totalNetMinted = BigInt.zero()
        stats.lastUpdatedTimestamp = timestamp
    }
    return stats
}

export function updateProtocolStats(
    timestamp: BigInt,
    mintAmount: BigInt,
    burnAmount: BigInt,
    depositAmount: BigInt,
    redeemAmount: BigInt
): void {
    let stats = getOrCreateProtocolStats(timestamp)
    stats.totalMintVolume = stats.totalMintVolume.plus(mintAmount)
    stats.totalBurnVolume = stats.totalBurnVolume.plus(burnAmount)
    stats.totalNetMinted = stats.totalMintVolume.minus(stats.totalBurnVolume)
    stats.totalCollateral = stats.totalCollateral.plus(depositAmount).minus(redeemAmount)
    stats.lastUpdatedTimestamp = timestamp
    stats.save()
}

export function updateMonthlyStats(
    timestamp: BigInt,
    userAddress: string,
    mintAmount: BigInt,
    burnAmount: BigInt,
    depositAmount: BigInt,
    redeemAmount: BigInt
): void {
    // More accurate date calculation using graph-ts's built-in Date
    let date = new Date(timestamp.toI64() * 1000)
    let year = date.getUTCFullYear()
    let month = date.getUTCMonth() + 1 // getUTCMonth is 0-indexed

    let monthId = year.toString() + "-" + (month < 10 ? "0" + month.toString() : month.toString())

    let monthlyStats = MonthlyStats.load(monthId)
    if (monthlyStats == null) {
        monthlyStats = new MonthlyStats(monthId)
        monthlyStats.year = year
        monthlyStats.month = month
        monthlyStats.mintVolume = BigInt.zero()
        monthlyStats.burnVolume = BigInt.zero()
        monthlyStats.collateralDeposited = BigInt.zero()
        monthlyStats.collateralRedeemed = BigInt.zero()
        monthlyStats.newUsers = 0
        monthlyStats.activeUsers = 0
        // Set timestamp to the first interaction of that month
        monthlyStats.timestamp = timestamp
    }

    // Update volumes
    monthlyStats.mintVolume = monthlyStats.mintVolume.plus(mintAmount)
    monthlyStats.burnVolume = monthlyStats.burnVolume.plus(burnAmount)
    monthlyStats.netMintVolume = monthlyStats.mintVolume.minus(monthlyStats.burnVolume)
    monthlyStats.collateralDeposited = monthlyStats.collateralDeposited.plus(depositAmount)
    monthlyStats.collateralRedeemed = monthlyStats.collateralRedeemed.plus(redeemAmount)
    monthlyStats.netCollateral = monthlyStats.collateralDeposited.minus(monthlyStats.collateralRedeemed)

    // Check for new user this month
    let user = User.load(userAddress)! // User must exist at this point
    if (user.firstInteractionTimestamp.ge(monthlyStats.timestamp)) {
        monthlyStats.newUsers = monthlyStats.newUsers + 1
    }

    // Track active user for the month
    let monthlyActiveUserId = monthId + "-" + userAddress
    let monthlyActiveUser = MonthlyActiveUser.load(monthlyActiveUserId)
    if (monthlyActiveUser == null) {
        monthlyActiveUser = new MonthlyActiveUser(monthlyActiveUserId)
        monthlyActiveUser.user = userAddress
        monthlyActiveUser.month = monthId
        monthlyActiveUser.save()
        monthlyStats.activeUsers = monthlyStats.activeUsers + 1
    }

    monthlyStats.save()
}