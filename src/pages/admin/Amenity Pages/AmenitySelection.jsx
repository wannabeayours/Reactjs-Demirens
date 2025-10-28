import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/ui/data-table';
import { ArrowLeft, PackageSearch, Tag, ListOrdered } from 'lucide-react';

function AmenitySelection() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = (localStorage.getItem('url') || localStorage.url);
  const APIConn = `${baseUrl}customer.php`;

  // Preserve any selected booking room(s) passed from the modal
  const roomsPayload = {
    selectedBookingRooms: location.state?.selectedBookingRooms || [],
    selectedBookingRoom: location.state?.selectedBookingRoom || null,
  };

  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('operation', 'getAmenitiesMaster');
      const res = await axios.post(APIConn, fd);
      const arr = Array.isArray(res.data) ? res.data : [];

      // Exclude restricted items and "Room Extended Stay"
      const filteredBase = arr.filter((a) => {
        const name = String(a?.charges_master_name || '').trim().toLowerCase();
        const restrictedRaw = a?.charge_name_isRestricted;
        const isRestricted = restrictedRaw === 1 || restrictedRaw === '1' || restrictedRaw === true || String(restrictedRaw).toLowerCase() === 'true';
        return name !== 'room extended stay' && !isRestricted;
      });

      setAmenities(filteredBase);
    } catch (e) {
      console.error('Error fetching amenities:', e);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, [APIConn]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₱0.00';
    try {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    } catch {
      return '₱0.00';
    }
  };

  const onSelectAmenitySingle = (row) => {
    navigate('/admin/requestedamenities', {
      state: {
        openAmenityModal: true,
        selectedAmenities: [row],
        ...roomsPayload,
      },
    });
  };

  const columns = useMemo(() => [
    {
      header: 'Amenity',
      accessor: (row) => row?.charges_master_name || 'Unnamed',
      sortable: true,
      headerClassName: 'min-w-[220px]'
    },
    {
      header: 'Category',
      accessor: (row) => row?.charges_category_name || '—',
      sortable: true,
      cell: (row) => (
        <Badge variant="outline" className="text-xs">{row?.charges_category_name || '—'}</Badge>
      )
    },
    {
      header: 'Price',
      accessor: (row) => Number(row?.charges_master_price || 0),
      sortable: true,
      cell: (row) => <span className="font-medium">{formatCurrency(row?.charges_master_price || 0)}</span>,
      headerClassName: 'min-w-[120px]'
    },
    {
      header: 'Description',
      accessor: (row) => row?.charges_master_description || '',
      sortable: false,
      headerClassName: 'min-w-[280px]'
    },
  ], []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return amenities;
    return (amenities || []).filter((a) =>
      [a?.charges_master_name, a?.charges_category_name, a?.charges_master_description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [amenities, search]);

  const handleAddSelected = () => {
    if (!selected || selected.length === 0) return;
    navigate('/admin/requestedamenities', {
      state: {
        openAmenityModal: true,
        selectedAmenities: selected,
        ...roomsPayload,
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/requestedamenities')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Amenity Requests
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Choose Amenities</h1>
            <p className="text-muted-foreground">Select one or many amenities, then add to the modal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddSelected} disabled={selected.length === 0}>
            Add {selected.length > 0 ? `${selected.length} Selected` : 'Selected'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{amenities.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><ListOrdered className="h-3 w-3" />Paginated 10 per page</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Search Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search name, category, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-start gap-2">
              <Tag className="h-4 w-4 mt-0.5" />
              Click any row or checkbox to select/deselect. Use the button to add.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Amenities</CardTitle>
            <div>
              <Button onClick={handleAddSelected} disabled={selected.length === 0}>
                Add {selected.length > 0 ? `${selected.length} Selected` : 'Selected'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            itemsPerPage={10}
            idAccessor={'charges_master_id'}
            headerAction={null}
            hideSearch={true}
            tableCaption={filtered.length > 0 ? `${filtered.length} item(s)` : undefined}
            isSelectable={true}
            selectedData={(list) => setSelected(list || [])}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AmenitySelection;