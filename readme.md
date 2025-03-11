# Reddit Client

A TypeScript-based Reddit API client for interacting with Reddit's API using OAuth2 authentication. Handles token management, including refreshing tokens, and provides a simple interface for making API requests.

---

## Installation

Install the required dependencies:

```bash
npm install axios
```

---

## Usage

### Import the Client

```typescript
import RedditClient from './RedditClient';
```

### Configure the Client

Pass the configuration directly or use environment variables:

```typescript
const config = {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    username: 'YOUR_REDDIT_USERNAME',
    password: 'YOUR_REDDIT_PASSWORD',
    userAgent: 'MyRedditApp/1.0.0',
    refreshToken: 'YOUR_REFRESH_TOKEN', // Optional
};

const redditClient = new RedditClient(config);
```

Or use environment variables:

```bash
REDDIT_CLIENT_ID='YOUR_CLIENT_ID'
REDDIT_CLIENT_SECRET='YOUR_CLIENT_SECRET'
REDDIT_USERNAME='YOUR_REDDIT_USERNAME'
REDDIT_PASSWORD='YOUR_REDDIT_PASSWORD'
REDDIT_USER_AGENT='MyRedditApp/1.0.0'
REDDIT_REFRESH_TOKEN='YOUR_REFRESH_TOKEN' # Optional
```

Then instantiate the client:

```typescript
const redditClient = new RedditClient();
```

---

## Methods

### `getToken`

Fetches a valid access token. Automatically refreshes the token if expired.

#### Example:

```typescript
const token = await redditClient.getToken();
console.log('Access Token:', token);
```

#### Output:

```bash
Access Token: eyJhbGciOiJSUzI1NiIsImtpZCI6Il...
```

---

### `getApiClient`

Returns an `axios` instance configured with a valid access token for making authenticated API requests.

#### Example:

```typescript
const apiClient = await redditClient.getApiClient();
const userData = await apiClient.get('/api/v1/me'); // Fetch logged-in user data
console.log('User Data:', userData.data);
```

#### Output:

```json
{
    "name": "YourUsername",
    "icon_img": "https://example.com/avatar.png",
    "total_karma": 1234
}
```

---

### `request`

Makes authenticated API requests to Reddit.

#### Example:

```typescript
const topPosts = await redditClient.request('/r/programming/top', {
    params: { limit: 5 }
});
console.log('Top Posts:', topPosts);
```

#### Output:

```json
{
    "kind": "Listing",
    "data": {
        "children": [
            {
                "kind": "t3",
                "data": {
                    "title": "Post Title 1",
                    "author": "Author1",
                    "score": 1234
                }
            }
        ]
    }
}
```

---

## Example Usage

```typescript
async function fetchData() {
    try {
        // Fetch user data
        const apiClient = await redditClient.getApiClient();
        const userData = await apiClient.get('/api/v1/me');
        console.log('User Data:', userData.data);

        // Fetch top posts from r/programming
        const topPosts = await redditClient.request('/r/programming/top', {
            params: { limit: 5 }
        });
        console.log('Top Posts:', topPosts);
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchData();
```

---

## License

MIT License. Feel free to use, modify, and distribute.

---

This `README.md` provides a concise guide to using the `RedditClient`, including methods like `getToken`, `getApiClient`, and `request`, along with examples and expected outputs.
