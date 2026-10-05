import { Storage } from '../models/storage.js';

const ALLOWED_STATUSES = ['Pending', 'Preparing', 'Completed'];

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Storage.getOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, status } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please add at least one item to the order.' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return res.status(400).json({ message: 'Each item must have a valid name.' });
      }
      const price = Number(item.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ message: 'Each item must have a valid price greater than 0.' });
      }
      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
      }
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` 
      });
    }

    const newOrder = await Storage.createOrder({
      items,
      status: status || 'Pending'
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` 
      });
    }

    const updatedOrder = await Storage.updateOrderStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};
