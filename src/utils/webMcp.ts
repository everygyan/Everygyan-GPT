/**
 * WebMCP (Model Context Protocol in Browser) Registration
 * Complies with W3C WebMCP draft specification to allow in-browser
 * AI assistants (Chrome AI, Claude, Copilot, etc.) to query EveryGyan.
 */

export function registerWebMcpTools(): void {
  if (typeof window === 'undefined') return;

  const nav = navigator as unknown as {
    modelContext?: {
      registerTool?: (tool: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        execute: (params: unknown) => Promise<unknown>;
      }) => void;
    };
  };

  if (!nav.modelContext?.registerTool) return;

  try {
    // 1. Search Articles Tool
    nav.modelContext.registerTool({
      name: 'search_everygyan_articles',
      description: 'Search articles, tutorials, travel guides, and stories on EveryGyan by keyword or category',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keywords or topic' },
          category: {
            type: 'string',
            description: 'Optional category (e.g. travel, tech, news, tutorials, learn-german)',
          },
        },
        required: ['query'],
      },
      execute: async (input: unknown) => {
        const { query } = (input as { query: string; category?: string }) || {};
        return {
          status: 'success',
          searchUrl: `https://everygyan.com/search?q=${encodeURIComponent(query || '')}`,
          message: `Query EveryGyan at https://everygyan.com/search?q=${encodeURIComponent(query || '')}`,
        };
      },
    });

    // 2. Play Online Games Tool
    nav.modelContext.registerTool({
      name: 'play_everygyan_games',
      description: 'Access EveryGyan browser games including Chess Master and 2048',
      inputSchema: {
        type: 'object',
        properties: {
          game: { type: 'string', enum: ['chess', '2048', 'all'], description: 'Game to launch' },
        },
      },
      execute: async () => {
        return {
          gamesHubUrl: 'https://everygyan.com/category/entertainment-games',
          availableGames: ['chess', '2048'],
        };
      },
    });
  } catch (err) {
    console.warn('[WebMCP] Notice during tool registration:', err);
  }
}
