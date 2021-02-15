import {Stripe} from "stripe";

enum EqualStrCompareFlag {
    IsLower = -1,
    IsGreater = 1,
}

const compareStr = (s1: string, s2: string, equalStr: string, flag: EqualStrCompareFlag = EqualStrCompareFlag.IsGreater): number => {
    if (s1 == s2) {
        return 0;
    } else if (s1 == equalStr) {
        return -1 * flag;
    } else if (s2 == equalStr) {
        return 1 * flag;
    }
    return 0;
};

const compareType = (p1: Stripe.Price, p2: Stripe.Price): number => compareStr(p1.type, p2.type, 'recurring');

const compareAmount = (p1: Stripe.Price, p2: Stripe.Price): number => p1.unit_amount - p2.unit_amount;

const compareNickname = (p1: Stripe.Price, p2: Stripe.Price): number => compareStr(p1.nickname, p2.nickname, 'custom_price', EqualStrCompareFlag.IsLower);

export const PriceComparators = [compareType, compareNickname, compareAmount];
