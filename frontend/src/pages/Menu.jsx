import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Utensils, 
  AlertCircle 
} from 'lucide-react';
import { MenuService } from '../services/api';

const DEFAULT_CATEGORIES = [
  'Fast Food',
  'Pizza',
  'Italian',
  'Snacks',
  'Beverages',
  'Indian',
  'Desserts'
];

export default function Menu({ showToast }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fast Food',
    customCategory: '',
    price: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MenuService.getAll();
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setError('Unable to load menu items. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError('');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const trimmedName = formData.name.trim();
    const finalCategory = formData.category === 'Other' 
      ? formData.customCategory.trim() 
      : formData.category.trim();
    const numericPrice = parseFloat(formData.price);

    if (!trimmedName) {
      setFormError('Name cannot be empty.');
      return;
    }

    if (!finalCategory) {
      setFormError('Category cannot be empty.');
      return;
    }

    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const newItem = await MenuService.create({
        name: trimmedName,
        category: finalCategory,
        price: numericPrice
      });

      setMenuItems(prev => [...prev, newItem]);
      showToast(`"${newItem.name}" added to menu successfully!`, 'success');
      
      // Reset form and close modal
      setFormData({
        name: '',
        category: 'Fast Food',
        customCategory: '',
        price: ''
      });
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add menu item. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await MenuService.delete(itemToDelete.id);
      setMenuItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      showToast(`"${itemToDelete.name}" deleted successfully!`, 'success');
    } catch (err) {
      showToast('Failed to delete menu item.', 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  // Derive unique categories from existing menu items
  const allCategories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          {/* Search box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search menu items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Add Menu Item</span>
        </button>
      </div>

      {error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Failed to Load Menu</h3>
          <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchMenu}>
            Try Again
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3>Menu Items List ({filteredItems.length})</h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Showing {filteredItems.length} of {menuItems.length} total items
            </span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <h4>No menu items found</h4>
                <p>
                  {searchQuery || selectedCategory !== 'All'
                    ? 'No dishes match your filter criteria.'
                    : 'Get started by adding items to your restaurant menu.'}
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Add First Item</span>
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Item Name</th>
                      <th style={{ width: '25%' }}>Category</th>
                      <th style={{ width: '20%' }}>Price</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>
                          <span className="category-tag">
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
                            ₹{item.price}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => setItemToDelete(item)}
                            title="Delete item"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Menu Item</h3>
              <button 
                className="close-btn" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="menu-item-name">
                    Item Name *
                  </label>
                  <input
                    id="menu-item-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Paneer Tikka"
                    value={formData.name}
                    onChange={handleInputChange}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="menu-item-category">
                    Category *
                  </label>
                  <select
                    id="menu-item-category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">+ Custom Category</option>
                  </select>

                  {formData.category === 'Other' && (
                    <input
                      name="customCategory"
                      type="text"
                      className="form-input"
                      style={{ marginTop: '0.5rem' }}
                      placeholder="Enter custom category..."
                      value={formData.customCategory}
                      onChange={handleInputChange}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="menu-item-price">
                    Price (₹) *
                  </label>
                  <input
                    id="menu-item-price"
                    name="price"
                    type="number"
                    min="1"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 220"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setItemToDelete(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>"{itemToDelete.name}"</strong> (₹{itemToDelete.price}) from the menu?
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger btn-sm" 
                onClick={confirmDelete}
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
