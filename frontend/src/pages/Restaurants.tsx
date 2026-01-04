import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurants } from '@/data/mockData';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Input } from '@/components/ui/input';
import { Search, Store } from 'lucide-react';

export default function Restaurants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredRestaurants = useMemo(() => {
    if (!search) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const cuisines = useMemo(() => {
    return [...new Set(restaurants.map((r) => r.cuisine))];
  }, []);

  return (
    <div className="pb-24">
      {/* Search Section */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            className="pl-10 h-12 bg-muted border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cuisines Filter */}
      <section className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSearch('')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !search
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/20'
            }`}
          >
            All
          </button>
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSearch(cuisine)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                search === cuisine
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-primary/20'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">
            {search ? `${filteredRestaurants.length} Restaurants` : 'All Restaurants'}
          </h2>
        </div>
        <div className="grid gap-4">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}
        </div>
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No restaurants found</p>
          </div>
        )}
      </section>
    </div>
  );
}
