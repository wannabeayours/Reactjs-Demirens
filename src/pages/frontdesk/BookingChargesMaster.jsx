import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookingChargesMaster = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amenityName, setAmenityName] = useState('');
  const [price, setPrice] = useState('');
  const [savedAmenities, setSavedAmenities] = useState([]); // ✅ new state for existing data
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [editAmenityName, setEditAmenityName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSelectedCategory, setEditSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSavedAmenities(); // ✅ fetch existing
  }, []);

  const fetchCategories = async () => {
    try {
      const url = localStorage.getItem('url') + 'transactions.php';
      const formData = new FormData();
      formData.append('operation', 'chargesCategoryList');
      const res = await axios.post(url, formData);

      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        toast.warning('No category data found');
      }
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    }
  };

  const fetchSavedAmenities = async () => {
    try {
      const url = localStorage.getItem('url') + 'transactions.php';
      const formData = new FormData();
      formData.append('operation', 'chargesMasterList');
      const res = await axios.post(url, formData);
      
      if (Array.isArray(res.data)) {
        setSavedAmenities(res.data);
      } else {
        toast.warning('No saved amenities data found');
        setSavedAmenities([]);
      }
    } catch (error) {
      toast.error('Failed to load saved amenities');
      console.error(error);
      setSavedAmenities([]);
    }
  };

  const handleAdd = async () => {
    if (!selectedCategory || !amenityName.trim() || !price) {
      toast.warning('Complete all fields');
      return;
    }
    setShowModal(true);
  };

  const confirmAdd = async () => {
    const category = categories.find(cat => String(cat.charges_category_id) === String(selectedCategory));
    if (!category) {
      toast.error('Invalid category selected.');
      return;
    }

    try {
      const url = localStorage.getItem('url') + 'transactions.php';
      const formData = new FormData();
      formData.append('operation', 'saveAmenitiesCharges');
      formData.append('json', JSON.stringify({ 
        items: [{
          charges_category_id: Number(selectedCategory),
          charges_category_name: category.charges_category_name,
          charges_master_name: amenityName.trim(),
          charges_master_price: parseFloat(price)
        }]
      }));

      const res = await axios.post(url, formData);
      if (res.data === 'success') {
        toast.success('Amenity saved successfully!');
        setAmenityName('');
        setPrice('');
        setSelectedCategory('');
        fetchSavedAmenities(); // refresh saved table
      } else {
        toast.error('Save failed');
      }
    } catch (error) {
      toast.error('Error saving amenity');
      console.error(error);
    }

    setShowModal(false);
  };

  const handleEdit = (amenity) => {
    setEditingAmenity(amenity);
    setEditAmenityName(amenity['Charge Name']);
    setEditPrice(amenity['Price']);
    setEditSelectedCategory(amenity['Category']);
    setShowEditModal(true);
  };

  const confirmEdit = async () => {
    if (!editAmenityName.trim() || !editPrice) {
      toast.warning('Complete all fields');
      return;
    }

    try {
      const url = localStorage.getItem('url') + 'transactions.php';
      const formData = new FormData();
      formData.append('operation', 'updateAmenityCharges');
      formData.append('json', JSON.stringify({
        charges_master_id: editingAmenity['Charge ID'],
        charges_master_name: editAmenityName.trim(),
        charges_master_price: parseFloat(editPrice)
      }));

      const res = await axios.post(url, formData);
      if (res.data === 'success') {
        toast.success('Amenity updated successfully!');
        setShowEditModal(false);
        setEditingAmenity(null);
        setEditAmenityName('');
        setEditPrice('');
        setEditSelectedCategory('');
        fetchSavedAmenities(); // refresh saved table
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      toast.error('Error updating amenity');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Add Amenities</h2>

      <div>
        <label>Category:</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.charges_category_id} value={cat.charges_category_id}>
              {cat.charges_category_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Amenity Name:</label>
        <input
          type="text"
          value={amenityName}
          onChange={(e) => setAmenityName(e.target.value)}
          placeholder="e.g., Sabon, Bed"
        />
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          min="0"
          step="any"
        />
      </div>

      <button onClick={handleAdd}>Add Amenity</button>

      <h3>Saved Amenities</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Charge ID</th>
            <th>Charge Name</th>
            <th>Category</th>
            <th>Price (₱)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {savedAmenities.length === 0 ? (
            <tr><td colSpan="5">No saved amenities.</td></tr>
          ) : (
            savedAmenities.map((item, index) => (
              <tr key={index}>
                <td>{item['Charge ID']}</td>
                <td>{item['Charge Name']}</td>
                <td>{item['Category']}</td>
                <td>₱{item['Price']}</td>
                <td><button onClick={() => handleEdit(item)}>Edit</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '100%', background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
            <h3>Confirm Add</h3>
            <p><strong>Amenity:</strong> {amenityName}</p>
            <p><strong>Category:</strong> {categories.find(c => String(c.charges_category_id) === String(selectedCategory))?.charges_category_name}</p>
            <p><strong>Price:</strong> ₱{price}</p>
            <button onClick={confirmAdd}>Confirm</button>{' '}
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '100%', background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
            <h3>Edit Amenity</h3>
            <div>
              <label>Amenity Name:</label>
              <input
                type="text"
                value={editAmenityName}
                onChange={(e) => setEditAmenityName(e.target.value)}
                placeholder="Enter amenity name"
              />
            </div>
            <div>
              <label>Price:</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
                step="any"
              />
            </div>
            <div>
              <label>Category:</label>
              <select value={editSelectedCategory} onChange={(e) => setEditSelectedCategory(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.charges_category_id} value={cat.charges_category_name}>
                    {cat.charges_category_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 15 }}>
              <button onClick={confirmEdit}>Update</button>{' '}
              <button onClick={() => {
                setShowEditModal(false);
                setEditingAmenity(null);
                setEditAmenityName('');
                setEditPrice('');
                setEditSelectedCategory('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingChargesMaster;
