# City Radar Poll Feature - Visual Guide

## 🎯 Feature Overview

The City Radar poll feature allows users to create location-based polls and see real-time voting statistics with percentages and response counts.

---

## 📱 User Flow

### Step 1: Create a Poll
```
┌─────────────────────────────────────┐
│  📍 Post to Location                │
│                            ✕        │
├─────────────────────────────────────┤
│                                     │
│  📍 Posting to your current location│
│                                     │
│  POST TYPE                          │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 📝 │ │ 📊 │ │ ❓ │              │
│  │Text│ │Poll│ │Ask │              │
│  └────┘ └────┘ └────┘              │
│                                     │
│  CONTENT                            │
│  ┌─────────────────────────────┐   │
│  │ Best biryani spot?          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  POLL OPTIONS                       │
│  ┌─────────────────────────────┐   │
│  │ Student Biryani             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Karachi Biryani             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ➕ Add Option               │   │
│  └─────────────────────────────┘   │
│                                     │
│  DURATION                           │
│  [1h] [3h] [6h] [12h] [24h] [♾️]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🚀 Post to Area           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Step 2: View Poll in Feed
```
┌─────────────────────────────────────┐
│  🌐 City Radar                      │
│  📍 Karachi, Pakistan               │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ @foodie_pk      📍 0.8 km   │   │
│  ├─────────────────────────────┤   │
│  │ Best biryani spot?          │   │
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Student Biryani    45%  │ │   │
│  │ │ ████████████░░░░░░░░░░  │ │   │
│  │ └─────────────────────────┘ │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Karachi Biryani    30%  │ │   │
│  │ │ ████████░░░░░░░░░░░░░░  │ │   │
│  │ └─────────────────────────┘ │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Lahori Biryani     20%  │ │   │
│  │ │ █████░░░░░░░░░░░░░░░░░  │ │   │
│  │ └─────────────────────────┘ │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Other               5%  │ │   │
│  │ │ █░░░░░░░░░░░░░░░░░░░░░  │ │   │
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  │ 20 responses                │   │
│  │                             │   │
│  │ #Food                       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Step 3: Vote on Poll
```
┌─────────────────────────────────────┐
│  Tap any option to vote             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Student Biryani        45%  │   │ ← Not selected
│  │ ████████████░░░░░░░░░░░░░░  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Karachi Biryani        30%  │   │ ← SELECTED ✓
│  │ ████████░░░░░░░░░░░░░░░░░░  │   │   (Primary color)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Lahori Biryani         20%  │   │ ← Not selected
│  │ █████░░░░░░░░░░░░░░░░░░░░░  │   │
│  └─────────────────────────────┘   │
│                                     │
│  21 responses                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ Vote Recorded!           │   │ ← Toast notification
│  │ Your vote has been counted  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎨 Visual Elements

### Poll Option States

#### Default State
```
┌─────────────────────────────┐
│ Option Text            25%  │
│ ██████░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────┘
- Gray border (#E5E7EB)
- White background
- Gray text
- Light progress bar
```

#### Selected State
```
┌─────────────────────────────┐
│ Option Text            25%  │ ← Primary color border
│ ██████░░░░░░░░░░░░░░░░░░░░  │ ← Primary color background
└─────────────────────────────┘
- Primary color border (#00D4AA)
- Light primary background (#00D4AA15)
- Primary color text
- Darker progress bar
```

#### Hover/Press State
```
┌─────────────────────────────┐
│ Option Text            25%  │ ← Reduced opacity
│ ██████░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────┘
- Opacity: 0.7
- Smooth transition
```

---

## 📊 Statistics Display

### Percentage Calculation
```javascript
percentage = (optionVotes / totalVotes) * 100
```

Example:
- Option has 9 votes
- Total poll has 20 votes
- Percentage = (9 / 20) * 100 = 45%

### Progress Bar Width
```javascript
progressBarWidth = `${percentage}%`
```

Example:
- 45% → Progress bar fills 45% of container width
- 100% → Progress bar fills entire container
- 0% → Progress bar is invisible

### Response Count
```javascript
text = `${totalVotes} ${totalVotes === 1 ? 'response' : 'responses'}`
```

Examples:
- 0 responses
- 1 response
- 20 responses
- 1,234 responses

---

## 🎯 Interactive Features

### 1. Vote Submission
```
User taps option
    ↓
Send POST /api/posts/:postId/poll/vote
    ↓
Backend validates & saves vote
    ↓
Return updated poll data
    ↓
Update UI with new percentages
    ↓
Show success toast
```

### 2. Vote Switching
```
User already voted for Option A
    ↓
User taps Option B
    ↓
Backend removes vote from Option A
    ↓
Backend adds vote to Option B
    ↓
Update vote counts
    ↓
Return updated poll data
    ↓
Update UI
```

### 3. Real-time Updates
```
Poll data structure:
{
  enabled: true,
  totalVotes: 20,
  options: [
    { text: "Option 1", voteCount: 9, votes: [...userIds] },
    { text: "Option 2", voteCount: 6, votes: [...userIds] },
    { text: "Option 3", voteCount: 4, votes: [...userIds] },
    { text: "Option 4", voteCount: 1, votes: [...userIds] }
  ]
}
```

---

## 🎨 Color Scheme

### Ring Colors (Distance-based)
- **Inner Ring (0-2km)**: `#00D4AA` (Teal)
- **Mid Ring (2-10km)**: `#A855F7` (Purple)
- **Outer Ring (10-50km)**: `#FF6B35` (Orange)

### Poll Colors
- **Primary**: Theme primary color
- **Border**: `theme.colors.border`
- **Background**: `theme.colors.background`
- **Text**: `theme.colors.text`
- **Secondary Text**: `theme.colors.textSecondary`
- **Progress Bar**: `theme.colors.primary + '15'` (15% opacity)

---

## 📱 Responsive Design

### Mobile (< 768px)
- Full-width poll options
- Stacked layout
- Touch-friendly tap targets (min 48px height)

### Tablet (768px - 1024px)
- Slightly wider poll options
- More padding
- Larger text

### Desktop (> 1024px)
- Maximum width constraint
- Centered layout
- Hover effects

---

## ✨ Animations

### Poll Option Press
```javascript
activeOpacity={0.7}
```
- Smooth opacity transition
- 300ms duration
- Easing: ease-in-out

### Progress Bar Fill
```css
transition: width 0.3s ease-in-out
```
- Smooth width animation
- Updates when votes change
- No jank or flicker

### Toast Notification
```javascript
Toast.show({
  type: 'success',
  text1: 'Vote Recorded! ✅',
  text2: 'Your vote has been counted',
})
```
- Slides in from top
- Auto-dismisses after 3 seconds
- Can be manually dismissed

---

## 🔧 Technical Details

### Data Flow
```
LocationPostModal
    ↓ (poll data)
CityRadarScreen.onSubmit
    ↓ (API call)
postsAPI.createPost
    ↓ (HTTP POST)
Backend /api/posts
    ↓ (save to DB)
MongoDB Post collection
    ↓ (return post)
Update local state
    ↓ (render)
Display poll in feed
```

### Vote Flow
```
User taps option
    ↓
handlePollVote(postId, optionIndex)
    ↓
postsAPI.voteOnPoll(postId, optionIndex)
    ↓
Backend validates & updates
    ↓
Return updated poll data
    ↓
setPosts (update local state)
    ↓
Re-render with new percentages
```

---

## 🎯 Key Features Summary

✅ **Poll Creation**: Create polls with 2-4 options
✅ **Real-time Voting**: Vote and see results immediately
✅ **Percentage Display**: Shows vote distribution
✅ **Response Count**: Shows total number of votes
✅ **Visual Progress**: Color-coded progress bars
✅ **Vote Switching**: Change your vote anytime
✅ **Location-based**: Polls tied to geographic location
✅ **Anonymous Voting**: Usernames not shown in results
✅ **Duration Control**: Set poll expiration time
✅ **Category Tags**: Organize polls by category

---

## 🚀 Performance

- **Optimistic Updates**: UI updates immediately
- **Minimal Re-renders**: Only affected components update
- **Efficient State**: Local state management
- **No Extra API Calls**: Poll data included in post
- **Smooth Animations**: Hardware-accelerated transitions

---

## 📝 Notes

- Polls require minimum 2 options
- Maximum 4 options per poll
- Anonymous voting (usernames hidden)
- Users can change their vote
- Vote counts update in real-time
- Percentages rounded to nearest integer
- Progress bars scale smoothly
- Touch targets are accessibility-friendly
