import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  Briefcase,
  Star,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  wage: number;
  location: string;
  skills: string[];
  employerName: string;
  employerId: string;
  status: string;
  createdAt: unknown;
}

const WorkerDashboard = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  // Set of jobIds this worker has already applied to
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Load open jobs
  useEffect(() => {
    const q = query(collection(db, "jobs"), where("status", "==", "open"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job)));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Load which jobs this worker has already applied to
  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "applications"),
      where("workerId", "==", profile.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const ids = new Set(snap.docs.map((d) => d.data().jobId as string));
        setAppliedJobIds(ids);
      },
      (err) => {
        // Silently ignore permission errors until Firestore rules are updated
        console.warn("Applications listener error:", err.message);
      }
    );
    return unsub;
  }, [profile]);

  const toggleAvailability = async () => {
    if (!profile) return;
    await updateDoc(doc(db, "users", profile.uid), {
      available: !profile.available,
    });
    await refreshProfile();
  };

  const handleApply = async (job: Job) => {
    if (!profile) return;
    if (appliedJobIds.has(job.id)) return;

    setApplying(job.id);
    try {
      // Write to a separate 'applications' collection — workers always own these docs
      await addDoc(collection(db, "applications"), {
        jobId: job.id,
        jobTitle: job.title,
        workerId: profile.uid,
        workerName: profile.displayName || profile.email,
        employerId: job.employerId,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Application sent! ✅",
        description: `You applied for "${job.title}" by ${job.employerName || "Employer"}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Failed to apply",
        description: message,
        variant: "destructive",
      });
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hi, {profile?.displayName?.split(" ")[0] || "Worker"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Find work near you</p>
        </div>
        <button onClick={toggleAvailability} className="flex items-center gap-2">
          {profile?.available ? (
            <ToggleRight className="h-8 w-8 text-green-500" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 mb-6 ${
          profile?.available ? "gradient-primary" : "bg-muted"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              profile?.available
                ? "bg-green-300 animate-pulse"
                : "bg-muted-foreground"
            }`}
          />
          <span
            className={`font-semibold ${
              profile?.available
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {profile?.available ? "You're Available for Work" : "You're Offline"}
          </span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Briefcase, label: "Open Jobs", value: jobs.length },
          { icon: CheckCircle, label: "Applied", value: appliedJobIds.size },
          { icon: Star, label: "Rating", value: "4.8" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <h2 className="text-lg font-bold text-foreground mb-3">Nearby Jobs</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No jobs available right now</p>
          <p className="text-xs text-muted-foreground mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {jobs.map((job, i) => {
              const applied = appliedJobIds.has(job.id);
              const isApplying = applying === job.id;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground flex-1 mr-2">{job.title}</h3>
                    <span className="flex items-center text-primary font-bold text-sm whitespace-nowrap">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {job.wage}/hr
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location || "Nearby"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Recent
                    </span>
                    {job.employerName && (
                      <span className="font-medium text-foreground/60 truncate">
                        by {job.employerName}
                      </span>
                    )}
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="flex gap-1.5 mb-4 flex-wrap">
                      {job.skills.map((s) => (
                        <span
                          key={s}
                          className="bg-secondary/30 text-accent text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Apply Button */}
                  <Button
                    onClick={() => handleApply(job)}
                    disabled={applied || isApplying}
                    className={`w-full h-10 rounded-xl font-semibold transition-all ${
                      applied
                        ? "bg-green-500/20 text-green-600 border border-green-500/40 cursor-default hover:bg-green-500/20"
                        : "gradient-primary text-primary-foreground"
                    }`}
                    size="sm"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying…
                      </>
                    ) : applied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
