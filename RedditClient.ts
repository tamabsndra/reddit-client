import axios from 'axios';

interface RedditAuthConfig {
    clientId: string;
    clientSecret: string;
    username?: string;
    password?: string;
    userAgent: string;
    refreshToken?: string;
}

interface RedditToken {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken?: string;
    scope: string;
    expiresAt: number;
}

export class RedditClient {
    private axios: any;
    private config: RedditAuthConfig;
    private token: RedditToken | null = null;
    private tokenPromise: Promise<RedditToken> | null = null;

    constructor(config?: RedditAuthConfig) {
        this.config = config || {
            clientId: process.env.REDDIT_CLIENT_ID || '',
            clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
            username: process.env.REDDIT_USERNAME,
            password: process.env.REDDIT_PASSWORD,
            userAgent: process.env.REDDIT_USER_AGENT || 'MyRedditApp/1.0.0',
            refreshToken: process.env.REDDIT_REFRESH_TOKEN,
        };

        this.axios = axios.create({
            baseURL: 'https://www.reddit.com',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': this.config.userAgent,
            },
        });
    }

    /**
     * Get a valid access token, automatically refreshing if needed
     */
    async getToken(): Promise<string> {
        // If we already have a token promise pending, return it
        if (this.tokenPromise) {
            const token = await this.tokenPromise;
            return token.accessToken;
        }

        // If we have a token and it's still valid, return it
        if (this.token && this.token.expiresAt > Date.now() + 60000) {
            return this.token.accessToken;
        }

        // Otherwise, request a new token
        this.tokenPromise = this.requestToken();

        try {
            this.token = await this.tokenPromise;
            return this.token.accessToken;
        } catch (error) {
            console.error('Error getting Reddit token:', error);
            throw error;
        } finally {
            this.tokenPromise = null;
        }
    }

    /**
     * Request a new token or refresh an existing one
     */
    private async requestToken(): Promise<RedditToken> {
        const authString = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

        let data: Record<string, string> = {};

        if (this.token?.refreshToken || this.config.refreshToken) {
            // Use refresh token if available
            data = {
                grant_type: 'refresh_token',
                refresh_token: this.token?.refreshToken || this.config.refreshToken || '',
            };
        } else if (this.config.username && this.config.password) {
            // Fall back to password grant if refresh token isn't available
            data = {
                grant_type: 'password',
                username: this.config.username,
                password: this.config.password,
            };
        } else {
            throw new Error('Either refreshToken or username/password must be provided');
        }

        const headers = {
            Authorization: `Basic ${authString}`,
        };

        const params = new URLSearchParams(data);

        try {
            const response = await this.axios.post('/api/v1/access_token', params.toString(), { headers });

            const now = Date.now();
            const expiresAt = now + (response.data.expires_in * 1000);

            return {
                accessToken: response.data.access_token,
                tokenType: response.data.token_type,
                expiresIn: response.data.expires_in,
                refreshToken: response.data.refresh_token || this.token?.refreshToken || this.config.refreshToken,
                scope: response.data.scope,
                expiresAt,
            };
        } catch (error) {
            console.error('Error obtaining Reddit token:', error);
            throw error;
        }
    }

    /**
     * Get an API client with the token already set in the Authorization header
     */
    async getApiClient(): Promise<any> {
        try {
            const token = await this.getToken();

            return axios.create({
                baseURL: 'https://oauth.reddit.com',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': this.config.userAgent,
                },
            });
        } catch (error) {
            console.error('Error getting Reddit API client:', error);
            throw error;
        }
    }

    /**
     * Make a request to the Reddit API
     */
    async request<T>(url: string, options: any = {}): Promise<T> {
        try {
            const apiClient = await this.getApiClient();
            const response = await apiClient.request({
                url,
                ...options,
            });

            return response.data;
        } catch (error) {
            console.error('Error making request to Reddit API:', error);
            throw error;
        }
    }
}

export default RedditClient;
