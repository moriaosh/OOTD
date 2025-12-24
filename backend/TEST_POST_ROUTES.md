# Testing Post Routes

After restarting the server, you can test the routes:

## Test Update Route:
```bash
# Replace YOUR_TOKEN and POST_ID with actual values
curl -X PUT http://localhost:5000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Updated caption","isPublic":true}'
```

## Test Delete Route:
```bash
# Replace YOUR_TOKEN and POST_ID with actual values
curl -X DELETE http://localhost:5000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Route Order (Important!)
The routes are now in the correct order:
1. `/feed` - specific route (GET)
2. `/my-posts` - specific route (GET)
3. `/` - create post (POST)
4. `/:postId` - update/delete (PUT/DELETE)

This ensures that `/feed` and `/my-posts` are matched before the parameterized `/:postId` route.

