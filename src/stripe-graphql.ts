import {buildSchema, graphql} from "graphql";
import {StripeApi} from "./config";
import {Stripe} from 'stripe';
import {PriceComparators} from "./prices/comparators";

const schema = buildSchema(`
    type Query {
        listPaymentPrices: String
        getPublishableKey: String
        createPaymentSession(priceId: String, successUrl: String, cancelUrl: String): String
        createPaymentSessionV2(priceId: String, quantity:  Int, successUrl: String, cancelUrl: String): String
    }
`);

const listPaymentPrices = async (): Promise<string> => {
    const prices: Stripe.ApiList<Stripe.Price> = await StripeApi.prices.list({
        product: process.env.STRIPE_DONATION_PRODUCT_ID,
        limit: 100,
        active: true,
    });

    prices.data.sort((p1: Stripe.Price, p2: Stripe.Price) => {
        for (const comparator of PriceComparators) {
            const result = comparator(p1, p2);
            if (result != 0) {
                return result;
            }
        }
        return 0;
    });

    return JSON.stringify(prices);
};

const createPaymentSessionV2 = async (params: { priceId: string, quantity: number, successUrl: string, cancelUrl: string }): Promise<string> => {
    const price = await StripeApi.prices.retrieve(
        params.priceId
    );

    const paymentMode: Stripe.Checkout.SessionCreateParams.Mode = (price.type == "recurring")
        ? 'subscription'
        : 'payment';
    const quantity = params.quantity || 1;
    // const desc = price.nickname == 'custom_price' ? `custom amount charge per user` : '';
    // const amount = price.unit_amount_decimal;
    // const paymentDesc = `${quantity}x ${amount}${price.currency} (${paymentMode})`;
    const data: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],

        // @ts-ignore
        mode: paymentMode,

        line_items: [{price: params.priceId, quantity: quantity}],

        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: params.cancelUrl,

        // payment_intent_data: {
        //     description: `${quantity} x ${price.unit_amount}`,
        // }
    };

    // switch (paymentMode) {
    //     case "payment":
    //         data.payment_intent_data = {
    //             description: paymentDesc,
    //         };
    //         break;
    //     case "subscription":
    //         data.subscription_data = {
    //             metadata: {
    //                 description: paymentDesc
    //             }
    //         };
    //         break;
    // }

    const session = await StripeApi.checkout.sessions.create(data);

    return session.id;
};

const createPaymentSession = async (params: { priceId: string, successUrl: string, cancelUrl: string }): Promise<string> => {
    return createPaymentSessionV2(Object.assign({}, params, {quantity: 1}));
};

const getPublishableKey = (): string => {
    return process.env.STRIPE_API_PUBLISHABLE_KEY;
};

// export const root = {
//
//     listPaymentPrices: async (): Promise<string> => {
//         const prices: Stripe.ApiList<Stripe.Price> = await StripeApi.prices.list({
//             product: process.env.STRIPE_DONATION_PRODUCT_ID,
//             limit: 100,
//             active: true,
//         });
//
//         prices.data.sort((p1: Stripe.Price, p2: Stripe.Price) => {
//             for (const comparator of PriceComparators) {
//                 const result = comparator(p1, p2);
//                 if (result != 0) {
//                     return result;
//                 }
//             }
//             return 0;
//         });
//
//         return JSON.stringify(prices);
//     },
//
//     createPaymentSession: async (params: { priceId: string, successUrl: string, cancelUrl: string }): Promise<string> => {
//         return root.createPaymentSessionV2(Object.assign({}, params, {quantity: 1}));
//     },
//
//     createPaymentSessionV2: async (params: { priceId: string, quantity: number, successUrl: string, cancelUrl: string }): Promise<string> => {
//         const price = await StripeApi.prices.retrieve(
//             params.priceId
//         );
//
//         const paymentMode: Stripe.Checkout.SessionCreateParams.Mode = (price.type == "recurring")
//             ? 'subscription'
//             : 'payment';
//         const quantity = params.quantity || 1;
//         // const desc = price.nickname == 'custom_price' ? `custom amount charge per user` : '';
//         // const amount = price.unit_amount_decimal;
//         // const paymentDesc = `${quantity}x ${amount}${price.currency} (${paymentMode})`;
//         const data: Stripe.Checkout.SessionCreateParams = {
//             payment_method_types: ['card'],
//
//             // @ts-ignore
//             mode: paymentMode,
//
//             line_items: [{price: params.priceId, quantity: quantity}],
//
//             success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: params.cancelUrl,
//
//             // payment_intent_data: {
//             //     description: `${quantity} x ${price.unit_amount}`,
//             // }
//         };
//
//         // switch (paymentMode) {
//         //     case "payment":
//         //         data.payment_intent_data = {
//         //             description: paymentDesc,
//         //         };
//         //         break;
//         //     case "subscription":
//         //         data.subscription_data = {
//         //             metadata: {
//         //                 description: paymentDesc
//         //             }
//         //         };
//         //         break;
//         // }
//
//         const session = await StripeApi.checkout.sessions.create(data);
//
//         return session.id;
//     },
//
//     getPublishableKey: (): string => {
//         return process.env.STRIPE_API_PUBLISHABLE_KEY;
//     },
// };

export const root = {
    listPaymentPrices: listPaymentPrices,
    createPaymentSessionV2: createPaymentSessionV2,
    createPaymentSession: createPaymentSession,
    getPublishableKey: getPublishableKey,
};

export const execGraphql = async (params: string) => {
    return await graphql(
        {
            schema: schema,
            rootValue: root,
            source: params,
        }
    );
};
