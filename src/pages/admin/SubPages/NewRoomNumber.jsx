import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Minimal UI primitives to avoid coupling to custom components
function Label({ children, htmlFor, className }) {
  return <label htmlFor={htmlFor} className={className || 'block text-sm font-medium mb-1'}>{children}</label>;
}
function Input(props) {
  return <input {...props} className={(props.className || '') + ' border rounded px-3 py-2 w-full'} />
}
function Select(props) {
  return <select {...props} className={(props.className || '') + ' border rounded px-3 py-2 w-full'} />
}
function Button({ children, onClick, type = 'button', variant = 'default', className }) {
  const base = 'inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium';
  const styles = variant === 'outline'
    ? ' border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
    : ' bg-blue-600 text-white hover:bg-blue-700';
  return <button type={type} onClick={onClick} className={`${base} ${styles} ${className || ''}`}>{children}</button>
}

// Basic card layout wrappers
function Card({ children, className }) {
  return <div className={`rounded-lg border border-gray-200 shadow-sm bg-white ${className || ''}`}>{children}</div>
}
function CardHeader({ children }) { return <div className="p-4 border-b border-gray-200">{children}</div> }
function CardTitle({ children }) { return <h2 className="text-lg font-semibold">{children}</h2> }
function CardContent({ children }) { return <div className="p-4">{children}</div> }

export default function NewRoomNumber() {
  const APIConn = useMemo(() => `${localStorage.url}admin.php`, []);
  const navigate = useNavigate();

  const rawType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '');
  const rawLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '');
  const normalizedRole = rawLevel || rawType;
  const isAdmin = normalizedRole === 'admin';

  const [roomTypes, setRoomTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([
    { id: 3, name: 'Vacant' },
    { id: 4, name: 'Under-Maintenance' },
    { id: 5, name: 'Dirty' },
  ]);

  const [form, setForm] = useState({
    roomtype_id: '',
    room_status_id: 3,
    room_floor: '',
    mode: 'single', // 'single' | 'multiple'
    single_room_number: '',
    multiple_room_numbers: '', // comma-separated
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicateDialog, setDuplicateDialog] = useState({ show: false, duplicates: [] });

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const fd = new FormData();
        fd.append('method', 'viewRoomTypes');
        const res = await axios.post(APIConn, fd);
        const list = Array.isArray(res.data) ? res.data : [];
        setRoomTypes(list.map(rt => ({ id: rt.roomtype_id || rt.id, name: rt.roomtype_name || rt.name })));
      } catch (e) {
        console.error('Failed to load room types:', e);
        setRoomTypes([]);
      }
    };
    fetchRoomTypes();
  }, [APIConn]);

  useEffect(() => {
    if (!isAdmin) {
      // Guard: only admins should access this page
      navigate('/admin/roomslist');
    }
  }, [isAdmin, navigate]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const parseRoomNumbers = () => {
    if (form.mode === 'single') {
      const num = String(form.single_room_number || '').trim();
      return num ? [num] : [];
    }
    const raw = String(form.multiple_room_numbers || '').split(',').map(s => s.trim()).filter(Boolean);
    return raw;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
  
    try {
      // Basic validation
      if (!form.roomtype_id) { setError('Please select a Room Type'); return; }
      if (!form.room_status_id) { setError('Please select a Room Status'); return; }
      const floorNum = Number(form.room_floor);
      if (!Number.isFinite(floorNum) || floorNum < 0) { setError('Room Floor must be a non-negative number'); return; }
  
      const roomNumbers = parseRoomNumbers();
      if (roomNumbers.length === 0) { setError('Please provide at least one room number'); return; }
  
      const payload = {
        roomtype_id: Number(form.roomtype_id),
        room_status_id: Number(form.room_status_id),
        room_floor: floorNum,
        room_numbers: roomNumbers,
      };
  
      // Pre-check duplicates via viewAllRooms
      try {
        const fdCheck = new FormData();
        fdCheck.append('method', 'viewAllRooms');
        const resRooms = await axios.post(APIConn, fdCheck);
        const roomsList = Array.isArray(resRooms.data) ? resRooms.data : [];
        const existingSet = new Set(
          roomsList
            .filter((r) => Number(r.roomtype_id) === payload.roomtype_id)
            .map((r) => String(r.roomnumber_id))
        );
        const duplicates = payload.room_numbers.filter((n) => existingSet.has(String(n)));
        if (duplicates.length > 0) {
          setDuplicateDialog({ show: true, duplicates });
          try {
            sessionStorage.setItem('room_numbers_duplicates', JSON.stringify({ numbers: duplicates }));
          } catch (e) {}
        }
      } catch (e) {
        // Silent fail for duplicate pre-check
      }
  
      const fd = new FormData();
      fd.append('method', 'addRoomNumbers');
      fd.append('roomtype_id', String(payload.roomtype_id));
      fd.append('room_status_id', String(payload.room_status_id));
      fd.append('room_floor', String(payload.room_floor));
      fd.append('room_numbers', JSON.stringify(payload.room_numbers));
  
      const response = await axios.post(APIConn, fd);
  
      if (response.data && response.data.success) {
        setSuccess(response.data.message || 'Room numbers added successfully.');
        // Optionally navigate back to Rooms List
        setTimeout(() => {
          navigate('/admin/roomslist');
        }, 800);
      } else {
        setError(response.data && response.data.error ? response.data.error : 'Failed to add room numbers.');
      }
    } catch (err) {
      setError('An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lg:ml-72 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">New Room Numbers</h1>
      <p className="text-sm text-gray-600 mb-6">Create single or multiple room numbers for a room type. Floor accepts numbers only. Status defaults to Vacant.</p>

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="roomtype">Room Type</Label>
              <Select id="roomtype" value={form.roomtype_id} onChange={(e) => handleChange('roomtype_id', e.target.value)}>
                <option value="">Select Room Type</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="roomstatus">Room Status</Label>
              <Select id="roomstatus" value={form.room_status_id} onChange={(e) => handleChange('room_status_id', e.target.value)}>
                {statusOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="roomfloor">Room Floor</Label>
              <Input
                id="roomfloor"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.room_floor}
                onChange={(e) => handleChange('room_floor', e.target.value)}
                onKeyDown={(e) => {
                  // Allow: digits, backspace, tab, arrows, delete, home/end
                  const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Home','End'];
                  if (allowed.includes(e.key)) return;
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
              />
            </div>

            <div>
              <Label>Creation Mode</Label>
              <div className="flex gap-3 mt-1">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="mode" value="single" checked={form.mode === 'single'} onChange={(e) => handleChange('mode', e.target.value)} />
                  <span>Single</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="mode" value="multiple" checked={form.mode === 'multiple'} onChange={(e) => handleChange('mode', e.target.value)} />
                  <span>Multiple</span>
                </label>
              </div>
            </div>

            {form.mode === 'single' ? (
              <div>
                <Label htmlFor="singleno">Room Number</Label>
                <Input id="singleno" type="text" placeholder="e.g. 301" value={form.single_room_number} onChange={(e) => handleChange('single_room_number', e.target.value)} />
              </div>
            ) : (
              <div>
                <Label htmlFor="multipleno">Room Numbers (comma-separated)</Label>
                <Input id="multipleno" type="text" placeholder="e.g. 301,302,303" value={form.multiple_room_numbers} onChange={(e) => handleChange('multiple_room_numbers', e.target.value)} />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-sm">{success}</div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Create Room Numbers'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/roomslist')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

{duplicateDialog.show && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-2">This Room Number already exists in the database</h3>
      <p className="text-sm text-gray-600 mb-4">Duplicate numbers: {duplicateDialog.duplicates.join(', ')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setDuplicateDialog({ show: false, duplicates: [] })}>OK</Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}