import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Plus, Clock, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  description: string;
  wage: number;
  location: string;
  status: string;
  applicants?: string[];
  createdAt: any;
}

const EmployerDashboard = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "jobs"), where("employerId", "==", profile.uid));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job)));
      setLoading(false);
    });
    return unsub;
  }, [profile]);

  const openJobs = jobs.filter((j) => j.status === "open");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hi, {profile?.displayName?.split(" ")[0] || "Employer"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Manage your workforce</p>
        </div>
        <Button
          onClick={() => navigate("/post-job")}
          className="rounded-xl gradient-primary text-primary-foreground"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Post Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Briefcase, label: "Active", value: openJobs.length, color: "text-primary" },
          { icon: Users, label: "Hired", value: jobs.filter(j => j.status === "in-progress").length, color: "text-secondary" },
          { icon: CheckCircle, label: "Done", value: completedJobs.length, color: "text-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
            <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* My Jobs */}
      <h2 className="text-lg font-bold text-foreground mb-3">My Jobs</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No jobs posted yet</p>
          <Button
            onClick={() => navigate("/post-job")}
            className="mt-4 rounded-xl gradient-primary text-primary-foreground"
          >
            Post Your First Job
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-foreground">{job.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  job.status === "open"
                    ? "bg-green-100 text-green-700"
                    : job.status === "in-progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {job.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{job.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />{job.location || "Location"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />₹{job.wage}/hr
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />{job.applicants?.length || 0} applicants
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
