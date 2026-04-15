import { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { MapPin, Users, Briefcase } from "lucide-react";

interface MapWorker {
  id: string;
  displayName: string;
  location: { lat: number; lng: number };
  skills: string[];
  available: boolean;
}

interface MapJob {
  id: string;
  title: string;
  location: string;
  wage: number;
  geopoint?: { lat: number; lng: number };
}

const MapPage = () => {
  const { profile } = useAuth();
  const [workers, setWorkers] = useState<MapWorker[]>([]);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 }); // Default Delhi
  const [viewMode, setViewMode] = useState<"workers" | "jobs">("workers");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBYOOeGE3d0f9TWdgCIt-p9d8usNt4aw_4",
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "worker"), where("available", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setWorkers(
        snap.docs
          .filter((d) => d.data().location)
          .map((d) => ({ id: d.id, ...d.data() } as MapWorker))
      );
    });
    return unsub;
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Map</h1>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setViewMode("workers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "workers" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Workers
          </button>
          <button
            onClick={() => setViewMode("jobs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "jobs" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" /> Jobs
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden glass-card h-[60vh]">
        {isLoaded ? (
          <GoogleMap
            center={center}
            zoom={13}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                { featureType: "poi", stylers: [{ visibility: "off" }] },
              ],
            }}
          >
            <MarkerF position={center} title="You" />
            {viewMode === "workers" &&
              workers.map((w) => (
                <MarkerF
                  key={w.id}
                  position={w.location}
                  title={w.displayName}
                />
              ))}
          </GoogleMap>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading map...</div>
          </div>
        )}
      </motion.div>

      <div className="mt-4 glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{workers.length} available workers nearby</span>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
