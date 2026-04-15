import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  Mail,
  Star,
  Briefcase,
  CheckCircle,
  Clock,
  IndianRupee,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  workerId: string | null;
  workerName: string;
  applicationStatus: string;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  isUpdating: boolean;
}

const WorkerProfileModal = ({
  workerId,
  workerName,
  applicationStatus,
  onClose,
  onAccept,
  onReject,
  isUpdating,
}: Props) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    getDoc(doc(db, "users", workerId)).then((snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
      setLoading(false);
    });
  }, [workerId]);

  const initials = workerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      {workerId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-background rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "88vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(88vh - 20px)" }}>
              {/* Header banner */}
              <div className="gradient-primary px-6 pt-6 pb-16 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-primary-foreground/70 hover:text-primary-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <p className="text-primary-foreground/70 text-sm font-medium">Applicant Profile</p>
                <h2 className="text-2xl font-bold text-primary-foreground mt-0.5">
                  {workerName}
                </h2>
              </div>

              {/* Avatar overlapping banner */}
              <div className="px-6 relative -mt-10 mb-4">
                <div className="h-20 w-20 rounded-2xl gradient-primary shadow-lg flex items-center justify-center border-4 border-background">
                  <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
                </div>
              </div>

              {loading ? (
                <div className="px-6 pb-8 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="px-6 pb-6 space-y-4">

                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        profile?.available
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {profile?.available ? "✅ Available for Work" : "⏸ Not Available"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize bg-muted px-3 py-1 rounded-full">
                      {profile?.role || "worker"}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="glass-card rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Contact
                    </p>
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{profile?.email || "—"}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-3 text-sm text-foreground">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-3 text-sm text-foreground">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                          {profile.location.lat.toFixed(4)}, {profile.location.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Work details */}
                  <div className="glass-card rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Work Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 text-sm">
                        <IndianRupee className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Expected Wage</p>
                          <p className="font-semibold text-foreground">
                            {profile?.wage ? `₹${profile.wage}/hr` : "Negotiable"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="font-semibold text-foreground">
                            {profile?.experience || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Star className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-semibold text-foreground">4.8 ★</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Jobs Done</p>
                          <p className="font-semibold text-foreground">—</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="glass-card rounded-2xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                          <span
                            key={s}
                            className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!profile?.skills?.length && (
                    <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No skills listed yet</p>
                    </div>
                  )}

                  {/* Accept / Reject — only show if still pending */}
                  {applicationStatus === "pending" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        onClick={onReject}
                        disabled={isUpdating}
                        variant="outline"
                        className="h-12 rounded-2xl font-bold border-red-300 text-red-500 hover:bg-red-50"
                      >
                        ✗ Reject
                      </Button>
                      <Button
                        onClick={onAccept}
                        disabled={isUpdating}
                        className="h-12 rounded-2xl font-bold bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  )}

                  {applicationStatus === "accepted" && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-2xl text-green-700 font-semibold text-sm">
                      <CheckCircle className="h-4 w-4" /> Applicant Accepted
                    </div>
                  )}

                  {applicationStatus === "rejected" && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-2xl text-red-500 font-semibold text-sm">
                      ✗ Applicant Rejected
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WorkerProfileModal;
