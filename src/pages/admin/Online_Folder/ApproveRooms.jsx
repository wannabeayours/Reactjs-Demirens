// src/admin/approval/ApproveRooms.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const currency = (n) => `₱${Number(n || 0).toLocaleString()}`;

export default function ApproveRooms() {
  const APIConn = `${localStorage.url}admin.php`;
  const { bookingId: bookingIdParam } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useApproval();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const bookingId = state.bookingId || Number(bookingIdParam);

  useEffect(() => {
    // Basic guard if someone opens URL directly without context
    if (!state.bookingId) {
      // You could redirect back:
      navigate("/admin/online");
      // But we'll allow it; just proceed to fetch and let them pick.
    }
  }, [state.bookingId]);

  const fetchAvailableRooms = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      // If your API supports filtering by types, send JSON here:
      // fd.append("json", JSON.stringify({ roomtype_ids: state.requestedRoomTypes.map(t => t.id) }));
      fd.append("method", "view_rooms");
      const res = await axios.post(APIConn, fd);
      const data = Array.isArray(res.data) ? res.data : [];

      setRooms(data);
    } catch (err) {
      console.error("Error fetching available rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter: only room types requested for this booking
  const requestedTypeNames = useMemo(
    () => new Set((state.requestedRoomTypes || []).map((t) => (t?.name || "").toLowerCase())),
    [state.requestedRoomTypes]
  );

  const filteredByType = useMemo(
    () =>
      rooms.filter((room) =>
        requestedTypeNames.size
          ? requestedTypeNames.has((room.roomtype_name || "").toLowerCase())
          : true
      ),
    [rooms, requestedTypeNames]
  );

  const finalList = useMemo(
    () =>
      filteredByType.filter(
        (room) =>
          room.roomtype_name?.toLowerCase().includes(search.toLowerCase()) ||
          room.roomtype_description?.toLowerCase().includes(search.toLowerCase())
      ),
    [filteredByType, search]
  );

  // Selected rooms (limit: requestedRoomCount)
  const [selected, setSelected] = useState(state.selectedRooms || []);
  const maxSelect = state.requestedRoomCount || 1;
  const remaining = Math.max(0, maxSelect - selected.length);

  const toggle = (room) => {
    const exists = selected.some((r) => r.id === room.roomnumber_id);
    if (exists) {
      setSelected((prev) => prev.filter((r) => r.id !== room.roomnumber_id));
    } else {
      if (selected.length >= maxSelect) return; // enforce limit
      setSelected((prev) => [
        ...prev,
        {
          id: room.roomnumber_id,
          roomtype_name: room.roomtype_name,
          price: Number(room.roomtype_price || 0),
        },
      ]);
    }
  };

  const proceed = () => {
    if (selected.length !== maxSelect) {
      alert(`Please select exactly ${maxSelect} room(s).`);
      return;
    }
    setState((prev) => ({ ...prev, selectedRooms: selected }));
    navigate(`/admin/receipt/${bookingId}`);
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Approve Booking #{bookingId} — Step 1: Choose Available Rooms
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Customer: <span className="font-medium">{state.customerName || "-"}</span> • Dates:{" "}
          <span className="font-medium">{state.checkIn}</span> →{" "}
          <span className="font-medium">{state.checkOut}</span> • Nights:{" "}
          <span className="font-medium">{state.nights}</span>
        </p>

        {/* Requested Summary */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            Requested Rooms: <span className="font-semibold">{maxSelect}</span>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            Remaining to select:{" "}
            <span className="font-semibold">{remaining}</span>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            Types:{" "}
            {(state.requestedRoomTypes || []).map((t) => t.name).join(", ") || "-"}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading rooms…</p>
        ) : finalList.length === 0 ? (
          <p className="text-center text-red-500 font-semibold">No Available Rooms</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finalList.map((room, i) => {
              const imgs = room.images ? room.images.split(",").map((s) => s.trim()) : [];
              const isPicked = selected.some((r) => r.id === room.roomnumber_id);

              return (
                <div
                  key={`${room.roomnumber_id}-${i}`}
                  className={`border rounded-xl shadow-sm bg-card overflow-hidden ${
                    isPicked ? "ring-2 ring-green-500" : ""
                  }`}
                >
                  <Carousel className="relative">
                    <CarouselContent>
                      {imgs.length ? (
                        imgs.map((img, idx) => (
                          <CarouselItem key={idx}>
                            <img
                              src={`http://localhost/demirenAPI/images/${img}`}
                              alt={room.roomtype_name}
                              className="w-full h-56 object-cover"
                            />
                          </CarouselItem>
                        ))
                      ) : (
                        <CarouselItem>
                          <div className="w-full h-56 flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No Image</span>
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">
                        {room.roomtype_name} — Room #{room.roomnumber_id} (Floor {room.roomfloor})
                      </h2>
                      <span className="font-bold text-green-600">
                        {currency(room.roomtype_price)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {room.roomtype_description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Capacity: {room.room_capacity}
                    </p>

                    <button
                      onClick={() => toggle(room)}
                      className={`mt-3 px-4 py-2 rounded text-white ${
                        isPicked
                          ? "bg-green-600 hover:bg-green-700"
                          : selected.length >= maxSelect
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                      disabled={!isPicked && selected.length >= maxSelect}
                    >
                      {isPicked ? "Selected" : "Select Room"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => navigate("/admin/online")}
            className="px-4 py-2 rounded border border-border bg-card hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={proceed}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={selected.length !== maxSelect}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </>
  );
}
