# Tagging System Documentation

## Overview
The tagging system allows users to organize their clothing items with both system tags (predefined) and custom tags (user-created).

## Database Schema

### Tag Model
- `id`: UUID (primary key)
- `name`: String (tag name)
- `userId`: String? (null for system tags, user ID for custom tags)
- `createdAt`: DateTime

### ClotheTag Model (Junction Table)
- `id`: UUID (primary key)
- `clotheId`: UUID (foreign key to Clothe)
- `tagId`: UUID (foreign key to Tag)
- Unique constraint on `[clotheId, tagId]` to prevent duplicates

## API Endpoints

### GET /api/tags
Get all tags (system + user's custom tags)
- **Auth**: Required
- **Response**: Array of tags

### POST /api/tags
Create a custom tag
- **Auth**: Required
- **Body**: `{ name: string }`
- **Response**: Created tag object

### PUT /api/tags/:id
Update a custom tag
- **Auth**: Required
- **Body**: `{ name: string }`
- **Response**: Updated tag object
- **Note**: Cannot edit system tags

### DELETE /api/tags/:id
Delete a custom tag
- **Auth**: Required
- **Response**: Success message
- **Note**: Cannot delete system tags

## Usage

### Seeding System Tags
Run the seed script to create initial system tags:
```bash
cd OOTD/backend
node scripts/seedTags.js
```

System tags include:
- אהוב (Favorite)
- חדש (New)
- למכירה (For Sale)
- צריך תיקון (Needs Repair)
- עונתי (Seasonal)
- פורמלי (Formal)
- קז'ואל (Casual)
- ספורט (Sport)
- עבודה (Work)
- אירוע (Event)

### Adding Tags to Clothes
When adding a new clothing item via POST /api/closet/add-item:
- Include `tagIds` in the request body as a JSON string or array
- Example: `tagIds: ["tag-id-1", "tag-id-2"]`

### Frontend Components

1. **TagManager**: Modal for managing tags (create, edit, delete custom tags)
2. **UploadModal**: Updated to include tag selection when adding items
3. **ClosetItem**: Displays tags on clothing items

## Security
- Users can only edit/delete their own custom tags
- System tags cannot be modified or deleted
- Tag validation ensures no duplicate names per user

