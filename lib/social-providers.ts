import type { SocialAccount } from '@/types';

export interface PostContent {
  title: string;
  content: string;
  imageUrl?: string;
  platform: 'twitter' | 'instagram' | 'linkedin';
}

export interface PostResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
}

// Platform-specific validators
export const validators = {
  twitter: {
    maxLength: 280,
    validate: (content: string): { valid: boolean; error?: string } => {
      if (content.length > 280) {
        return { valid: false, error: `Twitter posts limited to 280 characters (${content.length} provided)` };
      }
      if (content.trim().length === 0) {
        return { valid: false, error: 'Post cannot be empty' };
      }
      return { valid: true };
    },
  },
  instagram: {
    maxLength: 2200,
    validate: (content: string): { valid: boolean; error?: string } => {
      if (content.length > 2200) {
        return { valid: false, error: `Instagram captions limited to 2,200 characters (${content.length} provided)` };
      }
      return { valid: true };
    },
  },
  linkedin: {
    maxLength: 3000,
    validate: (content: string): { valid: boolean; error?: string } => {
      if (content.length > 3000) {
        return { valid: false, error: `LinkedIn posts limited to 3,000 characters (${content.length} provided)` };
      }
      return { valid: true };
    },
  },
};

/**
 * Post to Twitter/X using official API v2
 * Requires: twitter-api-v2 package
 * Env vars: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_BEARER_TOKEN
 */
export async function postToTwitter(
  content: PostContent,
  account: SocialAccount
): Promise<PostResult> {
  try {
    // Validate content
    const validation = validators.twitter.validate(content.content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Dynamic import to avoid build errors if package not installed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error twitter-api-v2 is an optional peer dependency
    const { TwitterApi } = await import('twitter-api-v2');

    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
      return { success: false, error: 'Twitter API credentials not configured' };
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: account.accessToken,
      accessSecret: account.refreshToken || '',
    });

    const rwClient = client.readWrite;
    const tweet = await rwClient.v2.tweet(content.content);

    return {
      success: true,
      platformPostId: tweet.data.id,
      platformUrl: `https://twitter.com/${account.username}/status/${tweet.data.id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Twitter posting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Post to Instagram using Meta Graph API
 * Requires: instagram-graph-api or manual fetch calls
 * Env vars: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
 */
export async function postToInstagram(
  content: PostContent,
  account: SocialAccount
): Promise<PostResult> {
  try {
    // Validate content
    const validation = validators.instagram.validate(content.content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!account.accessToken) {
      return { success: false, error: 'Instagram access token missing' };
    }

    if (!content.imageUrl) {
      return { success: false, error: 'Instagram posts require an image' };
    }

    // Use Meta Graph API
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    if (!businessAccountId) {
      return { success: false, error: 'Instagram business account not configured' };
    }

    // Step 1: Create media container
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: content.imageUrl,
          caption: content.content,
          access_token: account.accessToken,
        }),
      }
    );

    if (!mediaResponse.ok) {
      const err = await mediaResponse.json();
      return {
        success: false,
        error: `Instagram media creation failed: ${err.error?.message || 'Unknown error'}`,
      };
    }

    const mediaData = await mediaResponse.json();

    // Step 2: Publish container
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: account.accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const err = await publishResponse.json();
      return {
        success: false,
        error: `Instagram publish failed: ${err.error?.message || 'Unknown error'}`,
      };
    }

    const publishData = await publishResponse.json();

    return {
      success: true,
      platformPostId: publishData.id,
      platformUrl: `https://instagram.com/p/${publishData.id}/`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Instagram posting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Post to LinkedIn using official API
 * Requires: linkedin-api-js or manual fetch calls
 * Env vars: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
 */
export async function postToLinkedIn(
  content: PostContent,
  account: SocialAccount
): Promise<PostResult> {
  try {
    // Validate content
    const validation = validators.linkedin.validate(content.content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!account.accessToken) {
      return { success: false, error: 'LinkedIn access token missing' };
    }

    const personUrn = process.env.LINKEDIN_PERSON_URN;
    if (!personUrn) {
      return { success: false, error: 'LinkedIn person URN not configured' };
    }

    // Build post object
    const postData = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.PublishOpen': {
          commerceContext: {
            budgetType: 'UNKNOWN',
            budgetId: '',
            landingPage: 'FEED',
          },
          shareCommentary: {
            text: content.content,
          },
          shareMediaCategory: content.imageUrl ? 'IMAGE' : 'NONE',
          media: content.imageUrl
            ? [
                {
                  status: 'READY',
                  description: {
                    text: content.title || 'Image',
                  },
                  media: content.imageUrl,
                  title: {
                    text: content.title || 'Share',
                  },
                },
              ]
            : [],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Post to LinkedIn
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const err = await response.json();
      return {
        success: false,
        error: `LinkedIn posting failed: ${err.message || 'Unknown error'}`,
      };
    }

    const postId = response.headers.get('x-restli-id');

    return {
      success: true,
      platformPostId: postId || 'unknown',
      platformUrl: `https://www.linkedin.com/feed/update/${postId}/`,
    };
  } catch (error) {
    return {
      success: false,
      error: `LinkedIn posting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Post to multiple platforms
 */
export async function postToMultiplePlatforms(
  content: PostContent,
  accounts: Partial<Record<'twitter' | 'instagram' | 'linkedin', SocialAccount>>,
  platforms: Array<'twitter' | 'instagram' | 'linkedin'>
): Promise<Record<string, PostResult>> {
  const results: Record<string, PostResult> = {};

  // Execute all posts concurrently for better performance
  const promises = platforms.map(async (platform) => {
    try {
      const account = accounts[platform];
      if (!account) {
        return { platform, result: { success: false, error: `${platform} account not connected` } };
      }

      let result: PostResult;
      if (platform === 'twitter') {
        result = await postToTwitter(content, account);
      } else if (platform === 'instagram') {
        result = await postToInstagram(content, account);
      } else {
        result = await postToLinkedIn(content, account);
      }
      return { platform, result };
    } catch (error) {
      return { platform, result: { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}` } };
    }
  });

  const settledResults = await Promise.all(promises);
  settledResults.forEach(({ platform, result }) => {
    results[platform] = result;
  });

  return results;
}
