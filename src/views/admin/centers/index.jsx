import React, { useState, useEffect, useMemo } from 'react';
import { centersAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import FullScreenModal from '../../../components/modal/FullScreenModal';
import Card from '../../../components/card';
import Widget from '../../../components/widget/Widget';
import { MdBusiness, MdLocationCity, MdEdit, MdDelete, MdAdd, MdSearch, MdLocationOn } from 'react-icons/md';

const Centers = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: ''
  });
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await centersAPI.getAll();
      setCenters(response.data);
    } catch (error) {
      console.error('Error fetching centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = useMemo(() => {
    if (!searchTerm) return centers;
    
    const term = searchTerm.toLowerCase();
    return centers.filter(center => 
      center.name.toLowerCase().includes(term) ||
      center.city.toLowerCase().includes(term) ||
      center.address.toLowerCase().includes(term)
    );
  }, [centers, searchTerm]);

  const stats = useMemo(() => {
    const uniqueCities = new Set(centers.map(c => c.city)).size;
    return {
      totalCenters: centers.length,
      totalCities: uniqueCities
    };
  }, [centers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await centersAPI.update(editingCenter.id, formData);
      } else {
        await centersAPI.create(formData);
      }
      setShowModal(false);
      setEditingCenter(null);
      setFormData({ name: '', city: '', address: '' });
      fetchCenters();
    } catch (error) {
      console.error('Error saving center:', error);
    }
  };

  const handleEdit = (center) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      city: center.city,
      address: center.address
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this center?')) {
      try {
        await centersAPI.delete(id);
        fetchCenters();
      } catch (error) {
        console.error('Error deleting center:', error);
      }
    }
  };

  const openModal = () => {
    setEditingCenter(null);
    setFormData({ name: '', city: '', address: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-5">
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 mb-5">
        <Widget
          icon={<MdBusiness className="h-7 w-7" />}
          title="Total Centers"
          subtitle={stats.totalCenters}
        />
        <Widget
          icon={<MdLocationCity className="h-7 w-7" />}
          title="Cities Covered"
          subtitle={stats.totalCities}
        />
      </div>

      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-navy-700 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400"
            />
          </div>
          
          {hasRole('Admin') && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all duration-200 font-medium shadow-md shadow-brand-500/50 hover:shadow-lg hover:shadow-brand-500/50"
            >
              <MdAdd className="h-5 w-5" />
              Add Center
            </button>
          )}
        </div>

        {filteredCenters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 dark:bg-navy-700 p-6 mb-4">
              <MdBusiness className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">
              {searchTerm ? 'No centers found' : 'No centers yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Get started by adding your first healthcare center.'}
            </p>
            {!searchTerm && hasRole('Admin') && (
              <button
                onClick={openModal}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all duration-200 font-medium"
              >
                <MdAdd className="h-5 w-5" />
                Add Your First Center
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 text-start">
                    <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                      Center Name
                    </p>
                  </th>
                  <th className="pb-3 text-start">
                    <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                      City
                    </p>
                  </th>
                  <th className="pb-3 text-start">
                    <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                      Address
                    </p>
                  </th>
                  <th className="pb-3 text-start">
                    <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                      Created
                    </p>
                  </th>
                  {hasRole('Admin') && (
                    <th className="pb-3 text-start">
                      <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                        Actions
                      </p>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredCenters.map((center) => (
                  <tr 
                    key={center.id} 
                    className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600">
                          <MdBusiness className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                          {center.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-start">
                      <div className="flex items-center gap-2">
                        <MdLocationCity className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {center.city}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-start max-w-xs">
                      <div className="flex items-start gap-2">
                        <MdLocationOn className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {center.address}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-start">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(center.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    {hasRole('Admin') && (
                      <td className="py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(center)}
                            className="flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 transition duration-200 hover:bg-gray-100 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10"
                            title="Edit"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(center.id)}
                            className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-500 transition duration-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                            title="Delete"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <MdBusiness className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCenter ? 'Edit Center' : 'Add New Center'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingCenter ? 'Update center information' : 'Create a new center'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-navy-700 dark:text-white">
              <MdBusiness className="h-4 w-4" />
              Center Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter center name"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none dark:!border-white/10 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-navy-700 dark:text-white">
              <MdLocationCity className="h-4 w-4" />
              City
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Enter city name"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none dark:!border-white/10 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-navy-700 dark:text-white">
              <MdLocationOn className="h-4 w-4" />
              Address
            </label>
            <textarea
              required
              rows={4}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
              className="mt-2 flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none dark:!border-white/10 dark:text-white"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <MdBusiness className="text-lg" />
              {editingCenter ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
    </div>
  );
};

export default Centers;
