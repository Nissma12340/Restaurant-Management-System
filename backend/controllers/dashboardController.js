import { Storage } from '../models/storage.js';

export const getDashboardData = async (req, res) => {
  try {
    const stats = await Storage.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve dashboard data', error: error.message });
  }
};
