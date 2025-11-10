# Development Guide

## Project Structure

```
ETRANE_BACK/
├── src/
│   ├── config/              # Configuration files
│   │   └── index.ts         # Environment configuration
│   ├── controllers/         # Request handlers
│   │   └── token.controller.ts
│   ├── services/            # Business logic
│   │   ├── aggregation.service.ts
│   │   ├── cache.service.ts
│   │   ├── dexscreener.client.ts
│   │   ├── jupiter.client.ts
│   │   ├── geckoterminal.client.ts
│   │   └── websocket.service.ts
│   ├── routes/              # API routes
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   └── rateLimiter.ts
│   ├── __tests__/           # Test files
│   │   ├── utils/
│   │   ├── services/
│   │   └── integration/
│   └── server.ts            # Entry point
├── dist/                    # Compiled JavaScript
├── logs/                    # Log files
├── node_modules/
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or use a cloud Redis (Upstash, Redis Cloud, etc.)
```

### 4. Run in Development Mode

```bash
npm run dev
```

This starts the server with hot-reload using nodemon.

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

### 6. Build for Production

```bash
npm run build
```

### 7. Start Production Server

```bash
npm start
```

## Adding New Features

### Adding a New API Client

1. Create client file in `src/services/`
2. Implement rate limiting
3. Add error handling
4. Export singleton instance
5. Add to aggregation service

Example:
```typescript
// src/services/newapi.client.ts
import { RateLimiter } from '../utils/rateLimiter';

export class NewAPIClient {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 300,
      name: 'NewAPI',
    });
  }

  async fetchData() {
    await this.rateLimiter.acquire();
    // Implementation
  }
}

export default new NewAPIClient();
```

### Adding a New Endpoint

1. Add route in `src/routes/index.ts`
2. Add controller method in `src/controllers/token.controller.ts`
3. Implement business logic in service
4. Add tests in `src/__tests__/integration/`

Example:
```typescript
// src/routes/index.ts
router.get('/tokens/trending', tokenController.getTrending.bind(tokenController));

// src/controllers/token.controller.ts
async getTrending(req: Request, res: Response): Promise<void> {
  // Implementation
}
```

## Testing Strategy

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Focus on edge cases

### Integration Tests
- Test API endpoints end-to-end
- Mock services but test controllers
- Verify request/response format

### Example Test

```typescript
describe('TokenController', () => {
  it('should return tokens list', async () => {
    const response = await request(app)
      .get('/api/tokens')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens).toBeInstanceOf(Array);
  });
});
```

## Debugging

### Enable Debug Logging

```env
LOG_LEVEL=debug
```

### Check Logs

```bash
# View combined logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log
```

### Debug WebSocket

Open `websocket-demo.html` in browser to see live updates.

## Performance Optimization

### 1. Caching Strategy
- Cache aggregated results for 30s
- Invalidate on demand
- Use Redis for distributed caching

### 2. Rate Limiting
- Queue excess requests
- Batch API calls when possible
- Monitor rate limiter status

### 3. Database Queries (if added)
- Use indexes
- Implement pagination
- Cache frequent queries

## Common Issues

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### API Rate Limits Exceeded
```bash
# Check rate limiter status
curl http://localhost:3000/api/health

# Increase queue size or reduce update frequency
```

### TypeScript Compilation Errors
```bash
# Clean build
rm -rf dist
npm run build
```

## Best Practices

1. **Error Handling**: Always use try-catch blocks
2. **Logging**: Log important events with appropriate levels
3. **Type Safety**: Use TypeScript types for all data
4. **Testing**: Write tests for new features
5. **Documentation**: Update README for major changes
6. **Git Commits**: Use descriptive commit messages

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `CACHE_TTL` | Cache TTL in seconds | `30` |
| `DEXSCREENER_RATE_LIMIT` | DexScreener req/min | `300` |
| `JUPITER_RATE_LIMIT` | Jupiter req/min | `600` |
| `GECKOTERMINAL_RATE_LIMIT` | GeckoTerminal req/min | `300` |
| `WS_UPDATE_INTERVAL` | WebSocket update interval (ms) | `5000` |
| `LOG_LEVEL` | Logging level | `info` |

## CI/CD

### GitHub Actions (Example)

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## Security

1. **Environment Variables**: Never commit `.env` file
2. **API Keys**: Use environment variables for sensitive data
3. **Rate Limiting**: Prevent abuse with rate limiters
4. **Input Validation**: Validate all user inputs
5. **Dependencies**: Keep dependencies updated

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Redis instance configured
- [ ] Build successful
- [ ] Health check endpoint working
- [ ] WebSocket functioning
- [ ] Logs configured
- [ ] Monitoring setup (optional)

## Support

For questions or issues:
1. Check existing documentation
2. Review test files for examples
3. Check logs for errors
4. Open GitHub issue with details
