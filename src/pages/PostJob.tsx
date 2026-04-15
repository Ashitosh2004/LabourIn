import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, IndianRupee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const PostJob = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wage, setWage] = useState("");
  const [location, setLocation] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "jobs"), {
        title,
        description,
        wage: Number(wage),
        location,
        skills,
        employerId: profile.uid,
        employerName: profile.displayName || profile.email,
        status: "open",
        applicants: [],
        createdAt: serverTimestamp(),
      });
      toast({ title: "Job posted!", description: "Workers can now see your job." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-6">Post a Job</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Job Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Plumber needed" className="h-12 rounded-xl bg-muted/50 border-0" required />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work..." className="rounded-xl bg-muted/50 border-0 min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Wage (₹/hr)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input type="number" value={wage} onChange={(e) => setWage(e.target.value)} placeholder="500" className="pl-11 h-12 rounded-xl bg-muted/50 border-0" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Area" className="pl-11 h-12 rounded-xl bg-muted/50 border-0" required />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Skills Required</label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add a skill"
                className="h-12 rounded-xl bg-muted/50 border-0"
              />
              <Button type="button" onClick={addSkill} variant="outline" className="h-12 rounded-xl">Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {skills.map((s) => (
                  <span key={s} className="bg-secondary/30 text-accent text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    {s}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))} />
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">
            {submitting ? "Posting..." : "Post Job"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default PostJob;
