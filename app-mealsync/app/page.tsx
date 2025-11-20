'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Bookmark, ChevronRight, X, Star, Leaf, 
  AlertTriangle, Calendar, User, LogOut, Utensils, CheckCircle,
  Plus, Minus, Trophy, ShoppingBag, Clock, MapPin, Users, Package
} from 'lucide-react';
import Toast from '@/components/Toast';
import { cn, getTodayString, getTomorrowString, isPastCutoff } from '@/lib/utils';

interface MenuItem {
  id: string;
  day_id: string;
  name: string;
  description: string;
  category: string;
  diet_tags: string[];
  allergens: string[];
  protein_tag: string | null;
  calorie_range: string | null;
  price: number;
  available_qty: number;
  image_url: string;
  is_discovery_item: boolean;
  is_surplus_candidate: boolean;
  is_active: boolean;
  fasting_compliant: boolean;
  fasting_compliance_note: string | null;
  created_at: string;
}

interface MenuDay {
  id: string;
  date: string;
  title: string;
  published: boolean;
  created_at: string;
  festival_tag: string | null;
  festival_note: string | null;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  office_status: string;
  diet_profile: string[];
  allergies: string[];
  fasting: boolean;
  bookmarked_items: string[];
  last_nudge_shown: string | null;
  green_credits: number;
  created_at: string;
}

interface PrebookData {
  id: string;
  item_id: string | null;
  item_category: string;
  date: string;
  quantity: number;
}

interface OrderEntry {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  date: string;
  type: 'surplus' | 'meeting';
  meetingId?: string;
  deliveryOption?: 'silent' | 'notify';
  deliveryTime?: string;
  status?: 'preparing' | 'out-for-delivery' | 'delivered';
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: number;
  location: string;
}

interface MeetingOrder {
  id: string;
  meetingId: string;
  items: { itemId: string; itemName: string; quantity: number; price: number }[];
  totalPrice: number;
  deliveryOption: 'silent' | 'notify';
  deliveryTime?: string;
  status: 'preparing' | 'out-for-delivery' | 'delivered';
  createdAt: string;
  confirmedAt?: string;
}

// Mock Meetings Data
const mockMeetings: Meeting[] = [
  {
    id: "meet_001",
    title: "Q4 Planning Review",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    attendees: 8,
    location: "Conference Room A"
  },
  {
    id: "meet_002",
    title: "Design Sprint Kickoff",
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    attendees: 5,
    location: "Meeting Room 3"
  },
  {
    id: "meet_003",
    title: "Client Presentation",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    attendees: 12,
    location: "Board Room"
  }
];

// Mock Leaderboard Data
const mockLeaderboard = [
  { name: "Rajesh Kumar", credits: 450, rank: 1, avatar: "https://i.pravatar.cc/150?u=rajesh" },
  { name: "Asha Sharma", credits: 320, rank: 2, avatar: "https://i.pravatar.cc/150?u=asha" },
  { name: "David Miller", credits: 280, rank: 3, avatar: "https://i.pravatar.cc/150?u=david" },
  { name: "Priya Singh", credits: 210, rank: 4, avatar: "https://i.pravatar.cc/150?u=priya" },
  { name: "Amit Patel", credits: 150, rank: 5, avatar: "https://i.pravatar.cc/150?u=amit" },
];

export default function MealSyncApp() {
  const [user, setUser] = useState<User | null>(null);
  const [menuDay, setMenuDay] = useState<MenuDay | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['All']);
  const [showAllergenItems, setShowAllergenItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showFastingView, setShowFastingView] = useState(false);
  const [showPrebookModal, setShowPrebookModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [surplusBannerDismissed, setSurplusBannerDismissed] = useState(false);
  const [meetingSimulation, setMeetingSimulation] = useState('No meeting');
  const [showMeetingNudge, setShowMeetingNudge] = useState(false);
  const [allergenAcknowledgment, setAllergenAcknowledgment] = useState(false);
  const [prebookData, setPrebookData] = useState<PrebookData | null>(null);
  const [viewSurplusOnly, setViewSurplusOnly] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [allPrebooks, setAllPrebooks] = useState<PrebookData[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderEntry[]>([]);
  const [showMeetingBooking, setShowMeetingBooking] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingCart, setMeetingCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [meetingOrders, setMeetingOrders] = useState<MeetingOrder[]>([]);
  const [deliveryOption, setDeliveryOption] = useState<'silent' | 'notify'>('notify');
  const [customDeliveryTime, setCustomDeliveryTime] = useState('');

  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const todayString = getTodayString();
  const tomorrowString = getTomorrowString();

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('mealsync_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setShowLoginModal(false);
    }

    const savedOrders = localStorage.getItem('mealsync_orders');
    if (savedOrders) {
      setOrderHistory(JSON.parse(savedOrders));
    }

    const savedMeetingOrders = localStorage.getItem('mealsync_meeting_orders');
    if (savedMeetingOrders) {
      setMeetingOrders(JSON.parse(savedMeetingOrders));
    }
  }, []);

  // Fetch menu data
  useEffect(() => {
    if (!user) return;
    
    fetch(`/api/menu?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setMenuDay(data.menuDay);
        setItems(data.items || []);
      });
  }, [selectedDate, user]);

  // Check for existing prebook for tomorrow
  useEffect(() => {
    if (!user) return;
    
    fetch(`/api/prebook?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.prebooks) {
            setAllPrebooks(data.prebooks);
            const tomorrowPrebook = data.prebooks.find((p: PrebookData) => p.date === tomorrowString);
            if (tomorrowPrebook) {
                setPrebookData(tomorrowPrebook);
            } else {
                setPrebookData(null);
            }
        }
      });
  }, [user, tomorrowString]);

  // Meeting nudge logic
  useEffect(() => {
    if (!user || meetingSimulation === 'No meeting') {
      setShowMeetingNudge(false);
      return;
    }

    const lastShown = user.last_nudge_shown;
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    
    if (!lastShown || new Date(lastShown).getTime() < sixHoursAgo) {
      setShowMeetingNudge(true);
    }
  }, [meetingSimulation, user]);

  const handleLogin = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (data.user) {
        // Mock adding green credits if not present
        if (data.user.green_credits === undefined) data.user.green_credits = 120;
        
        setUser(data.user);
        localStorage.setItem('mealsync_user', JSON.stringify(data.user));
        setShowLoginModal(false);
        setToast({ message: `Welcome, ${data.user.displayName}!`, type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Login failed', type: 'error' });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mealsync_user');
    setShowLoginModal(true);
  };

  const handleBookmark = async (itemId: string, isBookmarked: boolean) => {
    if (!user) return;

    const action = isBookmarked ? 'remove' : 'add';
    
    try {
      const res = await fetch(`/api/user/${user.id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action }),
      });
      
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('mealsync_user', JSON.stringify(data.user));
        setToast({ message: data.message, type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Failed to update bookmark', type: 'error' });
    }
  };

  const handlePrebook = async (category: string, itemId: string | null = null, qty: number = 1) => {
    if (!user) return;

    const tomorrow = getTomorrowString();
    const cutoffHour = parseInt(process.env.NEXT_PUBLIC_PREBOOK_CUTOFF_HOUR || '10');
    const cutoffMinute = parseInt(process.env.NEXT_PUBLIC_PREBOOK_CUTOFF_MINUTE || '30');

    if (isPastCutoff(cutoffHour, cutoffMinute)) {
      setToast({ message: 'Pre-booking closed for tomorrow', type: 'error' });
      return;
    }

    if (prebookData) {
        setToast({ message: 'You already have a pre-book. Cancel it first to change.', type: 'info' });
        return;
    }

    try {
      const res = await fetch('/api/prebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          date: tomorrow,
          item_id: itemId,
          item_category: category,
          quantity: qty
        }),
      });
      
      const data = await res.json();
      if (data.prebook) {
        setPrebookData(data.prebook);
        setAllPrebooks([...allPrebooks, data.prebook]);
        setShowPrebookModal(false);
        setToast({ message: data.message, type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Failed to create prebook', type: 'error' });
    }
  };
  
  const handleDirectBuy = async (item: MenuItem, quantity: number) => {
      if (!user) return;
      
      // Simulating a direct buy API call
      setToast({ message: `Processing purchase for ${quantity} x ${item.name}...`, type: 'info' });
      
      setTimeout(() => {
          setToast({ message: `Successfully purchased! +${quantity * 5} Green Credits earned.`, type: 'success' });
          
          // Update local green credits for immediate feedback
          if (user) {
              const updatedUser = { ...user, green_credits: (user.green_credits || 0) + (quantity * 5) };
              setUser(updatedUser);
              localStorage.setItem('mealsync_user', JSON.stringify(updatedUser));
          }

          const order: OrderEntry = {
            id: `order_${Date.now()}`,
            itemName: item.name,
            quantity,
            price: item.price * quantity,
            date: new Date().toISOString(),
            type: 'surplus',
          };
          const updatedOrders = [...orderHistory, order];
          setOrderHistory(updatedOrders);
          localStorage.setItem('mealsync_orders', JSON.stringify(updatedOrders));
          
          // Close modal if open
          setSelectedItem(null);
      }, 1500);
  };

  const handleCancelPrebook = async (id?: string) => {
    const bookingId = id || prebookData?.id;
    if (!bookingId) return;

    try {
      const res = await fetch(`/api/prebook?id=${bookingId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (bookingId === prebookData?.id) {
          setPrebookData(null);
      }
      setAllPrebooks(allPrebooks.filter(p => p.id !== bookingId));
      setToast({ message: data.message, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to cancel prebook', type: 'error' });
    }
  };

  const dismissMeetingNudge = async () => {
    if (!user) return;
    
    setShowMeetingNudge(false);
    
    const updatedUser = {
      ...user,
      last_nudge_shown: new Date().toISOString(),
    };
    
    await fetch(`/api/user/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_nudge_shown: updatedUser.last_nudge_shown }),
    });
    
    setUser(updatedUser);
    localStorage.setItem('mealsync_user', JSON.stringify(updatedUser));
  };

  const handleAddToMeetingCart = (item: MenuItem, quantity: number) => {
    const existingIndex = meetingCart.findIndex(c => c.item.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...meetingCart];
      updated[existingIndex].quantity += quantity;
      setMeetingCart(updated);
    } else {
      setMeetingCart([...meetingCart, { item, quantity }]);
    }
    setToast({ message: `Added ${item.name} to meeting cart`, type: 'success' });
  };

  const handleRemoveFromMeetingCart = (itemId: string) => {
    setMeetingCart(meetingCart.filter(c => c.item.id !== itemId));
  };

  const handlePlaceMeetingOrder = () => {
    if (!selectedMeeting || meetingCart.length === 0) return;

    const order: MeetingOrder = {
      id: `meeting_order_${Date.now()}`,
      meetingId: selectedMeeting.id,
      items: meetingCart.map(c => ({
        itemId: c.item.id,
        itemName: c.item.name,
        quantity: c.quantity,
        price: c.item.price
      })),
      totalPrice: meetingCart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0),
      deliveryOption,
      deliveryTime: customDeliveryTime || undefined,
      status: 'preparing',
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [...meetingOrders, order];
    setMeetingOrders(updatedOrders);
    localStorage.setItem('mealsync_meeting_orders', JSON.stringify(updatedOrders));

    // Add to order history
    const historyEntry: OrderEntry = {
      id: order.id,
      itemName: `Meeting: ${selectedMeeting.title}`,
      quantity: meetingCart.reduce((sum, c) => sum + c.quantity, 0),
      price: order.totalPrice,
      date: order.createdAt,
      type: 'meeting',
      meetingId: selectedMeeting.id,
      deliveryOption: order.deliveryOption,
      deliveryTime: order.deliveryTime,
      status: order.status
    };
    const updatedHistory = [...orderHistory, historyEntry];
    setOrderHistory(updatedHistory);
    localStorage.setItem('mealsync_orders', JSON.stringify(updatedHistory));

    setToast({ message: 'Meeting refreshments ordered successfully!', type: 'success' });
    setMeetingCart([]);
    setShowMeetingBooking(false);
    setSelectedMeeting(null);
    setDeliveryOption('notify');
    setCustomDeliveryTime('');

    // Simulate status changes
    setTimeout(() => {
      updateOrderStatus(order.id, 'out-for-delivery');
    }, 5000);
  };

  const updateOrderStatus = (orderId: string, status: 'preparing' | 'out-for-delivery' | 'delivered') => {
    const updatedMeetingOrders = meetingOrders.map(o => 
      o.id === orderId ? { ...o, status } : o
    );
    setMeetingOrders(updatedMeetingOrders);
    localStorage.setItem('mealsync_meeting_orders', JSON.stringify(updatedMeetingOrders));

    const updatedHistory = orderHistory.map(o => 
      o.id === orderId ? { ...o, status } : o
    );
    setOrderHistory(updatedHistory);
    localStorage.setItem('mealsync_orders', JSON.stringify(updatedHistory));

    const statusMessages = {
      'out-for-delivery': 'Your order is out for delivery!',
      'delivered': 'Your order has been delivered!'
    };
    if (status !== 'preparing') {
      setToast({ message: statusMessages[status], type: 'info' });
    }

    // Auto-progress to next status
    if (status === 'out-for-delivery') {
      setTimeout(() => {
        updateOrderStatus(orderId, 'delivered');
      }, 10000);
    }
  };

  const handleConfirmReceipt = (orderId: string) => {
    const updatedMeetingOrders = meetingOrders.map(o => 
      o.id === orderId ? { ...o, confirmedAt: new Date().toISOString() } : o
    );
    setMeetingOrders(updatedMeetingOrders);
    localStorage.setItem('mealsync_meeting_orders', JSON.stringify(updatedMeetingOrders));
    setToast({ message: 'Receipt confirmed! Thank you.', type: 'success' });
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setActiveFilters(['All']);
      return;
    }

    let newFilters = activeFilters.filter(f => f !== 'All');
    
    if (newFilters.includes(filter)) {
      newFilters = newFilters.filter(f => f !== filter);
    } else {
      newFilters.push(filter);
    }

    setActiveFilters(newFilters.length === 0 ? ['All'] : newFilters);
  };

  const hasAllergen = (item: MenuItem) => {
    if (!user) return false;
    return item.allergens.some(allergen => user.allergies.includes(allergen));
  };

  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => item.is_active);

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply surplus filter
    if (viewSurplusOnly) {
      filtered = filtered.filter(item => item.is_surplus_candidate);
    }

    // Apply filters
    if (!activeFilters.includes('All')) {
      filtered = filtered.filter(item => {
        if (activeFilters.includes('Veg') && item.diet_tags.includes('Veg')) return true;
        if (activeFilters.includes('Non-Veg') && item.diet_tags.includes('Non-Veg')) return true;
        if (activeFilters.includes('Fasting') && item.fasting_compliant) return true;
        if (activeFilters.includes('High Protein') && item.protein_tag === 'High Protein') return true;
        if (activeFilters.includes('No Allergens') && item.allergens.length === 0) return true;
        return false;
      });
    }

    // Filter allergens
    if (!showAllergenItems && user) {
      filtered = filtered.filter(item => !hasAllergen(item));
    }

    // Sort: discovery items first
    filtered.sort((a, b) => {
      if (a.is_discovery_item && !b.is_discovery_item) return -1;
      if (!a.is_discovery_item && b.is_discovery_item) return 1;
      return 0;
    });

    return filtered;
  }, [items, searchQuery, activeFilters, showAllergenItems, user, viewSurplusOnly]);

  const hasSurplusItems = useMemo(() => {
    // Only show surplus items if viewing TODAY's menu
    if (selectedDate !== todayString) return false;
    return items.some(item => item.is_surplus_candidate && item.is_active);
  }, [items, selectedDate, todayString]);

  const fastingItems = useMemo(() => {
    return items.filter(item => item.fasting_compliant && item.is_active);
  }, [items]);

  const isPrebookPrebooked = (itemId: string) => {
    return prebookData?.item_id === itemId;
  };

  const handleNavratriClick = () => {
      const isTodayNavratri = menuDay?.festival_tag === "Navratri" && selectedDate === todayString;
      const isTomorrowNavratri = menuDay?.festival_tag === "Navratri" && selectedDate === tomorrowString;
      
      // If already viewing Navratri day, just switch view
      if (isTodayNavratri || isTomorrowNavratri) {
          setShowFastingView(true);
      } else {
          // If viewing a non-Navratri day, but clicked banner (which shouldn't happen if logic is strict, but good fallback)
          // Or if we want to navigate to next Navratri day
          setToast({ message: "Navratri menu is available on specific festival dates.", type: "info" });
      }
  };

  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-card max-w-md w-full border border-gray-100">
          <h1 className="text-3xl font-heading text-navy mb-6 text-center">MealSync</h1>
          <p className="text-gray-500 text-center mb-8">Sign in to manage your meals</p>
          <div className="space-y-4">
            <button
              onClick={() => handleLogin('asha@example.com')}
              className="w-full py-3.5 px-4 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 transition-colors shadow-md"
            >
              Sign in as Asha (Veg)
            </button>
            <button
              onClick={() => handleLogin('rajesh@example.com')}
              className="w-full py-3.5 px-4 bg-white text-navy border border-navy/20 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Sign in as Rajesh (Non-Veg)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Common header props
  const headerProps = {
    user: user!,
    selectedDate,
    onDateChange: setSelectedDate,
    onPrebookClick: () => setShowPrebookModal(true),
    onLogout: handleLogout,
    prebookData,
    devMode,
    meetingSimulation,
    onMeetingChange: setMeetingSimulation,
    onLeaderboardClick: () => setShowLeaderboard(true),
    onOrdersClick: () => setShowOrdersModal(true),
    onMeetingBookingClick: () => setShowMeetingBooking(true),
  };

  if (showFastingView) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Header {...headerProps} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setShowFastingView(false)}
              className="flex items-center text-navy hover:underline mb-4 gap-1 font-medium"
            >
               <ChevronRight className="rotate-180" size={16} /> Back to full menu
            </button>
            <div className="bg-gradient-to-r from-purple-100 to-white p-6 rounded-xl border border-purple-200 shadow-sm">
              <h1 className="text-3xl font-heading text-purple-900 mb-2">Navratri Special</h1>
              {menuDay?.festival_note && (
                <p className="text-purple-700">{menuDay.festival_note}</p>
              )}
            </div>
          </div>

          {fastingItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 bg-white rounded-xl border border-dashed">
              No fasting-compliant items available today.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {fastingItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  isBookmarked={user!.bookmarked_items.includes(item.id)}
                  hasAllergen={hasAllergen(item)}
                  showAllergenOverlay={!showAllergenItems}
                  onBookmark={handleBookmark}
                  onClick={() => setSelectedItem(item)}
                  onPrebook={(id: string, qty: number) => handlePrebook(item.category, id, qty)}
                  isPrebooked={isPrebookPrebooked(item.id)}
                  hasPrebook={!!prebookData}
                  onBuyNow={null}
                  isFastingView={true}
                />
              ))}
            </div>
          )}
        </main>

        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            user={user!}
            hasAllergen={hasAllergen(selectedItem)}
            isBookmarked={user!.bookmarked_items.includes(selectedItem.id)}
            onClose={() => {
              setSelectedItem(null);
              setAllergenAcknowledgment(false);
            }}
            onBookmark={handleBookmark}
            allergenAcknowledgment={allergenAcknowledgment}
            onAllergenAcknowledgment={setAllergenAcknowledgment}
            onPrebook={(qty: number) => handlePrebook(selectedItem.category, selectedItem.id, qty)}
            isPrebooked={isPrebookPrebooked(selectedItem.id)}
            hasPrebook={!!prebookData}
            onBuyNow={(qty: number) => handleDirectBuy(selectedItem, qty)}
          />
        )}
        
        {showLeaderboard && (
            <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )}

        {showOrdersModal && (
            <OrdersModal 
                onClose={() => setShowOrdersModal(false)} 
                bookings={allPrebooks}
                orders={orderHistory}
                onCancel={handleCancelPrebook}
                meetingOrders={meetingOrders}
                onConfirmReceipt={handleConfirmReceipt}
            />
        )}

        {showMeetingBooking && (
            <MeetingBookingModal 
                onClose={() => {
                  setShowMeetingBooking(false);
                  setSelectedMeeting(null);
                  setMeetingCart([]);
                }}
                meetings={mockMeetings}
                selectedMeeting={selectedMeeting}
                onSelectMeeting={setSelectedMeeting}
                availableItems={items.filter(item => item.is_active && item.available_qty > 0)}
                cart={meetingCart}
                onAddToCart={handleAddToMeetingCart}
                onRemoveFromCart={handleRemoveFromMeetingCart}
                deliveryOption={deliveryOption}
                onDeliveryOptionChange={setDeliveryOption}
                customDeliveryTime={customDeliveryTime}
                onCustomDeliveryTimeChange={setCustomDeliveryTime}
                onPlaceOrder={handlePlaceMeetingOrder}
                meetingOrders={meetingOrders}
            />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header {...headerProps} />

      {menuDay?.festival_tag && (
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white shadow-md">
          <div className="container mx-auto px-4">
            <button
              onClick={() => setShowFastingView(true)}
              className="w-full py-4 text-left hover:brightness-110 transition-all group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="text-yellow-300 fill-yellow-300" size={18} />
                  <p className="font-bold text-lg tracking-wide">Navratri Special Menu</p>
                </div>
                <p className="text-purple-100 text-sm opacity-90 group-hover:opacity-100">Exclusive fasting options available for pre-booking.</p>
              </div>
              <ChevronRight className="text-purple-200 group-hover:text-white transform group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      )}

      {showMeetingNudge && (
        <div className="bg-blue-50 border-b border-blue-100 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Calendar size={18} />
              </div>
              <p className="text-blue-900 text-sm font-medium">
                {meetingSimulation === 'Back-to-back' 
                  ? 'Tight schedule detected. Grab a quick bite!'
                  : 'Upcoming meeting at 12:30. Suggested lunch time: 12:00.'}
              </p>
            </div>
            <button
              onClick={dismissMeetingNudge}
              className="text-blue-400 hover:text-blue-700 p-1"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {hasSurplusItems && !surplusBannerDismissed && (
        <div 
          className={cn(
            "border-b transition-colors cursor-pointer",
            viewSurplusOnly ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200 hover:bg-green-100"
          )}
          onClick={() => setViewSurplusOnly(!viewSurplusOnly)}
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-200 p-2 rounded-full text-green-700">
                <Leaf size={18} />
              </div>
              <div>
                <p className="text-green-900 font-medium text-sm">
                  Surplus Items Available (+5 Green Credits)
                </p>
                <p className="text-green-700 text-xs mt-0.5">
                  {viewSurplusOnly ? "Showing surplus items only. Click to clear." : "Tap to view surplus items and help reduce waste."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                 <button className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-green-700 transition-colors">
                     View Items
                 </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSurplusBannerDismissed(true);
                    setViewSurplusOnly(false);
                  }}
                  className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-200/50"
                >
                  <X size={18} />
                </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilters={activeFilters}
          onFilterToggle={toggleFilter}
          showAllergenItems={showAllergenItems}
          onToggleAllergenItems={setShowAllergenItems}
        />

        {viewSurplusOnly && (
          <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg w-fit">
            <Leaf size={16} />
            <span className="text-sm font-medium">Showing Surplus Items</span>
            <button onClick={() => setViewSurplusOnly(false)} className="ml-2 hover:underline text-xs">Clear</button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredItems.map(item => (
            <MenuCard
              key={item.id}
              item={item}
              isBookmarked={user!.bookmarked_items.includes(item.id)}
              hasAllergen={hasAllergen(item)}
              showAllergenOverlay={!showAllergenItems && hasAllergen(item)}
              onBookmark={handleBookmark}
              onClick={() => setSelectedItem(item)}
              onPrebook={(id: string, qty: number) => handlePrebook(item.category, id, qty)}
              isPrebooked={isPrebookPrebooked(item.id)}
              hasPrebook={!!prebookData}
              onBuyNow={(qty: number) => handleDirectBuy(item, qty)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Utensils size={32} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              {menuDay && !menuDay.published
                ? "No menu available for this day."
                : "Try adjusting your search or filters."}
            </p>
            {(activeFilters.length > 1 || searchQuery || viewSurplusOnly) && (
               <button 
                onClick={() => {
                  setActiveFilters(['All']);
                  setSearchQuery('');
                  setViewSurplusOnly(false);
                }}
                className="mt-4 text-navy font-medium hover:underline"
               >
                 Clear all filters
               </button>
            )}
          </div>
        )}
      </main>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          user={user!}
          hasAllergen={hasAllergen(selectedItem)}
          isBookmarked={user!.bookmarked_items.includes(selectedItem.id)}
          onClose={() => {
            setSelectedItem(null);
            setAllergenAcknowledgment(false);
          }}
          onBookmark={handleBookmark}
          allergenAcknowledgment={allergenAcknowledgment}
          onAllergenAcknowledgment={setAllergenAcknowledgment}
          onPrebook={(qty: number) => handlePrebook(selectedItem.category, selectedItem.id, qty)}
          isPrebooked={isPrebookPrebooked(selectedItem.id)}
          hasPrebook={!!prebookData}
          onBuyNow={(qty: number) => handleDirectBuy(selectedItem, qty)}
        />
      )}

      {showPrebookModal && (
        <PrebookModal
          onClose={() => setShowPrebookModal(false)}
          onPrebook={handlePrebook}
          existingPrebook={prebookData}
          onCancelPrebook={handleCancelPrebook}
        />
      )}
      
      {showLeaderboard && (
          <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showOrdersModal && (
          <OrdersModal 
              onClose={() => setShowOrdersModal(false)} 
              bookings={allPrebooks}
              orders={orderHistory}
              onCancel={handleCancelPrebook}
              meetingOrders={meetingOrders}
              onConfirmReceipt={handleConfirmReceipt}
          />
      )}

      {showMeetingBooking && (
          <MeetingBookingModal 
              onClose={() => {
                setShowMeetingBooking(false);
                setSelectedMeeting(null);
                setMeetingCart([]);
              }}
              meetings={mockMeetings}
              selectedMeeting={selectedMeeting}
              onSelectMeeting={setSelectedMeeting}
              availableItems={items.filter(item => item.is_active && item.available_qty > 0)}
              cart={meetingCart}
              onAddToCart={handleAddToMeetingCart}
              onRemoveFromCart={handleRemoveFromMeetingCart}
              deliveryOption={deliveryOption}
              onDeliveryOptionChange={setDeliveryOption}
              customDeliveryTime={customDeliveryTime}
              onCustomDeliveryTimeChange={setCustomDeliveryTime}
              onPlaceOrder={handlePlaceMeetingOrder}
              meetingOrders={meetingOrders}
          />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function Header({ 
  user, 
  selectedDate, 
  onDateChange, 
  onPrebookClick, 
  onLogout,
  prebookData,
  devMode,
  meetingSimulation,
  onMeetingChange,
  onLeaderboardClick,
  onOrdersClick,
  onMeetingBookingClick,
}: any) {
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  return (
    <header className="bg-navy text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-heading tracking-wider">CanteenClear</h1>
            
            {devMode && (
              <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                <label className="text-xs text-white/70 font-medium">DEMO</label>
                <select
                  value={meetingSimulation}
                  onChange={(e) => onMeetingChange(e.target.value)}
                  className="bg-transparent text-white text-sm border-none focus:ring-0 cursor-pointer"
                >
                  <option value="No meeting" className="text-black">No meeting</option>
                  <option value="11:30-12:30" className="text-black">11:30-12:30</option>
                  <option value="12:30-13:30" className="text-black">12:30-13:30</option>
                  <option value="Back-to-back" className="text-black">Back-to-back</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => onDateChange(today)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                  selectedDate === today ? 'bg-white text-navy shadow-sm' : 'hover:bg-white/5 text-white/80'
                )}
              >
                Today
              </button>
              <button
                onClick={() => onDateChange(tomorrow)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                  selectedDate === tomorrow ? 'bg-white text-navy shadow-sm' : 'hover:bg-white/5 text-white/80'
                )}
              >
                Tomorrow
              </button>
            </div>

            <div className="flex items-center gap-3">
               <button
                onClick={onLeaderboardClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm"
                title="Green Credits Leaderboard"
               >
                   <Leaf size={16} className="text-green-400" />
                   <span className="font-bold text-green-400">{user?.green_credits || 0}</span>
               </button>

               <button
                onClick={onOrdersClick}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Orders & Pre-bookings"
               >
                 <ShoppingBag size={20} />
               </button>

              <button
                onClick={onMeetingBookingClick}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-md"
                title="Book Meeting Refreshments"
               >
                 <Utensils size={16} />
                 <span className="hidden md:inline">Meeting</span>
               </button>

              <button
                onClick={onPrebookClick}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                  prebookData 
                    ? "bg-green-500 text-white" 
                    : "bg-accent text-white"
                )}
              >
                {prebookData ? <CheckCircle size={16} /> : <Calendar size={16} />}
                {prebookData ? "Pre-booked" : "Pre-book"}
              </button>

              <button
                onClick={onLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function OrdersModal({ onClose, bookings, orders, onCancel, meetingOrders, onConfirmReceipt }: any) {
    const sortedBookings = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedMeetingOrders = [...(meetingOrders || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm uppercase text-gray-400 tracking-wide font-semibold">My Activity</p>
                        <h2 className="text-2xl font-heading text-navy">Orders & Pre-bookings</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-navy"><X size={24} /></button>
                </div>

                <section>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming Pre-bookings</h3>
                    {sortedBookings.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                            <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
                            <p>No active pre-bookings.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {sortedBookings.map((booking) => {
                                const bookingDate = new Date(booking.date);
                                const isToday = new Date().toDateString() === bookingDate.toDateString();
                                const tomorrowDate = new Date();
                                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                                const isTomorrow = tomorrowDate.toDateString() === bookingDate.toDateString();

                                let dateLabel = bookingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                if (isToday) dateLabel = "Today";
                                if (isTomorrow) dateLabel = "Tomorrow";

                                return (
                                    <div key={booking.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-navy text-lg">{dateLabel}</span>
                                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{booking.date}</span>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {booking.item_id ? "Specific Item Reserved" : booking.item_category}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Quantity: {booking.quantity}</p>
                                        </div>
                                        
                                        {isTomorrow && (
                                            <button 
                                                onClick={() => onCancel(booking.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Meeting Orders</h3>
                    {sortedMeetingOrders.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                            <Utensils size={32} className="mx-auto mb-2 text-gray-300" />
                            <p>No meeting orders yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {sortedMeetingOrders.map(order => {
                                const statusConfig = {
                                    'preparing': { label: 'Preparing', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
                                    'out-for-delivery': { label: 'Out for Delivery', color: 'text-blue-600 bg-blue-50', icon: Package },
                                    'delivered': { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: CheckCircle }
                                };
                                const config = statusConfig[order.status];
                                const StatusIcon = config.icon;
                                
                                return (
                                    <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="text-navy font-semibold text-sm mb-1">
                                                    {order.items.map((item: any) => item.itemName).join(', ')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium", config.color)}>
                                                <StatusIcon size={12} />
                                                {config.label}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                            <div className="text-sm">
                                                <span className="text-gray-600">Total: </span>
                                                <span className="font-bold text-navy">₹{order.totalPrice}</span>
                                            </div>
                                            {order.status === 'delivered' && !order.confirmedAt && (
                                                <button
                                                    onClick={() => onConfirmReceipt(order.id)}
                                                    className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                                                >
                                                    Confirm Receipt
                                                </button>
                                            )}
                                            {order.confirmedAt && (
                                                <span className="text-xs text-green-600 font-medium">✓ Received</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Surplus Purchases</h3>
                    {sortedOrders.filter(o => o.type === 'surplus').length === 0 ? (
                        <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                            <Leaf size={32} className="mx-auto mb-2 text-gray-300" />
                            <p>No surplus items purchased yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {sortedOrders.filter(o => o.type === 'surplus').map(order => (
                                <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-navy font-semibold">{order.itemName}</p>
                                        <p className="text-xs text-gray-500">Purchased on {new Date(order.date).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-700">Qty: {order.quantity}</p>
                                        <p className="text-xs text-green-600 font-semibold">₹{order.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
          </div>
        </div>
    );
}

function FiltersBar({ 
  searchQuery, 
  onSearchChange, 
  activeFilters, 
  onFilterToggle,
  showAllergenItems,
  onToggleAllergenItems,
}: any) {
  // ... (Same as before) ...
  const filters = ['All', 'Veg', 'Non-Veg', 'Fasting', 'High Protein', 'No Allergens'];

  return (
    <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search menu items, ingredients..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
          aria-label="Search menu items"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => onFilterToggle(filter)}
              className={cn(
                'px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95',
                activeFilters.includes(filter)
                  ? 'bg-navy text-white border-navy shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-navy/50 hover:text-navy'
              )}
            >
              {filter === 'Veg' && <Leaf size={14} className="inline mr-1.5 mb-0.5" />}
              {filter}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-red-200 hover:bg-red-50 transition-all">
          <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", showAllergenItems ? "bg-red-500 border-red-500" : "border-gray-300 bg-white")}>
             {showAllergenItems && <CheckCircle size={12} className="text-white" />}
          </div>
          <input
            type="checkbox"
            checked={showAllergenItems}
            onChange={(e) => onToggleAllergenItems(e.target.checked)}
            className="hidden"
          />
          <span className="text-sm font-medium text-gray-700">Show allergen items</span>
        </label>
      </div>
    </div>
  );
}

function MenuCard({ item, isBookmarked, hasAllergen, showAllergenOverlay, onBookmark, onClick, onPrebook, isPrebooked, hasPrebook, onBuyNow, isFastingView = false }: any) {
  const isSoldOut = item.available_qty <= 0;
  const maxQuantity = Math.max(1, Math.min(item.available_qty, 5));
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e: React.MouseEvent, delta: number) => {
      e.stopPropagation();
      setQuantity(prev => {
        const updated = prev + delta;
        return Math.max(1, Math.min(maxQuantity, updated));
      });
  };

  return (
    <div
      className={cn(
        'group bg-white rounded-xl shadow-card overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-hover border border-transparent',
        item.is_discovery_item && 'ring-2 ring-discovery ring-offset-2',
        isPrebooked && 'ring-2 ring-green-500 ring-offset-2'
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60'; // Generic food fallback
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {item.is_discovery_item && (
          <div className="absolute top-3 left-3 bg-discovery text-navy px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold uppercase">Special</span>
          </div>
        )}

        {item.is_surplus_candidate && (
            <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Leaf size={14} />
                <span className="text-xs font-bold">Surplus</span>
            </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(item.id, isBookmarked);
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition-all hover:bg-white"
          aria-label={isBookmarked ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Bookmark
            size={18}
            fill={isBookmarked ? '#0B2545' : 'none'}
            stroke={isBookmarked ? '#0B2545' : '#4B5563'}
          />
        </button>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-heading text-3xl tracking-widest border-4 border-white px-6 py-2 rotate-12">SOLD OUT</span>
          </div>
        )}

        {showAllergenOverlay && hasAllergen && !isSoldOut && (
          <div className="absolute inset-0 bg-destructive/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <AlertTriangle size={48} className="text-white mb-3" />
            <span className="text-white font-bold text-lg">Contains Allergens</span>
            <span className="text-white/90 text-sm mt-2">Tap to view details</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-heading font-bold text-navy leading-tight">{item.name}</h3>
          <span className="text-lg font-bold text-navy bg-secondary/50 px-2 py-1 rounded-md">₹{item.price}</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {item.diet_tags.map((tag: string) => (
            <span
              key={tag}
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide',
                tag === 'Veg' ? 'bg-green-100 text-green-800' : 
                tag === 'Non-Veg' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-700'
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Quantity Selection for Card */}
        <div className="flex items-center gap-3 mb-3 bg-gray-50 p-1.5 rounded-lg w-fit" onClick={(e) => e.stopPropagation()}>
             <button 
                className="p-1 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                onClick={(e) => handleQuantityChange(e, -1)}
                disabled={quantity <= 1}
             >
                 <Minus size={14} />
             </button>
             <span className="text-sm font-bold w-6 text-center">{quantity}</span>
             <button 
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                onClick={(e) => handleQuantityChange(e, 1)}
                disabled={quantity >= maxQuantity}
             >
                 <Plus size={14} />
             </button>
             <span className="text-[10px] uppercase text-gray-400 font-semibold">Max {maxQuantity}</span>
        </div>

        <div className="flex gap-3">
            <button 
                className="flex-1 py-2.5 rounded-lg border border-navy/10 text-navy font-medium hover:bg-navy/5 transition-colors text-sm"
            >
                Details
            </button>
            {item.is_surplus_candidate && !isFastingView && onBuyNow ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBuyNow(quantity);
                    }}
                    disabled={isSoldOut}
                    className="flex-1 py-2.5 rounded-lg font-bold uppercase tracking-wide transition-all text-sm flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-md"
                >
                    Buy Now
                </button>
            ) : (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrebook(item.id, quantity);
                    }}
                    disabled={isSoldOut || (hasPrebook && !isPrebooked)}
                    className={cn(
                        "flex-1 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2",
                        isPrebooked 
                            ? "bg-green-600 text-white shadow-md"
                            : hasPrebook
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-navy text-white hover:bg-navy/90 shadow-md hover:shadow-lg"
                    )}
                >
                    {isPrebooked ? (
                        <>
                            <CheckCircle size={16} />
                            Pre-booked
                        </>
                    ) : (
                        <>
                            <Calendar size={16} />
                            Pre-book
                        </>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

// ... (ItemDetailModal, LeaderboardModal, PrebookModal follow similar update logic)

function ItemDetailModal({ 
  item, 
  user, 
  hasAllergen, 
  isBookmarked, 
  onClose, 
  onBookmark,
  allergenAcknowledgment,
  onAllergenAcknowledgment,
  onPrebook,
  isPrebooked,
  hasPrebook,
  onBuyNow
}: any) {
  const isSoldOut = item.available_qty <= 0;
  const allergensList = hasAllergen ? item.allergens.filter((a: string) => user.allergies.includes(a)) : [];
  const canInteract = !isSoldOut && (!hasAllergen || allergenAcknowledgment);
  const maxQuantity = Math.max(1, Math.min(item.available_qty, 5));
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-heading text-navy">{item.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {hasAllergen && allergensList.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 animate-pulse" role="alert">
              {/* ... Alert content ... */}
               <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <p className="text-red-900 font-bold mb-1">
                    Allergen Warning
                  </p>
                  <p className="text-red-700 text-sm mb-3">
                    Contains: {allergensList.join(', ')}
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={allergenAcknowledgment}
                      onChange={(e) => onAllergenAcknowledgment(e.target.checked)}
                      className="mt-1 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-red-800 group-hover:text-red-900 font-medium">
                      I understand the risk and wish to proceed
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60';
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {item.fasting_compliant && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
                    <Star className="text-purple-600 mt-0.5" size={20} />
                    <div>
                        <span className="font-bold text-purple-900">Navratri Friendly</span>
                        {item.fasting_compliance_note && (
                            <p className="text-sm text-purple-700 mt-1">{item.fasting_compliance_note}</p>
                        )}
                    </div>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-lg">Description</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                 <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Diet</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.diet_tags.map((tag: string) => (
                      <span key={tag} className="text-sm font-medium text-navy">{tag}</span>
                    ))}
                  </div>
                </div>
                 {item.protein_tag && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Protein</h4>
                    <p className="text-sm font-medium text-navy">{item.protein_tag}</p>
                  </div>
                )}

                {item.calorie_range && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Calories</h4>
                    <p className="text-sm font-medium text-navy">{item.calorie_range}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Availability</h4>
                  <p className={cn("text-sm font-medium", item.available_qty < 10 ? "text-orange-600" : "text-navy")}>
                    {item.available_qty} items left
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-navy">₹{item.price}</span>
                  {isSoldOut && (
                    <span className="text-red-600 font-bold uppercase border-2 border-red-600 px-3 py-1 rounded rotate-[-5deg]">Sold out</span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <label className="font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                        <button 
                            className="p-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            <Minus size={18} />
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                        <button 
                            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                            disabled={quantity >= maxQuantity}
                        >
                            <Plus size={18} />
                        </button>
                        <span className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Max {maxQuantity}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {item.is_surplus_candidate ? (
                         <button
                            onClick={() => onBuyNow(quantity)}
                            disabled={!canInteract}
                            className={cn(
                                'w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-md',
                                canInteract ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            )}
                         >
                            Buy Now (Direct)
                         </button>
                    ) : (
                        <button
                          onClick={() => onPrebook(quantity)}
                          disabled={!canInteract || (hasPrebook && !isPrebooked)}
                          className={cn(
                            'w-full py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md',
                            canInteract && (!hasPrebook || isPrebooked)
                              ? isPrebooked 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-navy text-white hover:bg-navy/90 hover:-translate-y-0.5'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          )}
                        >
                          {isPrebooked ? (
                              <>
                                <CheckCircle size={20} />
                                Pre-booked for Tomorrow
                              </>
                          ) : (
                              <>
                                <Calendar size={20} />
                                Pre-book for Tomorrow
                              </>
                          )}
                        </button>
                    )}
                    
                    <button
                      onClick={() => onBookmark(item.id, isBookmarked)}
                      disabled={!canInteract}
                      className={cn(
                        'w-full py-3.5 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border-2',
                        canInteract
                          ? 'border-navy/10 text-navy hover:bg-navy/5'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed'
                      )}
                    >
                      <Bookmark size={20} fill={isBookmarked ? '#0B2545' : 'none'} />
                      {isBookmarked ? 'Remove from Favourites' : 'Add to Favourites'}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardModal({ onClose }: { onClose: () => void }) {
    return (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-navy p-6 text-white text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={24} /></button>
                <Trophy size={48} className="mx-auto mb-3 text-yellow-400" />
                <h2 className="text-2xl font-heading">Green Leaderboard</h2>
                <p className="text-white/80 text-sm">Top eco-friendly foodies this month</p>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
                {mockLeaderboard.map((user, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border-b border-gray-50 last:border-none hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 font-bold text-gray-400 text-center">#{user.rank}</div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-navy">{user.name}</p>
                            <p className="text-xs text-gray-500">Sustainability Champion</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-green-600">{user.credits}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Credits</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100">
                Earn credits by choosing surplus items and reducing waste!
            </div>
          </div>
        </div>
    );
}

function PrebookModal({ onClose, onPrebook, existingPrebook, onCancelPrebook }: any) {
  const cutoffHour = parseInt(process.env.NEXT_PUBLIC_PREBOOK_CUTOFF_HOUR || '10');
  const cutoffMinute = parseInt(process.env.NEXT_PUBLIC_PREBOOK_CUTOFF_MINUTE || '30');
  const pastCutoff = isPastCutoff(cutoffHour, cutoffMinute);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-heading text-navy">
                Pre-book Meal
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-navy"><X size={24} /></button>
          </div>

          {existingPrebook ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} />
                </div>
                <p className="font-bold text-green-900 text-lg mb-1">Pre-booking Confirmed</p>
                <p className="text-green-700">
                    {existingPrebook.item_id ? "Specific Item Reserved" : `Category: ${existingPrebook.item_category}`}
                </p>
                {existingPrebook.quantity > 1 && (
                    <p className="text-sm font-bold text-green-800 mt-1">Quantity: {existingPrebook.quantity}</p>
                )}
                <p className="text-xs text-green-600 mt-2">For Tomorrow</p>
              </div>

              {!pastCutoff ? (
                <button
                  onClick={onCancelPrebook}
                  className="w-full py-3.5 px-4 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                >
                  Cancel Pre-book
                </button>
              ) : (
                <p className="text-sm text-gray-500 text-center bg-gray-50 py-2 rounded-lg">
                  Cannot cancel after {cutoffHour}:{cutoffMinute.toString().padStart(2, '0')} AM
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-medium text-navy">Note:</span> Pre-booking guarantees your meal availability.
                <br />Cutoff: {cutoffHour}:{cutoffMinute.toString().padStart(2, '0')} AM.
              </p>

              {pastCutoff ? (
                <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-600 font-medium">Pre-booking closed for tomorrow</p>
                  <p className="text-red-400 text-sm mt-1">Please check back later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => onPrebook('Veg')}
                    className="w-full py-4 px-4 bg-green-50 border border-green-100 text-green-800 rounded-xl hover:bg-green-100 transition-all flex items-center justify-between group"
                  >
                    <span className="font-bold">Standard Veg Meal</span>
                    <ChevronRight className="text-green-600 group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  <button
                    onClick={() => onPrebook('Non-Veg')}
                    className="w-full py-4 px-4 bg-red-50 border border-red-100 text-red-800 rounded-xl hover:bg-red-100 transition-all flex items-center justify-between group"
                  >
                    <span className="font-bold">Standard Non-Veg Meal</span>
                    <ChevronRight className="text-red-600 group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  <button
                    onClick={() => onPrebook('Fasting')}
                    className="w-full py-4 px-4 bg-purple-50 border border-purple-100 text-purple-800 rounded-xl hover:bg-purple-100 transition-all flex items-center justify-between group"
                  >
                    <span className="font-bold">Fasting / Navratri Meal</span>
                    <ChevronRight className="text-purple-600 group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MeetingBookingModal({ 
  onClose, 
  meetings, 
  selectedMeeting, 
  onSelectMeeting, 
  availableItems, 
  cart, 
  onAddToCart, 
  onRemoveFromCart,
  deliveryOption,
  onDeliveryOptionChange,
  customDeliveryTime,
  onCustomDeliveryTimeChange,
  onPlaceOrder,
  meetingOrders
}: any) {
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<MenuItem | null>(null);

  const totalPrice = cart.reduce((sum: number, c: any) => sum + (c.item.price * c.quantity), 0);
  const totalItems = cart.reduce((sum: number, c: any) => sum + c.quantity, 0);

  const handleAddItem = (item: MenuItem) => {
    setSelectedItemToAdd(item);
    setItemQuantity(1);
    setShowItemSelector(true);
  };

  const confirmAddItem = () => {
    if (selectedItemToAdd) {
      onAddToCart(selectedItemToAdd, itemQuantity);
      setShowItemSelector(false);
      setSelectedItemToAdd(null);
      setItemQuantity(1);
    }
  };

  const formatMeetingTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start sticky top-0 bg-white pb-4 border-b border-gray-100">
            <div>
              <p className="text-sm uppercase text-gray-400 tracking-wide font-semibold">Meeting Refreshments</p>
              <h2 className="text-2xl font-heading text-navy">Book for Meeting</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-navy">
              <X size={24} />
            </button>
          </div>

          {!selectedMeeting ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Select Meeting</h3>
              <div className="space-y-3">
                {meetings.map((meeting: Meeting) => {
                  const existingOrder = meetingOrders.find((o: MeetingOrder) => o.meetingId === meeting.id);
                  
                  return (
                    <div
                      key={meeting.id}
                      onClick={() => !existingOrder && onSelectMeeting(meeting)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        existingOrder 
                          ? "bg-green-50 border-green-200 cursor-not-allowed" 
                          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-navy text-lg mb-2">{meeting.title}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span>{formatMeetingTime(meeting.startTime)} - {formatMeetingTime(meeting.endTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span>{meeting.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-gray-400" />
                              <span>{meeting.attendees} attendees</span>
                            </div>
                          </div>
                        </div>
                        {existingOrder ? (
                          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-green-800 font-medium text-sm">Ordered</span>
                          </div>
                        ) : (
                          <ChevronRight className="text-gray-400" size={20} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-blue-900 text-lg">{selectedMeeting.title}</h4>
                  <button
                    onClick={() => onSelectMeeting(null)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-blue-700 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatMeetingTime(selectedMeeting.startTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedMeeting.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {selectedMeeting.attendees}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Refreshments Cart</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                    <Package size={40} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No items in cart. Add items below.</p>
                  </div>
                ) : (
                  <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {cart.map((cartItem: any) => (
                      <div
                        key={cartItem.item.id}
                        className="flex items-center justify-between bg-white p-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-navy">{cartItem.item.name}</p>
                          <p className="text-sm text-gray-500">
                            {cartItem.quantity} x ₹{cartItem.item.price} = ₹{cartItem.quantity * cartItem.item.price}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(cartItem.item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-navy">Total ({totalItems} items)</span>
                      <span className="text-2xl font-bold text-navy">₹{totalPrice}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                  {availableItems.map((item: MenuItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                      onClick={() => handleAddItem(item)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-navy text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">₹{item.price}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(item);
                        }}
                        className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Delivery Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="silent"
                      name="delivery"
                      checked={deliveryOption === 'silent'}
                      onChange={() => onDeliveryOptionChange('silent')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="silent" className="flex-1 cursor-pointer">
                      <p className="font-medium text-navy">Silent Delivery</p>
                      <p className="text-sm text-gray-500">Leave at reception desk</p>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="notify"
                      name="delivery"
                      checked={deliveryOption === 'notify'}
                      onChange={() => onDeliveryOptionChange('notify')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="notify" className="flex-1 cursor-pointer">
                      <p className="font-medium text-navy">Notify on Delivery</p>
                      <p className="text-sm text-gray-500">Send notification when delivered</p>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={customDeliveryTime}
                      onChange={(e) => onCustomDeliveryTimeChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={onPlaceOrder}
                disabled={cart.length === 0}
                className={cn(
                  "w-full py-4 px-4 rounded-xl font-bold text-white transition-all shadow-lg",
                  cart.length > 0
                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                Place Order - ₹{totalPrice}
              </button>
            </div>
          )}
        </div>
      </div>

      {showItemSelector && selectedItemToAdd && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
          onClick={() => setShowItemSelector(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full m-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-navy text-lg mb-4">{selectedItemToAdd.name}</h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold w-16 text-center">{itemQuantity}</span>
              <button
                onClick={() => setItemQuantity(itemQuantity + 1)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowItemSelector(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddItem}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
