import RedditClient from "./RedditClient";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const redditClient = new RedditClient();

    const token = await redditClient.getToken();

    console.log('Reddit token:', token);
}

main();
