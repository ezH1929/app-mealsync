# MealSync - Enterprise Cafeteria Menu System

A production-grade, enterprise-quality cafeteria menu module built with Next.js, TypeScript, and Tailwind CSS. Features include daily menu viewing, Navratri fasting view, allergen management, discovery items, surplus notifications, pre-booking, meeting nudges, and accessibility support.

## 🎯 Features

### Core Features
- ✅ **Daily Menu Display** - View menu for today and tomorrow with beautiful card layout
- ✅ **Festival Support** - Special Navratri fasting menu with highlighted compliant items
- ✅ **Discovery Items** - Featured items pinned to top with gold star badge
- ✅ **Surplus Management** - Banner notifications for items available at reduced waste
- ✅ **Sold Out Overlay** - Clear visual indication when items are unavailable
- ✅ **Allergen Safety** - Auto-filter allergen items with acknowledgment requirement
- ✅ **Bookmark System** - Save favorite items with localStorage persistence
- ✅ **Pre-book for Tomorrow** - Reserve meals before cutoff time
- ✅ **Meeting Nudge** - Smart notifications based on meeting schedule (dev mode)
- ✅ **Offline Support** - localStorage caching for last synced menu
- ✅ **Accessibility** - ARIA labels, keyboard navigation, focus management

### Filtering & Search
- Search by name or ingredients
- Filter by: All, Veg, Non-Veg, Jain, Fasting, High Protein, No Allergens
- Toggle to show/hide allergen items
- Multi-select filters with visual active states

### Item Details
- Large image display
- Full description and nutritional info
- Diet tags, protein level, calorie range
- Allergen warnings with acknowledgment checkbox
- Fasting compliance notes
- Availability count
- Price display

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn package manager

### Installation

1. **Clone and Install Dependencies**
```bash
cd /app
yarn install
```

2. **Start Development Server**
```bash
yarn dev
# Server runs on http://localhost:3000
```

3. **Access the Application**
- Open http://localhost:3000 in your browser
- Sign in with demo accounts:
  - **Asha Sharma** - Veg, Allergic to nuts
  - **Rajesh Kumar** - Non-Veg, No allergies

## 📁 Project Structure

```
/app
├── app/
│   ├── api/                    # API routes (mocked backend)
│   │   ├── auth/login/         # Authentication
│   │   ├── menu/               # Menu data
│   │   ├── user/[userId]/      # User operations
│   │   ├── prebook/            # Pre-booking
│   │   └── items/[itemId]/     # Item details
│   ├── page.tsx                # Main application (client component)
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   └── Toast.tsx               # Toast notification component
├── lib/
│   ├── mockDb.ts               # Mock database operations
│   └── utils.ts                # Utility functions
├── data/
│   ├── menu_days.json          # Menu schedule data
│   ├── menu_items.json         # Item catalog
│   ├── users.json              # User profiles
│   └── prebooks.json           # Pre-booking records
├── public/
│   └── images/                 # Menu item images
├── .env.local                  # Environment variables
└── README.md                   # This file
```

## 🎨 Design System

### Colors
- **Primary (Navy)**: #0B2545 - Main branding, buttons, headers
- **Accent (Green)**: #0D9F6C - Success, vegetarian items
- **Discovery (Gold)**: #F6C84C - Discovery item highlighting
- **Danger (Red)**: #C53030 - Allergen warnings, errors
- **Muted**: #6B7280 - Secondary text
- **Border**: #E5E7EB - Dividers, input borders

### Typography
- **Body Font**: Inter (400, 500, 600, 700)
- **Heading Font**: Belleza
- **Sizes**: h1 28px, h2 22px, body 16px, small 13px

### Spacing
- Base grid: 4px
- Card radius: 12px
- Shadows: `0 6px 18px rgba(11, 37, 69, 0.06)`

## 🔧 Configuration

### Environment Variables (.env.local)

```bash
# Dev mode - enables meeting simulator
NEXT_PUBLIC_DEV_MODE=true

# Pre-booking cutoff time
NEXT_PUBLIC_PREBOOK_CUTOFF_HOUR=10
NEXT_PUBLIC_PREBOOK_CUTOFF_MINUTE=30
```

### Sample Data

The application comes pre-seeded with:
- **2 Menu Days**: Nov 19 (Navratri) and Nov 20
- **5 Menu Items**:
  - Veg Thali (₹120) - Balanced protein, 50 available
  - Chicken Biryani (₹150) - High protein, Discovery item, 30 available
  - Fruit Bowl (₹40) - Low protein, Fasting compliant, Surplus candidate
  - Mango Lassi (₹50) - Contains dairy, SOLD OUT
  - Gulab Jamun (₹30) - Contains dairy & nuts, Fasting compliant
- **2 Demo Users**: Asha (Veg, nut allergy) and Rajesh (Non-Veg)

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Sign in as both demo users
   - [ ] User data persists in localStorage
   - [ ] Welcome toast appears

2. **Menu Display**
   - [ ] View today's menu
   - [ ] Switch to tomorrow's menu
   - [ ] Discovery item (Chicken Biryani) pinned to top with gold star
   - [ ] All item cards display correctly

3. **Festival Banner**
   - [ ] Purple Navratri banner appears
   - [ ] Click banner to open fasting view
   - [ ] Only fasting items shown (Fruit Bowl, Gulab Jamun)
   - [ ] Back button returns to full menu

4. **Filters**
   - [ ] Search by text (try "chicken")
   - [ ] Apply Veg filter - only veg items shown
   - [ ] Apply Non-Veg filter - only non-veg items shown
   - [ ] Apply Fasting filter - only fasting items shown
   - [ ] Apply High Protein filter
   - [ ] Apply No Allergens filter
   - [ ] Toggle "Show my allergen items"

5. **Allergen Management** (Sign in as Asha - allergic to nuts)
   - [ ] Gulab Jamun shows "Contains Your Allergen" overlay
   - [ ] Click item to open detail
   - [ ] Red alert box shows allergen warning
   - [ ] Checkbox appears: "I acknowledge this item contains nuts"
   - [ ] Bookmark button disabled until checkbox checked
   - [ ] Check box enables bookmark button

6. **Item Details**
   - [ ] Click any item card
   - [ ] Modal opens with full details
   - [ ] Image, description, diet, protein, calories shown
   - [ ] Price and availability displayed
   - [ ] Close with X button or Escape key

7. **Bookmarking**
   - [ ] Click bookmark icon on card
   - [ ] Icon fills and turns navy
   - [ ] Toast: "Saved to favourites" appears
   - [ ] Open item detail - bookmark button shows "Remove from Favourites"
   - [ ] Click again to remove bookmark
   - [ ] Toast: "Removed from favourites"

8. **Pre-booking**
   - [ ] Click "Pre-book for Tomorrow" button
   - [ ] Modal shows cutoff time
   - [ ] Select Veg/Non-Veg/Fasting option
   - [ ] Toast: "Pre-booked for tomorrow"
   - [ ] Reopen modal - shows existing booking
   - [ ] Cancel booking button available before cutoff

9. **Meeting Nudge** (Dev mode only)
   - [ ] Select "12:30-13:30" from meeting dropdown
   - [ ] Blue banner appears with message about eating at 12:00
   - [ ] Click X to dismiss
   - [ ] Select "Back-to-back"
   - [ ] Banner shows "Tight schedule today" message

10. **Surplus Banner**
    - [ ] Green banner appears mentioning fruit bowls
    - [ ] Click X to dismiss
    - [ ] Banner doesn't reappear (localStorage)

11. **Sold Out**
    - [ ] Mango Lassi shows "SOLD OUT" overlay
    - [ ] Cannot bookmark sold out items
    - [ ] Detail modal shows "Sold out" status

12. **Keyboard Navigation**
    - [ ] Tab through all interactive elements
    - [ ] Filters have focus states
    - [ ] Enter/Space activates buttons
    - [ ] Escape closes modals
    - [ ] Focus returns after modal close

### API Testing

```bash
# Get menu for today
curl http://localhost:3000/api/menu?date=2025-11-19

# Get user data
curl http://localhost:3000/api/user/user_001

# Bookmark an item
curl -X POST http://localhost:3000/api/user/user_001/bookmark \
  -H "Content-Type: application/json" \
  -d '{"itemId": "item_001", "action": "add"}'

# Create pre-book
curl -X POST http://localhost:3000/api/prebook \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "date": "2025-11-20", "item_category": "Veg"}'
```

## 📊 Data Models

### MenuItem
```typescript
{
  id: string;
  day_id: string;
  name: string;
  description: string;
  category: string;
  diet_tags: string[];
  allergens: string[];
  protein_tag: "Low Protein" | "High Protein" | "Balanced" | null;
  calorie_range: string | null;
  price: number;
  available_qty: number;
  image_url: string;
  is_discovery_item: boolean;
  is_surplus_candidate: boolean;
  is_active: boolean;
  fasting_compliant: boolean;
  fasting_compliance_note: string | null;
}
```

### User
```typescript
{
  id: string;
  displayName: string;
  email: string;
  office_status: "IN_OFFICE" | "WFH" | "HYBRID";
  diet_profile: string[];
  allergies: string[];
  fasting: boolean;
  bookmarked_items: string[];
  last_nudge_shown: string | null;
}
```

## 🔄 Converting to Firebase

When ready to connect to Firebase:

1. **Install Firebase SDK**
```bash
yarn add firebase
```

2. **Add Firebase Config** to `.env.local`
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. **Replace mockDb.ts** with Firebase calls
- Use Firestore for menu_days, menu_items, users, prebooks
- Use Firebase Auth for authentication
- Use Firebase Storage for images

4. **Set Firestore Rules** (see spec for detailed rules)

## 🎯 Key Implementation Details

### Exact Copy Strings
All user-facing text uses exact copy as specified:
- Festival banner: "Navratri special menu — fasting options highlighted."
- Fasting view header: "Navratri fasting options"
- Allergen alert: "This item contains your allergen(s): {list}."
- Bookmark toasts: "Saved to favourites" / "Removed from favourites"
- Pre-book success: "Pre-booked for tomorrow"
- Pre-book closed: "Pre-booking closed for tomorrow"
- Meeting nudges: Exact messages as specified

### Accessibility Features
- All buttons have aria-labels
- Modal focus trap with focus return
- Images have alt text
- Keyboard navigation throughout
- 4.5:1 contrast ratios
- aria-pressed states on filter chips
- role="button" with keyboard handlers

### Performance
- Client-side filtering for instant results
- localStorage for offline support
- Optimistic UI for bookmarks
- Lazy loading ready for future implementation
- Debounce on search (300ms)

## 🐛 Troubleshooting

### Port Already in Use
```bash
sudo supervisorctl restart nextjs
```

### Clear Cache
```bash
rm -rf .next
yarn dev
```

### Reset Demo Data
```bash
# Restore original JSON files from git or re-run seed script
git checkout data/*.json
```

### Clear localStorage
Open browser console and run:
```javascript
localStorage.clear();
location.reload();
```

## 📝 License

This is a demo/educational project. Not licensed for commercial use without proper attribution.

## 👥 Demo Accounts

- **Asha Sharma** (asha@example.com)
  - Diet: Vegetarian
  - Allergies: Nuts
  - Office Status: In Office

- **Rajesh Kumar** (rajesh@example.com)
  - Diet: Non-Vegetarian
  - Allergies: None
  - Office Status: In Office

## 🚀 Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Firebase Hosting (once connected)
- Any Node.js hosting platform

```bash
# Build for production
yarn build

# Start production server
yarn start
```

---

**Built with ❤️ using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui**
