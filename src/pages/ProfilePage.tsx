import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [wage, setWage] = useState(String(profile?.wage || ""));
  const [experience, setExperience] = useState(profile?.experience || "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        displayName,
        ...(profile.role === "worker" && {
          wage: Number(wage) || 0,
          experience,
          skills,
        }),
      });
      await refreshProfile();
      setEditing(false);
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
        <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-3">
            {profile?.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile?.displayName}</h2>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full capitalize">
            {profile?.role}
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Full Name</label>
            {editing ? (
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-11 rounded-xl bg-muted/50 border-0" />
            ) : (
              <p className="text-foreground font-medium">{profile?.displayName}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
            <p className="text-foreground font-medium">{profile?.email}</p>
          </div>

          {profile?.role === "worker" && (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Hourly Wage (₹)</label>
                {editing ? (
                  <Input type="number" value={wage} onChange={(e) => setWage(e.target.value)} className="h-11 rounded-xl bg-muted/50 border-0" />
                ) : (
                  <p className="text-foreground font-medium">₹{profile?.wage || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Experience</label>
                {editing ? (
                  <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 3 years" className="h-11 rounded-xl bg-muted/50 border-0" />
                ) : (
                  <p className="text-foreground font-medium">{profile?.experience || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Skills</label>
                {editing && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add skill"
                      className="h-11 rounded-xl bg-muted/50 border-0"
                    />
                    <Button type="button" onClick={addSkill} variant="outline" size="sm" className="rounded-xl">Add</Button>
                  </div>
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {skills.length > 0 ? skills.map((s) => (
                    <span key={s} className="bg-secondary/30 text-accent text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      {s}
                      {editing && <X className="h-3 w-3 cursor-pointer" onClick={() => setSkills(skills.filter(x => x !== s))} />}
                    </span>
                  )) : (
                    <p className="text-muted-foreground text-sm">No skills added</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            {editing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1 h-11 rounded-xl gradient-primary text-primary-foreground">
                  <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" className="h-11 rounded-xl">Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)} className="w-full h-11 rounded-xl gradient-accent text-accent-foreground">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
