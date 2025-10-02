# Category Mapping Documentation

## Firebase Data Structure
Your Firebase `Product` collection uses the following category fields:
- `Camera` (string) - for camera products
- `Phone` (string) - for smartphone products  
- `Tablets` (string) - for tablet products

## Website Category Mapping
The website maps these Firebase fields to standardized categories:

| Firebase Field | Website Category | Display Name |
|----------------|------------------|--------------|
| `Camera` | `cameras` | Cameras |
| `Phone` | `smartphones` | Smartphones |
| `Tablets` | `tablets` | Tablets |

## How It Works

1. **Product Transformation**: When products are loaded from Firebase, the `transformProduct()` function checks each category field and maps it to a standard category name.

2. **Category Grouping**: The `getCategories()` function groups similar categories together (e.g., both `Camera` and `camera` fields map to the `cameras` category).

3. **Filtering**: The ProductsPage handles filtering by checking both the mapped category and original Firebase field values.

## Adding New Categories

To add new categories:

1. **Update Firebase**: Add new category fields to your `Product` collection
2. **Update Mapping**: Add the new field mapping in `src/lib/productService.js`:
   ```javascript
   const getCategory = (product) => {
     if (product.Camera && product.Camera !== '') return 'cameras';
     if (product.Phone && product.Phone !== '') return 'smartphones';
     if (product.Tablets && product.Tablets !== '') return 'tablets';
     if (product.NewCategory && product.NewCategory !== '') return 'newcategory';
     // ... rest of mapping
   };
   ```
3. **Update Display Names**: Add display name mapping in the `categoryDisplayNames` object
4. **Update Icons**: Add icon mapping in `src/pages/HomePage.jsx`

## Example Product Document
```json
{
  "productID": "1",
  "productname": "iPhone 15 Pro",
  "Price": "999",
  "Description": "Latest iPhone with advanced features",
  "productImg": "https://example.com/image.jpg",
  "Phone": "iPhone 15 Pro",
  "Camera": "",
  "Tablets": "",
  "Quantity": "10",
  "KeyFeatures": "A17 Pro chip, 48MP camera, Titanium design",
  "Colors": "Natural Titanium, Blue Titanium, White Titanium"
}
```

This product would be categorized as `smartphones` because the `Phone` field has a value.
