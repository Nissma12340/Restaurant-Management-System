import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Helper to safely read JSON file
async function readJsonFile(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    console.error(`Error reading ${filePath}:`, error.message);
    return defaultValue;
  }
}

// Helper to safely write JSON file
async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const Storage = {
  // Menu operations
  async getMenuItems() {
    return await readJsonFile(MENU_FILE, []);
  },

  async addMenuItem({ name, category, price }) {
    const items = await this.getMenuItems();
    const newItem = {
      id: `item_${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price)
    };
    items.push(newItem);
    await writeJsonFile(MENU_FILE, items);
    return newItem;
  },

  async deleteMenuItem(id) {
    const items = await this.getMenuItems();
    const initialLength = items.length;
    const filtered = items.filter(item => String(item.id) !== String(id));
    
    if (filtered.length === initialLength) {
      return false;
    }
    
    await writeJsonFile(MENU_FILE, filtered);
    return true;
  },

  // Order operations
  async getOrders() {
    const orders = await readJsonFile(ORDERS_FILE, []);
    // Sort orders by createdAt descending
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getOrderById(id) {
    const orders = await this.getOrders();
    return orders.find(o => String(o.id) === String(id));
  },

  async createOrder({ items, total, status = 'Pending' }) {
    const orders = await readJsonFile(ORDERS_FILE, []);
    
    // Auto-increment order ID starting from 1001
    const maxId = orders.reduce((max, o) => {
      const num = parseInt(o.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);

    const newOrderId = maxId + 1;

    // Calculate/validate total if not provided accurately
    const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const newOrder = {
      id: newOrderId,
      items: items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        subtotal: Number(item.price) * Number(item.quantity)
      })),
      total: total !== undefined ? Number(total) : calculatedTotal,
      status: status || 'Pending',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    const orders = await readJsonFile(ORDERS_FILE, []);
    const index = orders.findIndex(o => String(o.id) === String(id));
    
    if (index === -1) {
      return null;
    }

    orders[index].status = status;
    await writeJsonFile(ORDERS_FILE, orders);
    return orders[index];
  },

  // Dashboard calculations
  async getDashboardStats() {
    const menuItems = await this.getMenuItems();
    const orders = await this.getOrders();

    const todayStr = new Date().toISOString().slice(0, 10);

    let todayRevenue = 0;
    let pendingOrders = 0;

    for (const order of orders) {
      const orderDateStr = (order.createdAt || '').slice(0, 10);
      if (orderDateStr === todayStr) {
        todayRevenue += Number(order.total) || 0;
      }
      if (order.status === 'Pending') {
        pendingOrders += 1;
      }
    }

    // Recent orders: top 5
    const recentOrders = orders.slice(0, 5);

    return {
      totalMenuItems: menuItems.length,
      totalOrders: orders.length,
      todayRevenue,
      pendingOrders,
      recentOrders
    };
  }
};
