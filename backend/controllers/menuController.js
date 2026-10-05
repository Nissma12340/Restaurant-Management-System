import { Storage } from '../models/storage.js';

export const getMenuItems = async (req, res) => {
  try {
    const items = await Storage.getMenuItems();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve menu items', error: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name cannot be empty.' });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ message: 'Category cannot be empty.' });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Please enter a valid price greater than 0.' });
    }

    const newItem = await Storage.addMenuItem({
      name: name.trim(),
      category: category.trim(),
      price: numericPrice
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Item ID is required.' });
    }

    const success = await Storage.deleteMenuItem(id);
    if (!success) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
  }
};
