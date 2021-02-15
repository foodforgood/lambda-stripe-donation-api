import {config as dotenv_config} from "dotenv";

dotenv_config();


import {suite, test} from "mocha-typescript";
import {execGraphql} from "../src/stripe-graphql";
import * as console from "console";


@suite
export class TestGraphql {

    @test('test list prices')
    async testListPrices() {
        const prices = await execGraphql(
            `
            query {
                listPaymentPrices
            }
            `
        );

        const data = JSON.parse(prices.data.listPaymentPrices)['data'].map(v => {
            return {
                unit_amount: v.unit_amount / 100,
                type: v.type,
                nickname: v.nickname,
                id: v.id
            };
        });
        console.log(JSON.stringify(data).split("},").join("},\n"));
    }

    @test('test create session')
    async testCreateSession() {
        const publishableKey = await execGraphql(
            `
                query {
                    getPublishableKey
                }
                `
        );

        const publicKey = publishableKey.data.getPublishableKey;
        // const stripe = new Stripe(publicKey, {apiVersion: "2020-03-02"});

        // const session = await execGraphql(
        //     `
        //     query {
        //         createPaymentSession(price)
        //     }
        //     `
        // );

        // const sessionId = session.data.createSession;
        // console.log(sessionId);
        // await stripe.redirectToCheckout({sessionId: sessionId});
    }

    @test('test get publishable api key')
    async testGetPublishableKey() {
        const reply = await execGraphql(
            `
            query {
                getPublishableKey
            }
            `
        );

        console.log(reply);
    }

    @test('test customer api')
    async testCustomers() {
        const data = JSON.stringify({
            email: "anchoish@gmail.com"
        }).replace(/"/g, `\\"`);

        const reply = await execGraphql(
            `
            query {
                invoke(resource: "customers", method: "create", data: "${data}")
            }
            `
        );

        console.log(reply);
    }

    @test('test origin api')
    public testOrigin() {

        const data = [
            "http://localhost:8080",
            "https://www.boppi.website",
            "https://dev.boppi.website",
            "https://api-staging.boppi.website",
            "https://boppi.website",
            "https://boppi.website:3000",
        ];

        //const pattern = new RegExp(process.env.CORS_ORIGIN, 'igm');
        const patt = "^(https?://(localhost:8080|(.*)boppi.website))$";
        for (const url of data) {
            const reg = new RegExp(patt);
            // const reg = new RegExp("^(https?:\\/\\/(localhost:3000|(.*)boppi.website))$", 'igm');
            console.log(url, reg.test(url));
        }
        // console.log(
        //     reg.test('http://localhost:3000'),
        //     reg.test('https://www.boppi.website'),
        //     reg.test('https://boppi.website'),
        //     reg.test('https://dev.boppi.website'),
        // );
    }
}


// const reply = await graphql(
//     schema,
//     `{customers(data: "{\\"email\\": \\"anchoish@gmail.com\\"}")}`,
//     root);
