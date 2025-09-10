# TripSync Travel Planner 🌍✈️

A comprehensive travel planning application with timeline view, calendar integration, map visualization, and budget tracking.

![TripSync Logo](assets/logo.png)

## Features ✨

- 📅 **Timeline View** - Day-by-day itinerary with activities
- 🗓️ **Calendar View** - Monthly calendar with trip events  
- 🗺️ **Interactive Map** - Visualize your route and locations
- 💰 **Budget Tracker** - Track expenses by category
- 📄 **Document Storage** - Keep travel documents organized
- ✅ **Checklist** - Pre-trip and packing lists
- 👥 **Collaboration** - Share with travel companions
- 📱 **Mobile Responsive** - Works on all devices
- 🌐 **Offline Support** - Access your plans without internet

## Live Demo 🚀

Visit [https://travel.julieyingst.com](https://travel.julieyingst.com)

## Quick Start 🏃‍♂️

### Option 1: Direct Deployment to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yingstj/tripsync-travel-planner)

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/yingstj/tripsync-travel-planner.git
cd tripsync-travel-planner
```

2. Install dependencies (optional, for development server):
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or simply open index.html in your browser
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure 📁

```
tripsync-travel-planner/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── app.js         # Main application logic
│   ├── config.js      # Configuration settings
│   ├── storage.js     # Data persistence layer
│   └── utils.js       # Utility functions
├── assets/
│   ├── logo.png       # Application logo
│   └── favicon.png    # Favicon
├── package.json       # Node.js dependencies
├── vercel.json        # Vercel deployment config
└── README.md          # This file
```

## Technologies Used 💻

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js for interactive maps
- **Calendar**: Custom calendar implementation
- **Storage**: IndexedDB for offline support, LocalStorage fallback
- **Icons**: Font Awesome
- **Deployment**: Vercel

## Browser Support 🌐

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features in Detail 📋

### Trip Management
- Create, edit, and delete trips
- Set destinations, dates, and budgets
- Categorize trips (leisure, business, adventure, family)
- Track trip status (draft, upcoming, ongoing, completed)

### Activity Planning
- Add daily activities with times and locations
- Categorize activities (transport, accommodation, dining, etc.)
- Attach costs to activities for budget tracking
- Add notes and confirmations

### Budget Tracking
- Set overall trip budget
- Track expenses by category
- Visual breakdown of spending
- Currency conversion support (coming soon)

### Document Management
- Upload and organize travel documents
- Support for PDFs, images, and text files
- Quick access to important documents
- Secure storage with encryption (coming soon)

### Collaboration
- Share trips with travel companions
- Real-time sync (coming soon)
- Comments and suggestions (coming soon)
- Activity assignments (coming soon)

## Security & Privacy 🔒

- All data is stored locally in your browser
- No server-side storage of personal information
- Optional cloud sync with encryption (coming soon)
- GDPR compliant

## Contributing 🤝

This is a proprietary project. For bug reports or feature requests, please open an issue.

## Known Issues 🐛

- [ ] Calendar events may not display correctly in Safari
- [ ] Map markers cluster at high zoom levels
- [ ] Budget calculations may have rounding errors
- [ ] Document upload limited to 5MB per file

## Roadmap 🗺️

- [ ] Google Calendar integration
- [ ] Flight and hotel booking integration
- [ ] Weather forecasts for destinations
- [ ] AI-powered itinerary suggestions
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support for offline mobile use
- [ ] Export to PDF functionality

## License 📄

© 2025 Julie Yingst. All Rights Reserved.

This project is proprietary and confidential. Unauthorized copying, modification, or distribution of this software, via any medium, is strictly prohibited.

## Contact 📧

For support or inquiries, please contact:
- Website: [julieyingst.com](https://julieyingst.com)
- GitHub: [@yingstj](https://github.com/yingstj)

---

Made with ❤️ for travelers by Julie Yingst
