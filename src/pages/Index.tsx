import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Briefcase, Users, MessageCircle, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const features = [
    { icon: MapPin, title: "Find Nearby", desc: "Discover workers and jobs around you with real-time maps" },
    { icon: Zap, title: "Smart Match", desc: "AI-powered matching based on skills, distance, and ratings" },
    { icon: MessageCircle, title: "Instant Chat", desc: "Connect directly with real-time messaging" },
    { icon: Shield, title: "Verified", desc: "Trusted profiles with reviews and work history" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="max-w-lg mx-auto px-6 pt-16 pb-12 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold text-gradient">Labour.in</span>
            </div>

            <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-4">
              Hire skilled workers
              <br />
              <span className="text-gradient">in minutes</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              India's real-time platform connecting workers and employers. Find, hire, and manage — all in one place.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/auth")}
                className="h-13 px-8 rounded-xl gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: "10K+", label: "Workers" },
            { value: "5K+", label: "Jobs" },
            { value: "50+", label: "Cities" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-gradient">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold text-foreground mb-4">Why Labour.in?</h2>
        <div className="space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card rounded-2xl p-5 flex gap-4"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-0.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-lg mx-auto px-6 pb-12">
        <div className="gradient-primary rounded-2xl p-6 text-center">
          <Users className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
          <h3 className="text-lg font-bold text-primary-foreground mb-1">Ready to get started?</h3>
          <p className="text-sm text-primary-foreground/80 mb-4">Join thousands of workers and employers</p>
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            className="rounded-xl bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
          >
            Sign Up Free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
