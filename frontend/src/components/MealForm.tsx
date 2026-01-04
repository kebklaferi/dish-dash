import { useState } from 'react';
import { Meal } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MealFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (meal: Omit<Meal, 'id'>) => void;
  meal?: Meal;
  restaurantId: string;
  restaurantName: string;
}

export function MealForm({
  open,
  onClose,
  onSubmit,
  meal,
  restaurantId,
  restaurantName,
}: MealFormProps) {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    description: meal?.description || '',
    price: meal?.price?.toString() || '',
    image: meal?.image || '',
    category: meal?.category || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      restaurantId,
      restaurantName,
      category: formData.category,
    });
    onClose();
    setFormData({ name: '', description: '', price: '', image: '', category: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{meal ? 'Edit Meal' : 'Add New Meal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              {meal ? 'Update' : 'Add'} Meal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
