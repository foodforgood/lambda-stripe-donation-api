import {Stripe} from "stripe";

const apiKey = process.env.STRIPE_API_KEY;

export const StripeApi = new Stripe(apiKey, {apiVersion: "2020-03-02"}); // Stripe account secret key goes here

