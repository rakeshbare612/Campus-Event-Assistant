import React, { useState, useMemo } from 'react';
import { useEvents } from '../../context/EventContext';
import { CampusEvent, EventCategory } from '../../types';
import { EventCard } from '../EventCard';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Grid, 
  List, 
  X, 
  Check, 
  Sparkles, 
  Heart, 
  AlertCircle 
} from 'lucide-react';

interface EventsListViewProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onQuickSummarize?: (event: CampusEvent) => void;
}

export const EventsListView: React.FC<EventsListViewProps> = ({
  onOpenEventDetails,
  onQuickSummarize,
}) => {
  const { events, favorites } = useEvents();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'seats'>('date');
  const [onlyAvailableSeats, setOnlyAvailableSeats] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isGridView, setIsGridView] = useState(true);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'technical', label: 'Technical' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'competition', label: 'Competitions' },
    { id: 'seminar', label: 'Seminars' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'sports', label: 'Sports' },
  ];

  // Filtering & Sorting Logic
  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchDesc = evt.description.toLowerCase().includes(q);
          const matchVenue = evt.venue.toLowerCase().includes(q);
          const matchOrg = evt.organizer.toLowerCase().includes(q);
          const matchTags = evt.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchVenue && !matchOrg && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && evt.category !== selectedCategory) {
          return false;
        }

        // Available seats filter
        if (onlyAvailableSeats) {
          const seatsLeft = evt.capacity - evt.registeredCount;
          if (seatsLeft <= 0 || evt.status === 'full' || evt.status === 'cancelled') {
            return false;
          }
        }

        // Favorites only filter
        if (onlyFavorites && !favorites.includes(evt.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return a.date.localeCompare(b.date);
        }
        if (sortBy === 'popularity') {
          return b.registeredCount - a.registeredCount;
        }
        if (sortBy === 'seats') {
          const aSeats = a.capacity - a.registeredCount;
          const bSeats = b.capacity - b.registeredCount;
          return bSeats - aSeats;
        }
        return 0;
      });
  }, [events, searchQuery, selectedCategory, sortBy, onlyAvailableSeats, onlyFavorites, favorites]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyAvailableSeats(false);
    setOnlyFavorites(false);
    setSortBy('date');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Events Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover, filter, and register for workshops, technical seminars, hackathons, and cultural fests.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, topics, venues..."
            className="w-full px-4 py-2.5 pl-10 pr-9 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent shadow-xs transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Second Row: Toggles, Sort, View Options */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyAvailableSeats(!onlyAvailableSeats)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors flex items-center gap-1.5 ${
                onlyAvailableSeats
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {onlyAvailableSeats && <Check className="w-3.5 h-3.5" />}
              <span>Open Seats Only</span>
            </button>

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors flex items-center gap-1.5 ${
                onlyFavorites
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-rose-500' : 'text-slate-400'}`} />
              <span>Saved Events ({favorites.length})</span>
            </button>

            {(searchQuery || selectedCategory !== 'all' || onlyAvailableSeats || onlyFavorites) && (
              <button
                onClick={resetFilters}
                className="text-purple-600 font-semibold hover:underline px-2 py-1"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Sort By & View Controls */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="date">Upcoming Date</option>
                <option value="popularity">Most Popular</option>
                <option value="seats">Available Seats</option>
              </select>
            </div>

            {/* Grid / List switch */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setIsGridView(true)}
                className={`p-1.5 rounded-md transition-colors ${
                  isGridView ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsGridView(false)}
                className={`p-1.5 rounded-md transition-colors ${
                  !isGridView ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
        </span>
        {selectedCategory !== 'all' && (
          <span className="font-medium text-purple-700 uppercase tracking-wider">
            Category: {selectedCategory}
          </span>
        )}
      </div>

      {/* Events Grid or List */}
      {filteredEvents.length > 0 ? (
        <div
          className={
            isGridView
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenDetails={onOpenEventDetails}
              onQuickSummarize={onQuickSummarize}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Matching Events Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            No events match your current filter parameters or search query. Try broadening your keywords or resetting active filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
